from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api import deps
from src.db import models

router = APIRouter()


@router.put("/config-me/subscription-interval/{value-days}", status_code=201)
def config_subscription_interval_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    interval_days: int
) -> Any:
    """
    Set subscription interval
    """
    interval = models.UserConfig(user_id=user.id, subscription_interval=interval_days)
    db.merge(interval)
    db.commit()

    return {"subscription_interval": interval_days}

@router.get("/config-me/subscription-interval", status_code=201)
def read_user_subscription_interval(
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get subscription interval
    """
    return db.query(models.UserConfig.subscription_interval).filter(models.UserConfig.user_id == user.id).first()