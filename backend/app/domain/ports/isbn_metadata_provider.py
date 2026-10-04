from abc import ABC, abstractmethod
from typing import Optional
from app.domain.value_objects.isbn import ISBN
from app.application.dtos.book_dto import BookMetadataDTO

class AbstractIsbnMetadataProvider(ABC):
    @abstractmethod
    def fetch_by_isbn(self, isbn: ISBN) -> Optional[BookMetadataDTO]:
        pass