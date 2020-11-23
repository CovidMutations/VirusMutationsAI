from typing import Callable

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from src.core.config import settings

engine = create_engine(settings.SQLALCHEMY_DATABASE_URI, pool_pre_ping=True, echo=settings.LOG_QUERIES)
SessionLocal: Callable[[], Session] = sessionmaker(autocommit=False, autoflush=False, bind=engine)
