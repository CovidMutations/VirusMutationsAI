from typing import Any

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from sqlalchemy.sql.functions import concat
from sqlalchemy.dialects.postgresql import INTERVAL

from src.api import deps
from src.db import models

router = APIRouter()


@router.put("/me/config/subscription-interval/{id}", status_code=201)
def config_subscription_interval_user_me(
    *,
    id: int,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Set subscription interval
    """
    interval = models.UserConfig(user_id=user.id, subscription_interval
                                 =func.cast(concat(id, ' DAYS'), INTERVAL))
    db.merge(interval)
    db.commit()

    return {"subscription_interval": id}

@router.get("/me/config/subscription-interval", status_code=201)
def read_user_subscription_interval(
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get subscription interval
    """
    return db.query(models.UserConfig.subscription_interval).filter(models.UserConfig.user_id == user.id).first()