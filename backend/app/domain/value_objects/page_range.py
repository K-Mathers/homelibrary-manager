from app.domain.exceptions import InvalidPageRangeError
from dataclasses import dataclass
@dataclass(frozen=True)

class PageRange():
    start_page: int
    end_page: int

    def __post_init__(self):
        if self.start_page < 0 or self.end_page < self.start_page:
            raise InvalidPageRangeError(f'Invalid page range: {self.start_page}-{self.end_page}')
    @property
    def pages_read(self) -> int:
        return self.end_page - self.start_page