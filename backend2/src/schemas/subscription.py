from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class Subscription(BaseModel):
    user_id: UUID
    mutation: str
