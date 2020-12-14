from datetime import timedelta
from random import randrange

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src import schemas
from src.api import deps
from src.core.config import settings
from src.core.email import EmailCoreService
from src.core.security import verify_password, create_access_token, get_password_hash
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
    user: models.User = db.query(models.User).filter(models.User.email == form_data.username.lower()).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Incorrect email or password")
    if not user.active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")

    token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    return schemas.Token(
        access_token=create_access_token(user.id, user.email, user.username, expires_delta=token_expires),
        token_type="bearer",
    )


@router.post("/registration", response_model=schemas.User)
def registration(
    item_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db),
):
    user = models.User(
        email=item_in.email.lower(),  # TODO: Create a functional index to force uniqueness on  the DB side
        username=item_in.username,
        salt="",
        password=get_password_hash(item_in.password),
        active=False,
        verification_code=randrange(100000, 999999),
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="The user with this email already exists in the system.",
        )
    db.refresh(user)

    verification_link = f"{settings.PUBLIC_URL}/auth/confirm-code-verification/{user.id}/{user.verification_code}"
    EmailCoreService().add_message_to_queue(
        user.email,
        "account_verification_code_subject.html",
        "account_verification_code.html",
        {"username": user.username, "verification_link": verification_link},
    )

    return user


# @router.post("/send-code-verification/{user_id}")
# def send_verification_code():
#     pass
#
#
# @router.get("/confirm-code-verification/{user_id}/{code}")
# def confirm_verification():
#     pass
