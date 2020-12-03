from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src import schemas
from src.api import deps
from src.db import models

router = APIRouter()


@router.post("/search", response_model=schemas.ArticleSearchOut)
def article_search(
    *,
    item_in: schemas.ArticleSearchIn,
    db: Session = Depends(deps.get_db),
) -> schemas.ArticleSearchOut:
    """
    Article search
    """
    mutation = item_in.mutation.upper()
    query = db.query(models.ArticleData).filter(models.ArticleData.mutations.any(mutation=mutation))
    items = [schemas.ArticleSearchItem(
        article_name=item.title,
        article_url=item.url,
        abstract_text=item.abstract_text,
    ) for item in query.all()]

    return {mutation: items} if items else {}
