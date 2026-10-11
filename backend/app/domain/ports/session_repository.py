from datetime import date
from abc import ABC, abstractmethod
from typing import List
from app.domain.entities.session import ReadingSession

class AbstractSessionRepository(ABC):
    @abstractmethod
    async def add_session(self, session: ReadingSession) -> ReadingSession:
        pass

    @abstractmethod
    async def get_by_book_id(self, book_id: int) -> List[ReadingSession]:
        pass

    @abstractmethod
    async def get_total_pages_by_period(self, start_date: date, end_date: date) -> int:
        pass