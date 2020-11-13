from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field, StrictInt


class UserConfig(BaseModel):
    user_id: UUID
    subscription_interval: Optional[int] = Field(..., description="Subscription interval in days")


class UserConfigSubscriptionIntervalIn(BaseModel):
    subscription_interval: StrictInt = Field(..., description="Subscription interval in days")
