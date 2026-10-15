from datetime import date
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, model_validator

class ReadingSessionRequest(BaseModel):
    book_id: int = Field(..., description="ID книги")
    start_page: int = Field(..., ge=0, description="Начальная страница")
    end_page: int = Field(..., ge=0, description="Конечная страница")
    session_date: Optional[date] = Field(default_factory=date.today, description="Дата сессии")
    duration_minutes: int = Field(0, ge=0, description="Длительность чтения в минутах")
    notes: Optional[str] = Field(None, description="Заметки о сессии")

    @model_validator(mode="after")
    def validate_range(self) -> "ReadingSessionRequest":
        if self.end_page < self.start_page:
            raise ValueError("end_page must be greater than or equal to start_page")
        return self


class ReadingSessionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: Optional[int] = None
    book_id: int
    session_date: date
    start_page: int
    end_page: int
    pages_read: int
    duration_minutes: int
    notes: Optional[str] = None


class BookQuoteCreateRequest(BaseModel):
    book_id: int = Field(..., description="ID книги")
    quote_text: str = Field(..., min_length=1, description="Текст цитаты")
    page_number: Optional[int] = Field(None, ge=1, description="Номер страницы с цитатой")


class BookQuoteResponse(BaseModel):
    id: Optional[int] = None
    book_id: int
    quote_text: str
    page_number: Optional[int] = None


class ReadingStatsResponse(BaseModel):
    total_pages: int = Field(0, description="Прочитано страниц за выбранный период")
    total_pages_year: int = Field(0, description="Всего прочитано страниц за год")
    goal: int = Field(0, description="Целевое количество страниц")
    pages_progress: float = Field(0.0, description="Процент выполнения цели (0-100%)")