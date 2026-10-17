from app.presentation.api.v1.books_router import router as books_router
from app.presentation.api.v1.reading_router import router as reading_router
from app.presentation.api.v1.stats_router import router as stats_router

__all__ = ["books_router", "reading_router", "stats_router"]
