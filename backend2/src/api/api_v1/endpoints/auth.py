from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src import schemas
from src.api import deps
from src.core.config import settings
from src.core.security import verify_password, create_access_token
from src.db import models

router = APIRouter()


@router.post("/access-token", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db),
) -> schemas.Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user: models.User = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    if not user.active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return schemas.Token(
        access_token=create_access_token(user.id, user.email, user.username, expires_delta=token_expires),
        token_type="bearer",
    )


# @router.post("/registration")
# def registration():
#     pass


# @router.post("/send-code-verification/{user_id}")
# def send_verification_code():
#     pass
#
#
# @router.get("/confirm-code-verification/{user_id}/{code}")
# def confirm_verification():
#     pass
