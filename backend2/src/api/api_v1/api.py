from fastapi import APIRouter

from src.api.api_v1.endpoints import users
from src.api.api_v1.endpoints import user_subscription
from src.api.api_v1.endpoints import search_mutation


api_router = APIRouter()
api_router.include_router(users.router, prefix="/user")
api_router.include_router(search_mutation.router)
