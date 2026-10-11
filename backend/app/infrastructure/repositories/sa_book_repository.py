from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.domain.entities.book import Book
from app.domain.ports.book_repository import AbstractBookRepository
from app.domain.value_objects.isbn import ISBN
from app.domain.value_objects.rating import Rating
from app.infrastructure.db.models.book import BookModel
from app.infrastructure.db.models.lookups import AuthorModel, GenreModel

class SABookRepository(AbstractBookRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def _get_model(self, *clauses) -> Optional[BookModel]:
        stmt = (
            select(BookModel)
            .where(*clauses)
            .options(
                selectinload(BookModel.authors),
                selectinload(BookModel.genres),
            )
        )
        return (await self.session.execute(stmt)).scalar_one_or_none()

    async def _load_by_ids(self, model_cls, ids: list[int]):
        if not ids:
            return []
        stmt = select(model_cls).where(model_cls.id.in_(ids))
        return list((await self.session.scalars(stmt)).all())


    def _to_domain(self, model: BookModel) -> Book:
        return Book(
            id=model.id,
            title=model.title,
            isbn=ISBN(model.isbn) if model.isbn else None,
            page_count=model.page_count,
            publication_year=model.publication_year,
            description=model.description,
            cover_image_path=model.cover_image_path,
            rating=Rating(model.rating) if model.rating is not None else None,
            status=model.status,
            author_ids=[a.id for a in model.authors] if model.authors else [],
            genre_ids=[g.id for g in model.genres] if model.genres else [],
        )

    def _to_model(self, entity: Book) -> BookModel:
        return BookModel(
            id=entity.id,
            title=entity.title,
            isbn=entity.isbn.value if entity.isbn else None,
            page_count=entity.page_count,
            publication_year=entity.publication_year,
            description=entity.description,
            cover_image_path=entity.cover_image_path,
            rating=int(entity.rating) if entity.rating is not None else None,
            status=entity.status,
        )

    def _sync_model_fields(self, model: BookModel, entity: Book) -> None:
        model.title = entity.title
        model.isbn = entity.isbn.value if entity.isbn else None
        model.page_count = entity.page_count
        model.publication_year = entity.publication_year
        model.description = entity.description
        model.cover_image_path = entity.cover_image_path
        model.rating = int(entity.rating) if entity.rating is not None else None
        model.status = entity.status

    async def get_by_id(self, book_id: int) -> Optional[Book]:
        model = await self._get_model(BookModel.id == book_id)
        return self._to_domain(model) if model else None

    async def get_by_isbn(self, isbn: ISBN) -> Optional[Book]:
        model = await self._get_model(BookModel.isbn == isbn.value)
        return self._to_domain(model) if model else None

    async def search_book(
        self,
        query: Optional[str] = None,
        status: Optional[str] = None,
        author_id: Optional[int] = None,
        genre_id: Optional[int] = None,
    ) -> List[Book]:
        stmt = select(BookModel).options(
            selectinload(BookModel.authors),
            selectinload(BookModel.genres),
        )

        if query:
            stmt = stmt.where(BookModel.title.ilike(f"%{query}%"))
        if status:
            stmt = stmt.where(BookModel.status == status)
        if author_id:
            stmt = stmt.where(BookModel.authors.any(AuthorModel.id == author_id))
        if genre_id:
            stmt = stmt.where(BookModel.genres.any(GenreModel.id == genre_id))

        result = await self.session.execute(stmt)
        return [self._to_domain(model) for model in result.scalars().all()]

    async def save_book(self, book: Book) -> Book:
        model = await self._get_model(BookModel.id == book.id) if book.id else None

        if not model:
            model = self._to_model(book)
            self.session.add(model)
        else:
            self._sync_model_fields(model, book)

        model.authors = await self._load_by_ids(AuthorModel, book.author_ids)
        model.genres = await self._load_by_ids(GenreModel, book.genre_ids)

        await self.session.commit()
        await self.session.refresh(model, ["authors", "genres"])
        return self._to_domain(model)

    async def delete_book(self, book_id: int) -> bool:
        stmt = select(BookModel).where(BookModel.id == book_id)
        model = (await self.session.execute(stmt)).scalar_one_or_none()
        if not model:
            return False

        await self.session.delete(model)
        await self.session.commit()
        return True
