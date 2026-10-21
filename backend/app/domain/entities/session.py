from dataclasses import dataclass
from datetime import date

from app.domain.exceptions import InvalidSessionDurationError
from app.domain.value_objects.page_range import PageRange


@dataclass
class ReadingSession:
    id: int | None
    book_id: int
    session_date: date
    page_range: PageRange
    duration_minutes: int = 0
    notes: str | None = None

    def __post_init__(self) -> None:
        if self.duration_minutes < 0:
            raise InvalidSessionDurationError("Duration must be non-negative")

    @property
    def pages_read(self) -> int:
        return self.page_range.pages_read
