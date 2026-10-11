from typing import List, Optional
from app.domain.entities.book import Book
from app.domain.exceptions import BookAlreadyExistsError
from app.domain.ports.book_repository import AbstractBookRepository
from app.domain.value_objects.isbn import ISBN

class AddManualBookUseCase:
    def __init__(self, book_repo: AbstractBookRepository) -> None:
        self.book_repo = book_repo

    async def execute(
        self,
        title: str,
        page_count: int,
        raw_isbn: Optional[str] = None,
        publication_year: Optional[int] = None,
        description: Optional[str] = None,
        author_ids: Optional[List[int]] = None,
        genre_ids: Optional[List[int]] = None,
    ) -> Book:
        isbn = None

        if raw_isbn:
            isbn = ISBN(raw_isbn)
            existing = await self.book_repo.get_by_isbn(isbn)
            if existing:
                raise BookAlreadyExistsError(
                    f"Book with ISBN {raw_isbn} already exists"
                )

        book = Book(
            id=None,
            title=title,
            isbn=isbn,
            page_count=page_count,
            publication_year=publication_year,
            description=description,
            cover_image_path=None,
            status="unread",
            author_ids=author_ids or [],
            genre_ids=genre_ids or [],
        )

        return await self.book_repo.save_book(book)
