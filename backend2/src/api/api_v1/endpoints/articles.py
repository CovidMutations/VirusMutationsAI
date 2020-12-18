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
    parser = VcfParser(None)
    try:
        parser.read_vcf_file(file.file)
    except AssertionError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid VCF-file")
    nucleotide_mutations = parser.get_nucleotide_mutations()

    if use_snp_effect:
        query = db.query(
            models.ArticleMutation.mutation,
            models.MutationMapping.nucleotide,
            models.ArticleData,
        ) \
            .join(models.ArticleMutation) \
            .outerjoin(models.MutationMapping, models.MutationMapping.protein == models.ArticleMutation.mutation) \
            .filter(or_(
                # Query for articles with nucleotide mutations from the original VCF-file
                models.ArticleMutation.mutation.in_(nucleotide_mutations),
                # Also query for articles with protein mutations mapped to origin ones via the mapping table
                models.MutationMapping.nucleotide.in_(nucleotide_mutations),
            ))

        res_temp = defaultdict(dict)
        for mutation, nucleotide, item in query.all():
            if nucleotide:  # If we found the article by mapped mutation, use in as a key
                key = nucleotide
                base_mutation = BaseMutation(mutation=f"{nucleotide} => {mutation}", source="snpeff")
            else:
                key = mutation
                base_mutation = None
            # Add articles by ID to exclude duplicates
            res_temp[key][item.id] = article_data_to_search_item(item, base_mutation)

        # Convert back to dict of lists
        res = {k: list(v.values()) for (k, v) in res_temp.items()}

    else:
        query = db.query(models.ArticleMutation.mutation, models.ArticleData)\
            .join(models.ArticleMutation)\
            .filter(models.ArticleMutation.mutation.in_(nucleotide_mutations))

        res = defaultdict(list)
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
        publishing_date=item.publishing_date
    )
