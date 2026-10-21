from abc import ABC, abstractmethod

from app.domain.entities.book import Book
from app.domain.value_objects.isbn import ISBN


class AbstractBookRepository(ABC):
    @abstractmethod
    async def get_by_id(self, book_id: int) -> Book | None:
        pass

    @abstractmethod
    async def get_by_isbn(self, isbn: ISBN) -> Book | None:
        pass

    @abstractmethod
    async def search_book(
        self,
        query: str | None = None,
        status: str | None = None,
        author_id: int | None = None,
        genre_id: int | None = None,
    ) -> list[Book]:
        pass

    @abstractmethod
    async def save_book(self, book: Book) -> Book:
        pass

    @abstractmethod
    async def delete_book(self, book_id: int) -> bool:
        pass
