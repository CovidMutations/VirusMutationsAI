from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session

from src import schemas
from src.api import deps
from src.db import models

router = APIRouter()


@router.put("/config/subscription-interval", response_model=int, status_code=status.HTTP_201_CREATED)
def set_subscription_interval(
    *,
    item_in: schemas.UserConfigSubscriptionIntervalIn,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Set subscription interval
    """
    subscription_interval = timedelta(days=item_in.subscription_interval)
    interval = models.UserConfig(user_id=user.id, subscription_interval=subscription_interval)
    db.merge(interval)
    db.commit()

    return interval.subscription_interval.days


@router.get("/config/subscription-interval", response_model=int)
def read_subscription_interval(
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get subscription interval in days
    """
    res = db.query(models.UserConfig.subscription_interval).filter(models.UserConfig.user_id == user.id).first()
    if not res:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription interval is not set")

    return res[0].days
