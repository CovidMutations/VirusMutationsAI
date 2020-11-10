from sqlalchemy import Column, text, UnicodeText, TIMESTAMP, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID

from src.db.session import Base


class Subscription(Base):
    __tablename__ = "subscription"

    user_id = Column(UUID, primary_key=True)
    mutation = Column(UnicodeText, primary_key=True, nullable=False)
