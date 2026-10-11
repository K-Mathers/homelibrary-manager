from typing import Optional
from abc import ABC, abstractmethod
from app.domain.entities.goal import ReadingGoal


class AbstractGoalRepository(ABC):
    @abstractmethod
    async def save_goal(self, goal: ReadingGoal) -> ReadingGoal:
        pass

    @abstractmethod
    async def get_by_year_month(
        self, year: int, month: Optional[int] = None
    ) -> Optional[ReadingGoal]:
        pass
