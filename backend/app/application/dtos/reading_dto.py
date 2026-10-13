from dataclasses import dataclass

@dataclass(frozen=True)
class ReadingStatisticsDTO:
    total_pages: int
    total_pages_year: int
    goal: int
    pages_progress: float

    def __getitem__(self, key: str):
        return getattr(self, key)
