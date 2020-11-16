from sqlalchemy import Column, UnicodeText, PrimaryKeyConstraint, ForeignKeyConstraint
from sqlalchemy.dialects.postgresql import UUID

from src.db.base import Base


class Subscription(Base):
    __tablename__ = "subscription"

    user_id = Column(UUID, primary_key=True)
    mutation = Column(UnicodeText, primary_key=True, nullable=False)

    __table_args__ = (
        PrimaryKeyConstraint('user_id', 'mutation'),
        ForeignKeyConstraint(['user_id'], ['user.id'], onupdate='CASCADE', ondelete='CASCADE'),
    )
