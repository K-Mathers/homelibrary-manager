from dataclasses import dataclass
from typing import Optional, List

@dataclass(frozen=True)
class BookMetadataDTO:
    isbn: str
    title: str
    authors: List[str]
    publisher: Optional[str] = None
    publication_year: Optional[int] = None
    description: Optional[str] = None
    page_count: Optional[int] = None
    cover_url: Optional[str] = None
