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


@router.put("/subscribe-me/{mutation}", status_code=201)
def subscribe_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    mutation: str
) -> Any:
    subscr = models.Subscription(user_id = user.id, mutation = mutation)
    db.add(subscr)
    try:
        db.commit()
    except (exc.IntegrityError, errors.UniqueViolation) as e:
        # The mutation already subscribed (expected case)
        pass
    return {"mutation": mutation}