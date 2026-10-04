from abc import ABC, abstractmethod
from typing import List, Optional
from app.domain.entities.book import Book
from app.domain.value_objects.isbn import ISBN

class AbstractBookRepository(ABC):
    @abstractmethod
    def get_by_id(self, book_id: int) -> Optional[Book]:
        pass

    @abstractmethod
    def get_by_isbn(self, isbn: ISBN) -> Optional[Book]:
        pass

    @abstractmethod
    def search_book(
        self,
        query: Optional[str] = None,
        status: Optional[str] = None,
        author_id: Optional[int] = None,
        genre_id: Optional[int] = None,
    ) -> List[Book]:
        pass

    @abstractmethod
    def save_book(self, book: Book) -> Book:
        pass

    @abstractmethod
    def delete_book(self, book_id: int) -> bool:
        pass
