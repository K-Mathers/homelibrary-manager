import csv
from io import StringIO

from app.domain.entities.book import Book


class CsvExportFile:
    @staticmethod
    def export_books(books: list[Book]) -> str:
        header = ["ID", "Title", "ISBN", "PageCount", "Status", "Rating"]
        output = StringIO()

        writer = csv.writer(output)
        writer.writerow(header)

        for book in books:
            writer.writerow(
                [
                    book.id if book.id is not None else "",
                    book.title,
                    book.isbn.value if book.isbn else "",
                    book.page_count,
                    book.status,
                    book.rating.value if book.rating else "",
                ]
            )

        return output.getvalue()
