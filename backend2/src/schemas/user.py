from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    username: str
    email: EmailStr


class User(UserBase):
    id: UUID
    active: bool
    created: datetime

    class Config:
        orm_mode = True


class UserCreate(UserBase):
    password: str


class Code(BaseModel):
    code: int
