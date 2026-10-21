from datetime import date

from app.application.dtos.reading_dto import ReadingStatisticsDTO
from app.domain.ports.goal_repository import AbstractGoalRepository
from app.domain.ports.session_repository import AbstractSessionRepository


class GetReadingStatisticsUseCase:
    def __init__(
        self,
        session_repo: AbstractSessionRepository,
        goal_repo: AbstractGoalRepository,
    ) -> None:
        self.session_repo = session_repo
        self.goal_repo = goal_repo

    async def execute(
        self,
        start_date: date,
        end_date: date,
        year: int,
        month: int | None = None,
    ) -> ReadingStatisticsDTO:
        period_pages = await self.session_repo.get_total_pages_by_period(
            start_date, end_date
        )

        year_start = date(year, 1, 1)
        year_end = date(year, 12, 31)
        year_pages = await self.session_repo.get_total_pages_by_period(
            year_start, year_end
        )

        goal = await self.goal_repo.get_by_year_month(year, month)
        if not goal and month is not None:
            goal = await self.goal_repo.get_by_year_month(year, None)

        if goal:
            current_read = period_pages if goal.month is not None else year_pages
            pages_progress = goal.calculate_pages_progress(current_read)
            target_pages = goal.target_pages
        else:
            pages_progress = 0.0
            target_pages = 0

        return ReadingStatisticsDTO(
            total_pages=period_pages,
            total_pages_year=year_pages,
            goal=target_pages,
            pages_progress=pages_progress,
        )
