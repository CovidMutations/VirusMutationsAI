from collections import defaultdict

from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from src import schemas
from src.api import deps
from src.core.vcf_parser import VcfParser
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
    items = [article_data_to_search_item(item) for item in query.all()]

    return {mutation: items} if items else {}


@router.post("/search-by-file", response_model=schemas.ArticleSearchOut)
def article_file_search(
    *,
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
) -> schemas.ArticleSearchOut:
    """
    Article search by mutations from a VCF-file
    """
    parser = VcfParser()
    parser.read_vcf_file(file.file)
    mutations = parser.get_mutations()

    query = db.query(models.ArticleMutation.mutation, models.ArticleData)\
        .join(models.ArticleMutation)\
        .filter(models.ArticleMutation.mutation.in_(mutations))

    res = defaultdict(list)
    for mutation, item in query.all():
        res[mutation].append(article_data_to_search_item(item))

    return res


def article_data_to_search_item(item: models.ArticleData) -> schemas.ArticleSearchItem:
    return schemas.ArticleSearchItem(
        article_name=item.title,
        article_url=item.url,
        abstract_text=item.abstract_text,
    )
