from dataclasses import dataclass

from app.domain.exceptions import InvalidRatingError


@dataclass(frozen=True)
class Rating:
    value: int

    def __post_init__(self) -> None:
        if not isinstance(self.value, int) or not (1 <= self.value <= 5):
            raise InvalidRatingError(f"Invalid rating: {self.value}")

    def __int__(self) -> int:
        return self.value
