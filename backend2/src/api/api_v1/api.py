from fastapi import APIRouter

from src.api.api_v1.endpoints import users, articles


api_router = APIRouter()
api_router.include_router(users.router, prefix="/user")
api_router.include_router(articles.router, prefix="/articles")
