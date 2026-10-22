from typing import Any

import httpx

from app.application.dtos.book_dto import BookMetadataDTO
from app.domain.ports.isbn_metadata_provider import AbstractIsbnMetadataProvider
from app.domain.value_objects.isbn import ISBN
from app.infrastructure.config import settings


class GoogleBooksClient(AbstractIsbnMetadataProvider):
    def __init__(self) -> None:
        self._http = httpx.AsyncClient(timeout=10.0)

    async def aclose(self) -> None:
        await self._http.aclose()

    async def fetch_by_isbn(self, isbn: ISBN) -> BookMetadataDTO | None:
        params: dict[str, Any] = {"q": f"isbn:{isbn.value}"}
        if settings.GOOGLE_BOOKS_API_KEY:
            params["key"] = settings.GOOGLE_BOOKS_API_KEY

        try:
            response = await self._http.get(settings.GOOGLE_BOOKS_URL, params=params)
        except httpx.RequestError:
            return None

        if response.status_code != 200:
            return None

        items = response.json().get("items", [])
        if not items:
            return None

        return self._parse(isbn.value, items[0]["volumeInfo"])

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
        return data.get("authors", [])

    @staticmethod
    def _publisher(data: dict[str, Any]) -> str | None:
        return data.get("publisher")

    @staticmethod
    def _year(data: dict[str, Any]) -> int | None:
        raw = data.get("publishedDate") or ""
        return int(raw[:4]) if len(raw) >= 4 and raw[:4].isdigit() else None

    @staticmethod
    def _description(data: dict[str, Any]) -> str | None:
        return data.get("description")

    @staticmethod
    def _cover_url(data: dict[str, Any]) -> str | None:
        return data.get("imageLinks", {}).get("thumbnail")
