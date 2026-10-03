import pytest
from app.domain.value_objects.isbn import ISBN
from app.domain.exceptions import InvalidIsbnError
from app.domain.entities.book import Book

def test_isbn_validation_success():
    isbn = ISBN("978-5-93286-060-1")
    assert isbn.value == "9785932860601"

def test_isbn_validation_failure():
    with pytest.raises(InvalidIsbnError):
        ISBN("неверный_номер_123")

def test_book_status_auto_completed():
    book = Book(
        id=1,
        title="qweqwewq",
        isbn=ISBN("978-5-93286-060-1"),
        page_count=192,
        publication_year=2004
    )
    assert book.status == "unread"
    
    book.update_reading_progress(100)
    assert book.status == "reading"
    
    book.update_reading_progress(192)
    assert book.status == "read"
