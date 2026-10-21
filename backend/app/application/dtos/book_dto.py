from dataclasses import dataclass


@dataclass(frozen=True)
class BookMetadataDTO:
    isbn: str
    title: str
    authors: list[str]
    publisher: str | None = None
    publication_year: int | None = None
    description: str | None = None
    page_count: int | None = None
    cover_url: str | None = None
