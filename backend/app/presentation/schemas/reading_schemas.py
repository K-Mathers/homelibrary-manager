from datetime import date

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.domain.entities.session import ReadingSession


class ReadingSessionRequest(BaseModel):
    book_id: int = Field(..., description="ID книги")
    start_page: int = Field(..., ge=0, description="Начальная страница")
    end_page: int = Field(..., ge=0, description="Конечная страница")
    session_date: date | None = Field(
        default_factory=date.today, description="Дата сессии"
    )
    duration_minutes: int = Field(0, ge=0, description="Длительность чтения в минутах")
    notes: str | None = Field(None, description="Заметки о сессии")

    @model_validator(mode="after")
    def validate_range(self) -> "ReadingSessionRequest":
        if self.end_page < self.start_page:
            raise ValueError("end_page must be greater than or equal to start_page")
        return self


class ReadingSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    book_id: int
    session_date: date
    start_page: int
    end_page: int
    pages_read: int
    duration_minutes: int
    notes: str | None = None

    @classmethod
    def from_domain(cls, session: ReadingSession) -> "ReadingSessionResponse":
        return cls(
            id=session.id,
            book_id=session.book_id,
            session_date=session.session_date,
            start_page=session.page_range.start_page,
            end_page=session.page_range.end_page,
            pages_read=session.pages_read,
            duration_minutes=session.duration_minutes,
            notes=session.notes,
        )


class BookQuoteCreateRequest(BaseModel):
    book_id: int = Field(..., description="ID книги")
    quote_text: str = Field(..., min_length=1, description="Текст цитаты")
    page_number: int | None = Field(None, ge=1, description="Номер страницы с цитатой")


class BookQuoteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int | None = None
    book_id: int
    quote_text: str
    page_number: int | None = None


class ReadingStatsResponse(BaseModel):
    total_pages: int = Field(0, description="Прочитано страниц за выбранный период")
    total_pages_year: int = Field(0, description="Всего прочитано страниц за год")
    goal: int = Field(0, description="Целевое количество страниц")
    pages_progress: float = Field(0.0, description="Процент выполнения цели (0-100%)")
