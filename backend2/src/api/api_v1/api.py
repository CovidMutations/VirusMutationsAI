from fastapi import APIRouter

from src.api.api_v1.endpoints import users
from src.api.api_v1.endpoints import user_subscription
from src.api.api_v1.endpoints import user_config


api_router = APIRouter()
api_router.include_router(users.router, prefix="/user")
api_router.include_router(user_subscription.router, prefix="/user-subscription")
api_router.include_router(user_config.router, prefix="/user-config")
