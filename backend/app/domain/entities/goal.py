from app.domain.exceptions import InvalidMonthError
from app.domain.exceptions import InvalidPageCountError
from typing import Optional
from dataclasses import dataclass

@dataclass
class ReadingGoal:
    id: Optional[int]
    year: int
    month: Optional[int] = None
    target_books: int = 0
    target_pages: int = 0

    def __post_init__(self) -> None:
        if self.target_books < 0 or self.target_pages < 0:
            raise InvalidPageCountError("Invalid Page Counter")
        elif self.month is not None and not (1 <= self.month <= 12):
            raise InvalidMonthError("Invalid Month")
        elif self.target_books == 0 and self.target_pages == 0:
            raise InvalidPageCountError("Invalid Page Counter")

    def calculate_books_progress(self, current_books: int) -> float:
        if self.target_books <= 0:
            return 0.0
        return min(100.0, round((current_books / self.target_books) * 100, 2))

    def calculate_pages_progress(self, current_pages: int) -> float:
        if self.target_pages <= 0:
            return 0.0
        return min(100.0, round((current_pages / self.target_pages) * 100, 2))

    def is_achieved(self, current_books: int, current_pages: int) -> bool:
        books_ok = (current_books >= self.target_books) if self.target_books > 0 else True
        pages_ok = (current_pages >= self.target_pages) if self.target_pages > 0 else True
        return books_ok and pages_ok

    
    
        
