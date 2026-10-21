from dataclasses import dataclass, field

from app.domain.exceptions import InvalidPageRangeError
from app.domain.value_objects.isbn import ISBN
from app.domain.value_objects.rating import Rating


@dataclass
class Book:
    id: int | None
    title: str
    page_count: int
    isbn: ISBN | None = None
    publication_year: int | None = None
    description: str | None = None
    cover_image_path: str | None = None
    rating: Rating | None = None
    status: str = "unread"  # 'unread', 'reading', 'read', 'abandoned'
    author_ids: list[int] = field(default_factory=list)
    genre_ids: list[int] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.page_count <= 0:
            raise InvalidPageRangeError(f"Invalid page count: {self.page_count}")

    def update_reading_progress(self, current_page: int) -> None:
        if current_page <= 0:
            self.status = "unread"
        elif current_page >= self.page_count:
            self.status = "read"
        else:
            self.status = "reading"

    def mark_as_read(self) -> None:
        self.status = "read"

    def mark_as_abandoned(self) -> None:
        self.status = "abandoned"
