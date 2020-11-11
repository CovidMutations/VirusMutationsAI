from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class User_config(BaseModel):
    user_id: UUID
    subscription_interval: int
