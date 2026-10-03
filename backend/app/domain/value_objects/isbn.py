from app.domain.exceptions import InvalidIsbnError
from dataclasses import dataclass
import re

@dataclass(frozen=True)
class ISBN():
    value: str

    def __post_init__(self):
        cleaned = re.sub(r'[-\s]', '', self.value)
        
        if not self._is_valid(cleaned):
            raise InvalidIsbnError(f'Invalid ISBN format: {self.value}')
        
        object.__setattr__(self, 'value', cleaned)

    @staticmethod
    def _is_valid(isbn: str) -> bool:
        return len(isbn) in (10, 13) and isbn.isdigit()
    
    def __str__(self) -> str:
        return self.value