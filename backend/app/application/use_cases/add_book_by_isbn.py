from app.domain.entities.book import Book
from app.domain.exceptions import BookAlreadyExistsError, BookNotFoundError
from app.domain.ports.book_repository import AbstractBookRepository
from app.domain.ports.isbn_metadata_provider import AbstractIsbnMetadataProvider
from app.domain.value_objects.isbn import ISBN
from app.infrastructure.storage.local_cover_storage import LocalCoverStorage


class AddBookByIsbnUseCase:
    def __init__(
        self,
        book_repo: AbstractBookRepository,
        metadata_provider: AbstractIsbnMetadataProvider,
        cover_storage: LocalCoverStorage,
    ) -> None:
        self.book_repo = book_repo
        self.metadata_provider = metadata_provider
        self.cover_storage = cover_storage

    async def execute(self, raw_isbn: str) -> Book:
        isbn = ISBN(raw_isbn)

        existing = await self.book_repo.get_by_isbn(isbn)
        if existing:
            raise BookAlreadyExistsError(f"Book with ISBN {raw_isbn} already exists")

        metadata = await self.metadata_provider.fetch_by_isbn(isbn)
        if not metadata:
            raise BookNotFoundError(f"Book with ISBN {raw_isbn} not found")

        cover_path = None
        if metadata.cover_url:
            cover_path = await self.cover_storage.save_cover_from_url(
                metadata.cover_url, isbn.value
            )

        page_count = (
            metadata.page_count
            if (metadata.page_count and metadata.page_count > 0)
            else 100
        )

        book = Book(
            id=None,
            title=metadata.title,
            isbn=isbn,
            page_count=page_count,
            publication_year=metadata.publication_year,
            description=metadata.description,
            cover_image_path=cover_path,
            status="unread",
        )

        return await self.book_repo.save_book(book)
