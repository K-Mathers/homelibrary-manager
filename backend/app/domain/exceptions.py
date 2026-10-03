class DomainError(Exception):
    pass

class InvalidIsbnError(DomainError):
    pass

class InvalidPageRangeError(DomainError):
    pass

class InvalidRatingError(DomainError):
    pass

class InvalidSessionDurationError(DomainError):
    pass

class InvalidPageCountError(DomainError):
    pass

class InvalidMonthError(DomainError):
    pass