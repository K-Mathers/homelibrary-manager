from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.goal import ReadingGoal
from app.domain.ports.goal_repository import AbstractGoalRepository
from app.infrastructure.db.models.reading import ReadingGoalModel


class SAGoalRepository(AbstractGoalRepository):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _to_domain(self, model: ReadingGoalModel) -> ReadingGoal:
        return ReadingGoal(
            id=model.id,
            year=model.year,
            month=model.month,
            target_books=model.target_books,
            target_pages=model.target_pages,
        )

    def _to_model(self, entity: ReadingGoal) -> ReadingGoalModel:
        return ReadingGoalModel(
            id=entity.id,
            year=entity.year,
            month=entity.month,
            target_books=entity.target_books,
            target_pages=entity.target_pages,
        )

    async def get_by_year_month(
        self, year: int, month: int | None = None
    ) -> ReadingGoal | None:
        stmt = select(ReadingGoalModel).where(
            ReadingGoalModel.year == year,
            ReadingGoalModel.month == month,
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_domain(model) if model else None

    async def save_goal(self, goal: ReadingGoal) -> ReadingGoal:
        stmt = select(ReadingGoalModel).where(
            ReadingGoalModel.year == goal.year,
            ReadingGoalModel.month == goal.month,
        )
        result = await self.session.execute(stmt)
        model = result.scalar_one_or_none()

        if model:
            model.target_books = goal.target_books
            model.target_pages = goal.target_pages
        else:
            model = self._to_model(goal)
            self.session.add(model)

        await self.session.commit()
        await self.session.refresh(model)
        return self._to_domain(model)
