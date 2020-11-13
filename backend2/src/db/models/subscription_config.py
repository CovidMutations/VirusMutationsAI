from sqlalchemy import Column
from sqlalchemy import DateTime, PrimaryKeyConstraint, ForeignKeyConstraint
from sqlalchemy.dialects.postgresql import UUID

from src.db.base import Base


class SubscriptionConfig(Base):
    __tablename__ = "subscription_config"

    user_id = Column(UUID, primary_key=True)
    last_send = Column(DateTime)

    __table_args__ = (
        PrimaryKeyConstraint('user_id'),
        ForeignKeyConstraint(['user_id'], ['user.id'], onupdate='CASCADE', ondelete='CASCADE'),
    )
