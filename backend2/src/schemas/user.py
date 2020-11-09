from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class UserBase(BaseModel):
    username: str
    email: str


class User(UserBase):
    id: UUID
    active: bool
    created: datetime

    class Config:
        orm_mode = True


class UserCreate(UserBase):
    password: str
