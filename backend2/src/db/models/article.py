from enum import Enum, unique
from uuid import uuid4

from markupsafe import Markup
from sqlalchemy import Column, UnicodeText, Index, Date, Enum as EnumType, ForeignKeyConstraint, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy_utils import Timestamp

from src.db.base import Base


@unique
class ArticleStatus(Enum):
    NEW = "new"
    FETCHED = "fetched"
    PARSED = "parsed"
    ERROR = "error"


class ArticleFetchLog(Base, Timestamp):
    __tablename__ = "article_fetch_log"
    __table_args__ = (
        PrimaryKeyConstraint("id"),
        Index("article_fetch_log__end_date__idx", "end_date"),
    )

    id = Column(UUID(as_uuid=True), nullable=False, default=uuid4)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    message = Column(UnicodeText, nullable=False)


class Article(Base, Timestamp):
    __tablename__ = "article"
    __table_args__ = (
        PrimaryKeyConstraint("id"),
        Index("article__created__idx", "created"),
        Index("article__external_id__idx", "external_id", unique=True),
    )

    id = Column(UUID(as_uuid=True), nullable=False, default=uuid4)
    external_id = Column(UnicodeText, nullable=False)
    body = Column(UnicodeText, nullable=False)
    status = Column(EnumType(ArticleStatus), nullable=False)
    message = Column(UnicodeText, nullable=False)


class ArticleData(Base, Timestamp):
    __tablename__ = "article_data"
    __table_args__ = (
        PrimaryKeyConstraint("id"),
        ForeignKeyConstraint(("id",), [Article.id], onupdate='CASCADE', ondelete='RESTRICT'),
        Index("article_data__created__idx", "created"),
    )

    id = Column(UUID(as_uuid=True), nullable=False, default=uuid4)
    title = Column(UnicodeText, nullable=False)
    url = Column(UnicodeText, nullable=False)
    abstract = Column(UnicodeText, nullable=False, server_default='')
    mutations = relationship("ArticleMutation", back_populates="article_data")

    @property
    def abstract_text(self):
        return Markup(self.abstract).striptags()


class ArticleMutation(Base):
    __tablename__ = "article_mutation"
    __table_args__ = (
        PrimaryKeyConstraint('article_id', 'mutation'),
        ForeignKeyConstraint(('article_id',), [ArticleData.id], onupdate='CASCADE', ondelete='CASCADE'),
        Index("article_mutation__mutation__idx", "mutation"),
    )

    article_id = Column(UUID(as_uuid=True), nullable=False, default=uuid4)
    article_data = relationship('ArticleData', back_populates="mutations")
    mutation = Column(UnicodeText, nullable=False)
