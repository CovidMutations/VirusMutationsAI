from typing import Optional, List, Dict

from pydantic import BaseModel


class ArticleSearchIn(BaseModel):
    mutation: str


class ArticleSearchItem(BaseModel):
    base_mutation: str = ""
    base_mutation_src: Optional[str]
    article_name: str
    article_url: str
    abstract_text: str = ""


ArticleSearchOut = Dict[str, List[ArticleSearchItem]]
