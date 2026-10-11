from typing import Optional, List
from app.domain.entities.book import Book
from app.domain.ports.book_repository import AbstractBookRepository


class GetLibraryCatalogUseCase:
    def __init__(self, book_repo: AbstractBookRepository) -> None:
        self.book_repo = book_repo

    async def execute(
        self,
        query: Optional[str] = None,
        status: Optional[str] = None,
        author_id: Optional[int] = None,
        genre_id: Optional[int] = None,
    ) -> List[Book]:

        saved_books = await self.book_repo.search_book(
            query=query,
            status=status,
            author_id=author_id,
            genre_id=genre_id,
        )

        return saved_books
