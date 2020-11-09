from fastapi import FastAPI

from src.api.api_v1.api import api_router
from src.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)
app.include_router(api_router, prefix=settings.API_V1_STR)
