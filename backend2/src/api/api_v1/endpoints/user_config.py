from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import exc
from psycopg2 import errors

from src import schemas
from src.api import deps
from src.db import models
from starlette.responses import Response

router = APIRouter()


@router.put("/config-me/subscription-interval/{value-days}", status_code=201)
def config_subscription_interval_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    interval_days: int
) -> Any:
    interval = models.User_config(user_id = user.id, subscription_interval = interval_days)
    db.merge(interval)
    try:
        db.commit()
    except:
        raise
    return {"subscription_interval": interval_days}
