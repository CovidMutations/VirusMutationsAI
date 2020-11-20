from enum import unique, Enum
from uuid import uuid4

from sqlalchemy import Column, Enum as EnumType, UnicodeText, PrimaryKeyConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy_utils import Timestamp

from src.db.base import Base


@unique
class MessageStatus(Enum):
    NEW = "new"
    OK = "ok"
    ERROR = "error"


class MessageQueue(Base, Timestamp):
    __tablename__ = "message_queue"
    __table_args__ = (
        PrimaryKeyConstraint("id"),
    )

    id = Column(UUID(as_uuid=True), nullable=False, default=uuid4)
    to = Column(UnicodeText, nullable=False)
    subject = Column(UnicodeText, nullable=False)
    contents = Column(UnicodeText, nullable=False)
    status = Column(EnumType(MessageStatus), nullable=False)
    message = Column(UnicodeText, nullable=False)
