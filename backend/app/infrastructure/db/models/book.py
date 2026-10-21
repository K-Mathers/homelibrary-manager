from datetime import date
from typing import TYPE_CHECKING, Optional

if TYPE_CHECKING:
    from app.infrastructure.db.models.lookups import (
        AuthorModel,
        GenreModel,
        PublisherModel,
        TagModel,
    )
    from app.infrastructure.db.models.reading import (
        BookQuoteModel,
        ReadingSessionModel,
    )

from sqlalchemy import (
    Date,
    ForeignKey,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.db.models.associations import (
    book_authors,
    book_genres,
    book_tags,
)
from app.infrastructure.db.models.base import Base


class BookModel(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    isbn: Mapped[str | None] = mapped_column(String(20), unique=True, nullable=True)
    publication_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    page_count: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    cover_image_path: Mapped[str | None] = mapped_column(String(500), nullable=True)
    rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="unread", nullable=False)
    publisher_id: Mapped[int | None] = mapped_column(
        Integer, ForeignKey("publishers.id", ondelete="SET NULL"), nullable=True
    )
    created_at: Mapped[date] = mapped_column(
        Date, default=func.current_date(), nullable=False
    )

    publisher: Mapped[Optional["PublisherModel"]] = relationship(back_populates="books")
    authors: Mapped[list["AuthorModel"]] = relationship(
        secondary=book_authors, back_populates="books"
    )
    genres: Mapped[list["GenreModel"]] = relationship(
        secondary=book_genres, back_populates="books"
    )
    tags: Mapped[list["TagModel"]] = relationship(
        secondary=book_tags, back_populates="books"
    )
    reading_sessions: Mapped[list["ReadingSessionModel"]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )
    quotes: Mapped[list["BookQuoteModel"]] = relationship(
        back_populates="book", cascade="all, delete-orphan"
    )
