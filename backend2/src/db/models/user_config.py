from sqlalchemy import Column
from sqlalchemy import Integer, PrimaryKeyConstraint, ForeignKeyConstraint
from sqlalchemy.dialects.postgresql import UUID

from src.db.base import Base


class UserConfig(Base):
    __tablename__ = "user_config"

    user_id = Column(UUID, primary_key=True)
    subscription_interval = Column(Integer, default=0)

    __table_args__ = (
        PrimaryKeyConstraint('user_id'),
        ForeignKeyConstraint(['user_id'], ['user.id'], onupdate='CASCADE', ondelete='CASCADE'),
    )
