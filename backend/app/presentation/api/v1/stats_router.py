from fastapi import Response
from app.infrastructure.storage import CsvExportFile
from app.presentation.container import get_book_repository
from app.domain.ports.book_repository import AbstractBookRepository
from datetime import date
from app.presentation.container import get_reading_stats_use_case
from fastapi import Depends
from app.application.use_cases.get_reading_statistics import GetReadingStatisticsUseCase
from typing import Optional
from app.presentation.schemas.reading_schemas import ReadingStatsResponse
from fastapi import APIRouter
from datetime import timedelta

router = APIRouter()


@router.get("/stats/summary", response_model=ReadingStatsResponse, status_code=200)
async def get_summary_stats(
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    year: Optional[int] = None,
    month: Optional[int] = None,
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
