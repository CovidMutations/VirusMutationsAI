import re
from typing import Set
from src.db.models import Article
import csv
from lxml import etree
from datetime import date

class ArticlePmc:
    """ Parser implementation for PMC article format """

    SOURCE_NAME = "pmc"
    PMC_BASE_URL = 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC'

    def __init__(self, article: Article):
        self.article = article
        self.tree = etree.fromstring(article.body)  # catch exception

    def title(self) -> str:
        title = self.tree.find('.//front/article-meta/title-group/article-title').text.strip()
        if not title:
            title_node = self.tree.find('.//front/article-meta/title-group/article-title/*')
            title = title_node.text + (title_node.tail if title_node.tail else '')

        title = title.replace('\n', '')  # replace all multi-line titles to one-line
        title = title.replace('‐', '-')  # replace unicode '-' to ascii '-'

        return title

    def mutations(self) -> Set[str]:
        muts = set()
        text = re.sub('<[^<]+>', "", self.article.body)  # Strip all xml tags

        muts.update(re.findall(r'[A-Z]\d+[A-Z]', text))  # Find patterns like P223Q

        # Find patterns like "223 A > T", "223 A &gt; T" and convert them to canonical form "223A>T"
        strings = re.findall(r'\d+ *[ACGT]+ *(?:&gt;|>) *[ACGT]+', text)
        for ss in strings:
            m = re.search(r'(?P<pos>\d+) *(?P<from>[ACGT]+) *(:?&gt;|>) *(?P<to>[ACGT]+)', ss)
            mut = f"{m.group('pos')}{m.group('from')}>{m.group('to')}"
            muts.add(mut)

        return muts

    def abstract(self) -> str:
        try:
            parts = self.tree.findall(".//front/article-meta/abstract/*")
            text = "\n".join(etree.canonicalize(part, strip_text=True) for part in parts)
        except:
            text = ''

        return text

    def url(self) -> str:

        return f"{self.PMC_BASE_URL}{self.article.external_id}"

    def publish_date(self) -> date:
        try:
            year = int(self.tree.findall(".//front/article-meta/pub-date/year")[0].text)
        except:
            year = 2020
        try:
            month = int(self.tree.findall(".//front/article-meta/pub-date/month")[0].text)
        except:
            month = 1
        try:
            day = int(self.tree.findall(".//front/article-meta/pub-date/day")[0].text)
        except:
            day = 1

        try:
            date(year, month, day)
        except:
            day = 1

        return date(year, month, day)

class ArticleCord:
    """ Parser implementation for CORD19 article format """

    SOURCE_NAME = "cord19_pdf"
    META_KEYS = ['cord_uid', 'sha', 'source_x', 'title', 'doi', 'pmcid', 'pubmed_id', 'license',
                 'abstract', 'publish_time', 'authors', 'journal', 'mag_id', 'who_covidence_id',
                 'arxiv_id', 'pdf_json_files', 'pmc_json_files', 'url', 's2_id']

    def __init__(self, article: Article):
        self.article = article
        meta_values = ['{}'.format(x) for x in list(csv.reader([article.meta], delimiter=',', quotechar='"'))[0]]

        if len(self.META_KEYS) != len(meta_values):
            raise TypeError(f'CORD19 format mismatch, keys_n={len(self.META_KEYS)} values_n={len(meta_values)}')

        self.meta = dict(zip(self.META_KEYS, meta_values))

    def title(self) -> str:
        return self.meta['title']

    def mutations(self) -> Set[str]:
        muts = set()
        text = re.sub('<[^<]+>', "", self.article.body)  # Strip all xml tags

        muts.update(re.findall(r'[A-Z]\d+[A-Z]', text))  # Find patterns like P223Q

        # Find patterns like "223 A > T" and convert them to canonical form "223A>T"
        strings = re.findall(r'\d+ *[ACGT]+ *(?:>) *[ACGT]+', text)
        for ss in strings:
            m = re.search(r'(?P<pos>\d+) *(?P<from>[ACGT]+) *(:?>) *(?P<to>[ACGT]+)', ss)
            mut = f"{m.group('pos')}{m.group('from')}>{m.group('to')}"
            muts.add(mut)

        return muts

    def abstract(self) -> str:
        return self.meta['abstract']

    def url(self) -> str:
        return self.meta['url'].split(';')[0]

    def publish_date(self) -> date:
        year, month, day = [int(i) for i in self.meta['publish_time'].split('-')]

        return date(year, month, day)

def get_article_parser(article: Article):
    """ Factory method: choose a parser by source """

    parsers = {
        ArticlePmc.SOURCE_NAME: ArticlePmc,
        ArticleCord.SOURCE_NAME: ArticleCord
    }

    return parsers[article.source](article)
