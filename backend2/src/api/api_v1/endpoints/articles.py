from collections import defaultdict

from fastapi import APIRouter, Depends, UploadFile, File, Body, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import or_
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
    use_snp_effect: bool = Body(False, alias="snpEffect"),
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
) -> schemas.ArticleSearchOut:
    """
    Article search by mutations from a VCF-file
    """
    parser = VcfParser()
    try:
        parser.read_vcf_file(file.file)
    except AssertionError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid VCF-file")
    mutations = parser.get_mutations()

    res = defaultdict(list)

    if use_snp_effect:
        query = db.query(
            models.ArticleMutation.mutation,
            models.MutationMapping.nucleotide,
            models.ArticleData,
        ) \
            .join(models.ArticleMutation) \
            .outerjoin(models.MutationMapping, models.MutationMapping.protein == models.ArticleMutation.mutation) \
            .filter(or_(
                models.ArticleMutation.mutation.in_(mutations),
                models.MutationMapping.nucleotide.in_(mutations),
            ))

        for mutation, nucleotide, item in query.all():
            if nucleotide:
                key = nucleotide
                base_mutation = BaseMutation(mutation=f"{nucleotide} => {mutation}", source="snpeff")
            else:
                key = mutation
                base_mutation = None
            res[key].append(article_data_to_search_item(item, base_mutation))
    else:
        query = db.query(models.ArticleMutation.mutation, models.ArticleData)\
            .join(models.ArticleMutation)\
            .filter(models.ArticleMutation.mutation.in_(mutations))

        for mutation, item in query.all():
            res[mutation].append(article_data_to_search_item(item))

    return res


class BaseMutation(BaseModel):
    mutation: str
    source: str


def article_data_to_search_item(
    item: models.ArticleData,
    base_mutation: BaseMutation = None,
) -> schemas.ArticleSearchItem:
    return schemas.ArticleSearchItem(
        article_name=item.title,
        article_url=item.url,
        abstract_text=item.abstract_text,
        base_mutation=base_mutation.mutation if base_mutation else "",
        base_mutation_src=base_mutation.source if base_mutation else None,
    )
