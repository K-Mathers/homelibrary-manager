import pytest

from app.domain.entities.book import Book
from app.domain.exceptions import InvalidIsbnError, InvalidPageRangeError, InvalidRatingError
from app.domain.value_objects.isbn import ISBN
from app.domain.value_objects.page_range import PageRange
from app.domain.value_objects.rating import Rating


def test_isbn_valid():
    isbn = ISBN("978-5-93286-060-1")
    assert isbn.value == "9785932860601"

def test_isbn_invalid_error():
    with pytest.raises(InvalidIsbnError):
        ISBN("123")

def test_page_range_negaive_raises_error():
    with pytest.raises(InvalidPageRangeError):
        PageRange(start_page=50, end_page=20)

def test_rating_error():
    with pytest.raises(InvalidRatingError):
        Rating(6)

def test_book_auto_status():
    book = Book(
        id=1,
        title="asd",
        isbn=ISBN("978-5-93286-060-1"),
        page_count=200,
    )

    assert book.status == "unread"

    book.update_reading_progress(100)
    assert book.status == "reading"

    book.update_reading_progress(200)
    assert book.status == "read"
