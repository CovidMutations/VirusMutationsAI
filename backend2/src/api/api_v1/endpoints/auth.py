from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from src import schemas
from src.api import deps

router = APIRouter()


@router.post("/access-token", response_model=schemas.Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(deps.get_db),
) -> schemas.Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    pass

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
