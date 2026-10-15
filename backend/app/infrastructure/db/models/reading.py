from datetime import date, datetime
from typing import TYPE_CHECKING, Optional
from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.infrastructure.db.models.base import Base

if TYPE_CHECKING:
    from app.infrastructure.db.models.book import BookModel
class ReadingSessionModel(Base):
    __tablename__ = "reading_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    book_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False
    )
    session_date: Mapped[date] = mapped_column(
        Date, default=func.current_date(), nullable=False
    )
    start_page: Mapped[int] = mapped_column(Integer, nullable=False)
    end_page: Mapped[int] = mapped_column(Integer, nullable=False)
    duration_minutes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    book: Mapped["BookModel"] = relationship(back_populates="reading_sessions")

class BookQuoteModel(Base):
    __tablename__ = "book_quotes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    book_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("books.id", ondelete="CASCADE"), nullable=False
    )
    quote_text: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=func.current_timestamp(), nullable=False
    )

    book: Mapped["BookModel"] = relationship(back_populates="quotes")


class ReadingGoalModel(Base):
    __tablename__ = "reading_goals"

    __table_args__ = (
        UniqueConstraint("year", "month", name="uq_goal_year_month"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    month: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    target_books: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    target_pages: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
