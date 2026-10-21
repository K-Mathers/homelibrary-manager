from datetime import date, timedelta

from fastapi import APIRouter, Depends, Response

from app.application.use_cases.get_reading_statistics import GetReadingStatisticsUseCase
from app.domain.ports.book_repository import AbstractBookRepository
from app.infrastructure.storage import CsvExportFile
from app.presentation.container import get_book_repository, get_reading_stats_use_case
from app.presentation.schemas.reading_schemas import ReadingStatsResponse

router = APIRouter()


@router.get("/stats/summary", response_model=ReadingStatsResponse, status_code=200)
async def get_summary_stats(
    start_date: date | None = None,
    end_date: date | None = None,
    year: int | None = None,
    month: int | None = None,
    use_case: GetReadingStatisticsUseCase = Depends(get_reading_stats_use_case),
):
    today = date.today()
    year = year or today.year
    end_date = end_date or today
    start_date = start_date or (today - timedelta(days=7))

    summary = await use_case.execute(
        start_date=start_date,
        end_date=end_date,
        year=year,
        month=month,
    )
    return summary


@router.get("/backup/export-csv")
async def export_csv(repo: AbstractBookRepository = Depends(get_book_repository)):
    books = await repo.search_book()
    csv_content = CsvExportFile.export_books(books)
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=library_export.csv"},
    )
