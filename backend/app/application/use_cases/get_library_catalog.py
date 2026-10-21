from app.domain.entities.book import Book
from app.domain.ports.book_repository import AbstractBookRepository


class GetLibraryCatalogUseCase:
    def __init__(self, book_repo: AbstractBookRepository) -> None:
        self.book_repo = book_repo

    async def execute(
        self,
        query: str | None = None,
        status: str | None = None,
        author_id: int | None = None,
        genre_id: int | None = None,
    ) -> list[Book]:

        saved_books = await self.book_repo.search_book(
            query=query,
            status=status,
            author_id=author_id,
            genre_id=genre_id,
        )

        return saved_books
