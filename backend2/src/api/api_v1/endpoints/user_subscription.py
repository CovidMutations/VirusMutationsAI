from typing import Any

from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import exc, asc

from src.api import deps
from src.db import models
from src.schemas import PaginatedList

router = APIRouter()


@router.put("/subscriptions/{mutation}", response_model=str, status_code=status.HTTP_201_CREATED)
def subscribe_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    mutation: str
) -> Any:
    """
    Add a subscription to the subscriptions
    """
    subscr = models.Subscription(user_id=user.id, mutation=mutation)
    db.add(subscr)
    try:
        db.commit()
    except exc.IntegrityError as e:
        # The mutation already subscribed (expected case)
        pass
    return mutation


@router.get("/subscriptions", response_model=PaginatedList[str])
def read_subscriptions_user_me(
    skip: int = Query(0, ge=0, description="Items offset"),
    limit: int = Query(100, gt=0, le=100, description="Page size limit"),
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Get subscription list
    """
    query = db.query(models.Subscription.mutation).filter(models.Subscription.user_id == user.id)
    total = query.count()
    items = query.order_by(asc(models.Subscription.mutation)).limit(limit).offset(skip).all()
    res = PaginatedList(items=[x[0] for x in items], total=total)
    return res


@router.delete("/subscriptions/{mutation}", response_model=str)
def unsubscribe_user_me(
    *,
    user: models.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db),
    mutation: str
) -> Any:
    """
    Delete a subscription from the subscriptions
    """
    db.query(models.Subscription.mutation).filter(models.Subscription.user_id == user.id,
                                                  models.Subscription.mutation == mutation).delete()
    db.commit()
    return mutation
