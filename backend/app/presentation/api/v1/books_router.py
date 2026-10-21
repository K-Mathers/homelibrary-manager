from fastapi import APIRouter, Depends, HTTPException

from app.application.use_cases.add_book_by_isbn import AddBookByIsbnUseCase
from app.application.use_cases.add_manual_book import AddManualBookUseCase
from app.application.use_cases.get_library_catalog import GetLibraryCatalogUseCase
from app.domain.ports.book_repository import AbstractBookRepository
from app.presentation.container import (
    get_add_book_by_isbn_use_case,
    get_add_manual_book_use_case,
    get_book_repository,
    get_catalog_use_case,
)
from app.presentation.schemas.book_schemas import BookRequest, BookResponse

router = APIRouter()


@router.get("", response_model=list[BookResponse])
async def get_catalog(
    query: str | None = None,
    status: str | None = None,
    author_id: int | None = None,
    genre_id: int | None = None,
    use_case: GetLibraryCatalogUseCase = Depends(get_catalog_use_case),
):
    books = await use_case.execute(
        query=query, status=status, author_id=author_id, genre_id=genre_id
    )
    return [BookResponse.from_domain(book) for book in books]


@router.post("/isbn/{isbn}", response_model=BookResponse, status_code=201)
async def add_by_isbn(
    isbn: str, use_case: AddBookByIsbnUseCase = Depends(get_add_book_by_isbn_use_case)
):
    book = await use_case.execute(raw_isbn=isbn)
    return BookResponse.from_domain(book)


@router.post("/manual", response_model=BookResponse, status_code=201)
async def add_manual(
    req: BookRequest,
    use_case: AddManualBookUseCase = Depends(get_add_manual_book_use_case),
):
    book = await use_case.execute(
        title=req.title,
        page_count=req.page_count,
        raw_isbn=req.raw_isbn,
        publication_year=req.publication_year,
        description=req.description,
    )
    return BookResponse.from_domain(book)


@router.get("/{id}", response_model=BookResponse)
async def get_book_by_id(
    id: int, repo: AbstractBookRepository = Depends(get_book_repository)
):
    book = await repo.get_by_id(id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    return BookResponse.from_domain(book)
