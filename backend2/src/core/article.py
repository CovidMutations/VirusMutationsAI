import logging
from datetime import date, timedelta, datetime
from http.client import HTTPResponse
from typing import Optional, List, TypedDict, Set
from uuid import uuid4, UUID

from Bio import Entrez
from sqlalchemy import desc
from sqlalchemy.dialects.postgresql import insert

from src.core.article_parser import get_article_parser
from src.core.config import settings
from src.db.models import ArticleFetchLog, Article
from src.db.models.article import ArticleStatus, ArticleData, ArticleMutation
from src.db.session import SessionLocal

logger = logging.getLogger(__name__)

ENTREZ_DATE_FORMAT = "%Y/%m/%d"


class ArticleDataDict(TypedDict):
    url: Optional[str]
    title: Optional[str]
    abstract: Optional[str]
    mutations: Optional[Set[str]]
    publishing_date: Optional[date]


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

    def fetch_and_save_new_article_ids(self) -> int:
        """Fetches external article IDs and returns them"""
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
                    "source": "pmc",
                    "body": "",
                    "status": ArticleStatus.NEW,
                    "message": ""
                } for id_ in ids
            ]).on_conflict_do_update(
                index_elements=[Article.external_id],
                set_={"status": ArticleStatus.NEW, "updated": datetime.utcnow()}
            )
            self.db.execute(bulk_insert)

        self.db.add(ArticleFetchLog(id=str(uuid4()), start_date=start, end_date=end, message=message))
        self.db.commit()

        return len(ids)

    def fetch_and_save_article(self, id_: UUID):
        article = self.db.query(Article).filter(Article.id == id_).with_for_update(key_share=True).first()

        if not article:
            raise RuntimeError(f'Article {id_} not found')

        try:
            self._update_article_body(article)
        finally:
            self.db.commit()

    def fetch_and_save_new_article(self):
        article = self.db.query(Article)\
            .filter(Article.status == ArticleStatus.NEW)\
            .with_for_update(skip_locked=True, key_share=True)\
            .first()

        if not article:
            return

        try:
            self._update_article_body(article)
        finally:
            self.db.commit()

    def parse_article(self, id_):
        article = self.db.query(Article).filter(Article.id == id_).with_for_update(key_share=True).first()

        if not article:
            raise RuntimeError(f'Article {id_} not found')

        allowed_statuses = {ArticleStatus.FETCHED, ArticleStatus.PARSED}
        if article.status not in allowed_statuses:
            raise RuntimeError(f"Article body hasn't been fetched. Please fetch it first")

        try:
            self._parse_and_save_article_data(article)
        except Exception as e:
            logger.warning(f'Cannot parse article {article.id} body: {e}')
            article.status = ArticleStatus.ERROR
            article.message = str(e)
        else:
            article.status = ArticleStatus.PARSED

        self.db.commit()

    def parse_new_article(self):
        article = self.db.query(Article) \
            .filter(Article.status == ArticleStatus.FETCHED) \
            .with_for_update(skip_locked=True, key_share=True) \
            .first()

        if not article:
            return False

        try:
            self._parse_and_save_article_data(article)
        except Exception as e:
            logger.warning(f'Cannot parse article {article.id} body: {e}')
            article.status = ArticleStatus.ERROR
            article.message = str(e)
        else:
            article.status = ArticleStatus.PARSED

        self.db.commit()
        return True

    def parse_all_new_articles(self):
        while True:
            if self.parse_new_article() is False:
                break

    def _parse_article(self, article) -> ArticleDataDict:
        article_parser = get_article_parser(article)  # catch exception

        if article_parser is None:
            raise TypeError(f'Cannot instantiate parser for source={article.source}')

        title = article_parser.title()
        mutations = article_parser.mutations()
        abstract = article_parser.abstract()
        url = article_parser.url()
        publishing_date = article_parser.publishing_date()

        return ArticleDataDict(title=title, mutations=mutations, abstract=abstract,
                               url = url, publishing_date = publishing_date)

    def _parse_and_save_article_data(self, article: Article):
        data = self._parse_article(article)

        logger.info(f'{len(data["mutations"])} mutations found for article {article.id}')
        logger.debug('Mutations for article {article.id}: ' + ', '.join(data["mutations"]))

        self._save_article_data(article, data)

    def _save_article_data(self, article: Article, data: ArticleDataDict):
        base_data_keys = {"title", "abstract", "url", "publishing_date"}
        base_data = {key: value for (key, value) in data.items() if key in base_data_keys}
        insert_statement = insert(ArticleData).values({**base_data, **{"id": article.id}}).on_conflict_do_update(
            index_elements=[ArticleData.id],
            set_={**base_data, **{"updated": datetime.utcnow()}}
        )
        self.db.execute(insert_statement)
        self.db.flush()

        if data["mutations"]:
            self.db.query(ArticleMutation).filter(ArticleMutation.article_id == article.id).delete()
            self.db.add_all([
                ArticleMutation(article_id=article.id, mutation=m) for m in data["mutations"]
            ])

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
