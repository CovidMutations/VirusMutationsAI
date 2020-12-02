import re
from typing import Set

from lxml import etree


class ArticleXml:
    def __init__(self, data_xml: str):
        self.raw_data = data_xml
        self.tree = etree.fromstring(data_xml)  # catch exception

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
        text = re.sub('<[^<]+>', "", self.raw_data)  # Strip all xml tags

        muts.update(re.findall(r'[A-Z]\d+[A-Z]', text))  # Find patterns like P223Q

        # Find patterns like "223 A > T", "223 A &gt; T" and convert them to canonical form "223A>T"
        strings = re.findall(r'\d+ *[ACGT]+ *(?:&gt;|>) *[ACGT]+', text)
        for ss in strings:
            m = re.search(r'(?P<pos>\d+) *(?P<from>[ACGT]+) *(:?&gt;|>) *(?P<to>[ACGT]+)', ss)
            mut = f"{m.group('pos')}{m.group('from')}>{m.group('to')}"
            muts.add(mut)

        return muts

    def abstract(self) -> str:
        parts = self.tree.findall(".//front/article-meta/abstract/*")
        text = "\n".join(etree.canonicalize(part, strip_text=True) for part in parts)

        return text
