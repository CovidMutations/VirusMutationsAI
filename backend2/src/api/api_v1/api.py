from fastapi import APIRouter

from src.api.api_v1.endpoints import users
from src.api.api_v1.endpoints import user_subscription


api_router = APIRouter()
api_router.include_router(users.router, prefix="/user")
