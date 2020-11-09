from typing import Any

from fastapi import APIRouter, Depends

from src import schemas
from src.api import deps
from src.db import models

router = APIRouter()


@router.get("/me", response_model=schemas.User)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
