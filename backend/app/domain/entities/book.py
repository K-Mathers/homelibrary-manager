from app.domain.exceptions import InvalidPageRangeError
from dataclasses import field
from app.domain.value_objects.rating import Rating
from app.domain.value_objects.isbn import ISBN
from typing import Optional
from dataclasses import dataclass

@dataclass
class Book():
    id: Optional[int]
    title: str
    page_count: int
    isbn: Optional[ISBN] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    cover_image_path: Optional[str] = None
    rating: Optional[Rating] = None
    status: str = "unread"  # 'unread', 'reading', 'read', 'abandoned'
    author_ids: list[int] = field(default_factory=list)
    genre_ids: list[int] = field(default_factory=list)

    def __post_init__(self) -> None:
        if self.page_count <= 0:
            raise InvalidPageRangeError(f'Invalid page count: {self.page_count}')

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
    
