from app.infrastructure.config import settings
from typing import Any, Optional
import httpx
from app.application.dtos.book_dto import BookMetadataDTO
from app.domain.ports.isbn_metadata_provider import AbstractIsbnMetadataProvider
from app.domain.value_objects.isbn import ISBN

class OpenLibraryClient(AbstractIsbnMetadataProvider):
    def __init__(self) -> None:
        self._http = httpx.AsyncClient(timeout=10.0)

    async def aclose(self) -> None:
        await self._http.aclose()

    async def fetch_by_isbn(self, isbn: ISBN) -> Optional[BookMetadataDTO]:
        bibkey = f"ISBN:{isbn.value}"
        params = {"bibkeys": bibkey, "format": "json", "jscmd": "data"}

        try:
            response = await self._http.get(settings.OPEN_LIBRARY_URL, params=params)
        except httpx.RequestError:
            return None

        if response.status_code != 200:
            return None

        book_data = response.json().get(bibkey)
        if not book_data:
            return None

        return self._parse(isbn.value, book_data)

    def _parse(self, isbn: str, data: dict[str, Any]) -> BookMetadataDTO:
        return BookMetadataDTO(
            isbn=isbn,
            title=data.get("title") or "Untitled",
            authors=self._authors(data),
            publisher=self._publisher(data),
            publication_year=self._year(data),
            description=self._description(data),
            page_count=data.get("number_of_pages"),
            cover_url=self._cover_url(data),
        )

    @staticmethod
    def _authors(data: dict[str, Any]) -> list[str]:
        return [
            entry["name"].strip()
            for entry in data.get("authors", [])
            if isinstance(entry, dict) and "name" in entry
        ]

    @staticmethod
    def _publisher(data: dict[str, Any]) -> Optional[str]:
        pubs = data.get("publishers") or []
        first = pubs[0] if pubs else None
        if isinstance(first, dict):
            return first.get("name", "").strip() or None
        return None

    @staticmethod
    def _year(data: dict[str, Any]) -> Optional[int]:
        raw: str = data.get("publish_date") or ""
        for part in raw.split():
            digits = part.strip(",-.")
            if len(digits) == 4 and digits.isdigit():
                return int(digits)
        return None

    @staticmethod
    def _description(data: dict[str, Any]) -> Optional[str]:
        desc = data.get("description")
        if isinstance(desc, dict):
            return desc.get("value")
        return desc or None

    @staticmethod
    def _cover_url(data: dict[str, Any]) -> Optional[str]:
        cover = data.get("cover") or {}
        return cover.get("large") or cover.get("medium")
