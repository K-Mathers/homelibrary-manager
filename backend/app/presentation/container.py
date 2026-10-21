from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.add_book_by_isbn import AddBookByIsbnUseCase
from app.application.use_cases.add_manual_book import AddManualBookUseCase
from app.application.use_cases.get_library_catalog import GetLibraryCatalogUseCase
from app.application.use_cases.get_reading_statistics import GetReadingStatisticsUseCase
from app.application.use_cases.record_reading_session import RecordReadingSessionUseCase
from app.domain.ports.book_repository import AbstractBookRepository
from app.domain.ports.goal_repository import AbstractGoalRepository
from app.domain.ports.isbn_metadata_provider import AbstractIsbnMetadataProvider
from app.domain.ports.session_repository import AbstractSessionRepository
from app.infrastructure.db.database import get_db
from app.infrastructure.external.open_library_client import OpenLibraryClient
from app.infrastructure.repositories.sa_book_repository import SABookRepository
from app.infrastructure.repositories.sa_goal_repository import SAGoalRepository
from app.infrastructure.repositories.sa_session_repository import SASessionRepository
from app.infrastructure.storage.local_cover_storage import LocalCoverStorage


def get_book_repository(
    session: AsyncSession = Depends(get_db),
) -> AbstractBookRepository:
    return SABookRepository(session)


def get_session_repository(
    session: AsyncSession = Depends(get_db),
) -> AbstractSessionRepository:
    return SASessionRepository(session)


def get_goal_repository(
    session: AsyncSession = Depends(get_db),
) -> AbstractGoalRepository:
    return SAGoalRepository(session)


def get_metadata_provider() -> AbstractIsbnMetadataProvider:
    return OpenLibraryClient()


def get_cover_storage() -> LocalCoverStorage:
    return LocalCoverStorage()


def get_catalog_use_case(
    repo: AbstractBookRepository = Depends(get_book_repository),
) -> GetLibraryCatalogUseCase:
    return GetLibraryCatalogUseCase(repo)


def get_add_manual_book_use_case(
    repo: AbstractBookRepository = Depends(get_book_repository),
) -> AddManualBookUseCase:
    return AddManualBookUseCase(repo)


def get_add_book_by_isbn_use_case(
    repo: AbstractBookRepository = Depends(get_book_repository),
    provider: AbstractIsbnMetadataProvider = Depends(get_metadata_provider),
    storage: LocalCoverStorage = Depends(get_cover_storage),
) -> AddBookByIsbnUseCase:
    return AddBookByIsbnUseCase(
        book_repo=repo, metadata_provider=provider, cover_storage=storage
    )


def get_record_session_use_case(
    book_repo: AbstractBookRepository = Depends(get_book_repository),
    session_repo: AbstractSessionRepository = Depends(get_session_repository),
) -> RecordReadingSessionUseCase:
    return RecordReadingSessionUseCase(book_repo=book_repo, session_repo=session_repo)


def get_reading_stats_use_case(
    session_repo: AbstractSessionRepository = Depends(get_session_repository),
    goal_repo: AbstractGoalRepository = Depends(get_goal_repository),
) -> GetReadingStatisticsUseCase:
    return GetReadingStatisticsUseCase(session_repo=session_repo, goal_repo=goal_repo)
