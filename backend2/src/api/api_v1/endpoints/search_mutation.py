from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from src.api import deps
from typing import Any
import json

router = APIRouter()

class Mutation(BaseModel):
    mutation: str


@router.post("/search-mutation")
def get_articles_for_mutation(
    item: Mutation,
    db: Session = Depends(deps.get_db)
) -> Any:
    response = db.execute("select title, url from article_data inner join article_mutation \
        on article_data.id = article_mutation.article_id where mutation = '" + item.mutation + "'")

    mutation_list = []

    for mut in response:
        mutation_map = {}
        mutation_map['base_mutation'] = ''
        mutation_map['article_name'] = mut[0]
        mutation_map['article_url'] = mut[1]
        mutation_list.append(mutation_map)

    resulting_dic = {}
    resulting_dic[item.mutation] = mutation_list
    out_json = json.dumps(resulting_dic, allow_nan=False, indent=4)
    return Response(content=out_json, media_type="application/json")
