from abc import ABC, abstractmethod

from app.application.dtos.book_dto import BookMetadataDTO
from app.domain.value_objects.isbn import ISBN


class AbstractIsbnMetadataProvider(ABC):
    @abstractmethod
    async def fetch_by_isbn(self, isbn: ISBN) -> BookMetadataDTO | None:
        pass
