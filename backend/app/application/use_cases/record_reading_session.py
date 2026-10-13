from datetime import date
from typing import Optional
from app.domain.entities.session import ReadingSession
from app.domain.exceptions import BookNotFoundError
from app.domain.ports.book_repository import AbstractBookRepository
from app.domain.ports.session_repository import AbstractSessionRepository
from app.domain.value_objects.page_range import PageRange

class RecordReadingSessionUseCase:
    def __init__(
        self,
        book_repo: AbstractBookRepository,
        session_repo: AbstractSessionRepository,
    ) -> None:
        self.book_repo = book_repo
        self.session_repo = session_repo

    async def execute(
        self,
        book_id: int,
        start_page: int,
        end_page: int,
        duration_minutes: int = 0,
        notes: Optional[str] = None,
        session_date: Optional[date] = None,
    ) -> ReadingSession:
        book = await self.book_repo.get_by_id(book_id)
        if not book:
            raise BookNotFoundError(f"Book with id {book_id} not found")

        page_range = PageRange(start_page=start_page, end_page=end_page)
        session = ReadingSession(
            id=None,
            book_id=book_id,
            session_date=session_date or date.today(),
            page_range=page_range,
            duration_minutes=duration_minutes,
            notes=notes,
        )

        saved_session = await self.session_repo.add_session(session)
        book.update_reading_progress(end_page)
        await self.book_repo.save_book(book)

        return saved_session
