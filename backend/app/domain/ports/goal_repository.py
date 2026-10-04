from typing import Optional
from abc import ABC, abstractmethod
from app.domain.entities.goal import ReadingGoal

class AbstractGoalRepository(ABC):
    @abstractmethod
    def save_goal(self, goal: ReadingGoal) -> ReadingGoal:
        pass

    @abstractmethod
    def get_by_year_month(self, year: int, month: int) -> Optional[ReadingGoal]:
        pass