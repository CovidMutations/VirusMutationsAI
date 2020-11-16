from typing import Generic, List, TypeVar

from pydantic.generics import GenericModel

ModelType = TypeVar("ModelType")


class PaginatedList(GenericModel, Generic[ModelType]):
    items: List[ModelType]
    total: int
