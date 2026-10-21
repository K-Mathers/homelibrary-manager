from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.record_reading_session import RecordReadingSessionUseCase
from app.domain.exceptions import BookNotFoundError
from app.domain.ports.book_repository import AbstractBookRepository
from app.infrastructure.db.database import get_db
from app.infrastructure.db.models.reading import BookQuoteModel
from app.presentation.container import get_book_repository, get_record_session_use_case
from app.presentation.schemas.reading_schemas import (
    BookQuoteCreateRequest,
    BookQuoteResponse,
    ReadingSessionRequest,
    ReadingSessionResponse,
)

router = APIRouter()


@router.post(
    "/sessions",
    response_model=ReadingSessionResponse,
    status_code=status.HTTP_201_CREATED,
)
async def add_session_read(
    req: ReadingSessionRequest,
    use_case: RecordReadingSessionUseCase = Depends(get_record_session_use_case),
):
    try:
        record = await use_case.execute(
            book_id=req.book_id,
            start_page=req.start_page,
            end_page=req.end_page,
            duration_minutes=req.duration_minutes,
            notes=req.notes,
            session_date=req.session_date,
        )
        return ReadingSessionResponse.from_domain(record)
    except BookNotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post(
    "/quotes", response_model=BookQuoteResponse, status_code=status.HTTP_201_CREATED
)
async def save_quotes(
    req: BookQuoteCreateRequest,
    db: AsyncSession = Depends(get_db),
    book_repo: AbstractBookRepository = Depends(get_book_repository),
):
    book = await book_repo.get_by_id(req.book_id)

    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Book with id {req.book_id} not found",
        )

    quote = BookQuoteModel(
        book_id=req.book_id, quote_text=req.quote_text, page_number=req.page_number
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return quote
