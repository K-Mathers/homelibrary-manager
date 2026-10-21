import csv
import shutil
from io import StringIO
from pathlib import Path

from app.domain.entities.book import Book
from app.infrastructure.config import settings


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

    @staticmethod
    def backup_database(destination_path: Path | None = None) -> Path:
        raw_db_url = settings.DATABASE_URL
        db_path_str = raw_db_url.split(":///")[-1]
        source_path = Path(db_path_str)

        if not source_path.exists():
            raise FileNotFoundError(f"Database file not found: {source_path}")

        if destination_path is None:
            backup_dir = Path("./storage/backups")
            backup_dir.mkdir(parents=True, exist_ok=True)
            destination_path = backup_dir / f"backup_{source_path.name}"
        else:
            destination_path.parent.mkdir(parents=True, exist_ok=True)

        shutil.copy2(source_path, destination_path)
        return destination_path
