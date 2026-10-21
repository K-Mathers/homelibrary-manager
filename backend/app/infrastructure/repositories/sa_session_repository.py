from datetime import date

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.session import ReadingSession
from app.domain.ports.session_repository import AbstractSessionRepository
from app.domain.value_objects.page_range import PageRange
from app.infrastructure.db.models.reading import ReadingSessionModel


class SASessionRepository(AbstractSessionRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_domain(self, model: ReadingSessionModel) -> ReadingSession:
        return ReadingSession(
            id=model.id,
            book_id=model.book_id,
            page_range=PageRange(start_page=model.start_page, end_page=model.end_page),
            session_date=model.session_date,
            duration_minutes=model.duration_minutes,
            notes=model.notes,
        )

    def _to_model(self, entity: ReadingSession) -> ReadingSessionModel:
        return ReadingSessionModel(
            id=entity.id,
            book_id=entity.book_id,
            session_date=entity.session_date,
            start_page=entity.page_range.start_page,
            end_page=entity.page_range.end_page,
            duration_minutes=entity.duration_minutes,
            notes=entity.notes,
        )

    async def add_session(self, session: ReadingSession) -> ReadingSession:
        model = self._to_model(session)
        self.session.add(model)
        await self.session.commit()
        await self.session.refresh(model)
        return self._to_domain(model)

    async def get_by_book_id(self, book_id: int) -> list[ReadingSession]:
        stmt = (
            select(ReadingSessionModel)
            .where(ReadingSessionModel.book_id == book_id)
            .order_by(ReadingSessionModel.session_date.desc())
        )
        result = await self.session.execute(stmt)
        return [self._to_domain(model) for model in result.scalars().all()]

    async def get_total_pages_by_period(self, start_date: date, end_date: date) -> int:
        stmt = select(
            func.sum(ReadingSessionModel.end_page - ReadingSessionModel.start_page)
        ).where(
            ReadingSessionModel.session_date >= start_date,
            ReadingSessionModel.session_date <= end_date,
        )
        result = await self.session.execute(stmt)
        total = result.scalar()
        return total if total is not None else 0
