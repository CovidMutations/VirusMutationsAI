import logging
from datetime import date, timedelta, datetime
from http.client import HTTPResponse
from typing import Optional, List
from uuid import uuid4, UUID

from Bio import Entrez
from sqlalchemy import desc
from sqlalchemy.dialects.postgresql import insert

from src.core.config import settings
from src.db.models import ArticleFetchLog, Article
from src.db.models.article import ArticleStatus
from src.db.session import SessionLocal

logger = logging.getLogger(__name__)

ENTREZ_DATE_FORMAT = "%Y/%m/%d"


class ArticleCoreService:
    def __init__(self, ncbi_db: str = "pmc"):
        self.db = SessionLocal()
        self.ncbi_db = ncbi_db

        Entrez.email = settings.ENTREZ_EMAIL
        self.entrez = Entrez

    def get_last_fetch_date(self) -> Optional[date]:
        log: ArticleFetchLog = self.db.query(ArticleFetchLog).order_by(desc(ArticleFetchLog.end_date)).first()
        return log.end_date if log else None

    def fetch_article_ids_for_period(self, start: date, end: date) -> List[str]:
        query = 'SARS-CoV-2 mutation AND "open access"[filter]'  # less articles but more relevant content
        # query = 'SARS-CoV-2AND "open access"[filter]' #more articles but less relevant content

        if end - start < timedelta(0):  # end == start is Ok. It means fetch for exactly one day
            logger.warning(f'Cannot fetch article IDs: end {end} is less then start {start}')
            return []

        ids = []
        pagesize = 500
        offset = 0
        while True:
            page_ids = self._fetch_article_ids_for_period_paged(query, start, end, pagesize, offset)
            if not page_ids:
                break

            ids += page_ids
            offset += pagesize

        return ids

    def fetch_and_save_new_article_ids(self):
        last_fetch_date = self.get_last_fetch_date()
        if last_fetch_date:
            start = last_fetch_date + timedelta(days=1)  # next day after last fetch
        else:
            start = date.min

        end = date.today() - timedelta(days=1)  # yesterday

        ids = self.fetch_article_ids_for_period(start, end)
        message = f"Fetched {len(ids)} new article IDs"

        if ids:
            bulk_insert = insert(Article).values([
                {
                    "id": str(uuid4()),
                    "external_id": id_,
                    "body": "",
                    "status": ArticleStatus.NEW,
                    "message": ""
                } for id_ in ids
            ]).on_conflict_do_update(
                index_elements=[Article.external_id],
                set_={"status": ArticleStatus.NEW, "updated": datetime.utcnow()}
            )
            self.db.get_bind().execute(bulk_insert)

        self.db.add(ArticleFetchLog(id=str(uuid4()), start_date=start, end_date=end, message=message))
        self.db.commit()

    def fetch_and_save_article(self, id_: UUID):
        article = self.db.query(Article).filter(Article.id == id_).with_for_update().first()

        if not article:
            raise RuntimeError(f'Article {id_} not found')

        try:
            self._update_article_body(article)
        finally:
            self.db.commit()

    def fetch_and_save_new_article(self):
        article = self.db.query(Article)\
            .filter(Article.status == ArticleStatus.NEW)\
            .with_for_update(skip_locked=True)\
            .first()

        if not article:
            return

        try:
            self._update_article_body(article)
        finally:
            self.db.commit()

    def _fetch_article_ids_for_period_paged(self,
                                            query: str, start: date, end: date, limit=100000, offset=0) -> List[str]:
        mindate = start.strftime(ENTREZ_DATE_FORMAT)
        maxdate = end.strftime(ENTREZ_DATE_FORMAT)

        logger.info(f'Fetching article IDs from {mindate} till {maxdate}, limit: {limit}, offset: {offset}')

        handle = self.entrez.esearch(
            db=self.ncbi_db,
            term=query,
            mindate=mindate,
            maxdate=maxdate,
            datetype='pdat',
            retmax=limit,
            retstart=offset,
        )
        record = self.entrez.read(handle)
        handle.close()

        ids = record["IdList"]

        logger.info(f'Fetched {len(ids)} IDs')
        logger.debug('IDs: ' + ', '.join(ids))

        return ids

    def _update_article_body(self, article: Article) -> Article:
        try:
            response: HTTPResponse = self.entrez.efetch(
                db=self.ncbi_db,
                id=article.external_id,
                rettype="xml",
                retmode="text"
            )
            raw_body = response.read()
            charset = response.headers.get_content_charset('utf-8')
            body = raw_body.decode(charset)
        except Exception as e:
            logger.warning(f'Error while fetching article {article.id}: {e}')
            article.status = ArticleStatus.ERROR
            article.message = str(e)
        else:
            logger.info(f'Article {article.id} fetched')
            logger.debug(f'Article {article.id} body: {body}')
            article.status = ArticleStatus.FETCHED
            article.body = body
        finally:
            response.close()

        return article
