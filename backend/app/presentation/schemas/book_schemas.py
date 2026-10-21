from pydantic import BaseModel, ConfigDict, Field

from app.domain.entities.book import Book


class BookRequest(BaseModel):
    title: str = Field(..., min_length=1, description="Название книги")
    page_count: int = Field(..., gt=0, description="Количество страниц (строго > 0)")
    raw_isbn: str | None = Field(None, description="ISBN (10 или 13 цифр)")
    publication_year: int | None = Field(None, description="Год издания")
    description: str | None = Field(None, description="Описание книги")


class BookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    title: str
    isbn: str | None = None
    page_count: int
    publication_year: int | None = None
    description: str | None = None
    cover_image_path: str | None = None
    rating: int | None = None
    status: str

    @classmethod
    def from_domain(cls, book: Book) -> "BookResponse":
        return cls(
            id=book.id,
            title=book.title,
            isbn=book.isbn.value if book.isbn else None,
            page_count=book.page_count,
            publication_year=book.publication_year,
            description=book.description,
            cover_image_path=book.cover_image_path,
            rating=int(book.rating) if book.rating is not None else None,
            status=book.status,
        )
