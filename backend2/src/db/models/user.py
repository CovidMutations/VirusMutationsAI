from sqlalchemy import Column, text, UnicodeText, TIMESTAMP, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID

from src.db.base import Base


class User(Base):
    __tablename__ = "user"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("uuid_generate_v4()"))
    created = Column(TIMESTAMP, nullable=False, server_default=text("now()"))
    username = Column(UnicodeText, nullable=False)
    email = Column(UnicodeText, nullable=False, unique=True)
    password = Column(UnicodeText, nullable=False)
    salt = Column(UnicodeText, nullable=False)
    active = Column(Boolean, nullable=False)
    verification_code = Column("verificationCode", Integer, nullable=False)
