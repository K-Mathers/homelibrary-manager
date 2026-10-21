from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.domain.exceptions import (
    BookAlreadyExistsError,
    BookNotFoundError,
    InvalidIsbnError,
    InvalidPageRangeError,
)
from app.infrastructure.config import settings
from app.presentation.api.v1 import books_router, reading_router, stats_router

app = FastAPI(title="Library")
origins = settings.CORS_ORIGINS


@app.exception_handler(BookAlreadyExistsError)
async def book_already_exist_handler(req: Request, exc: BookAlreadyExistsError):
    return JSONResponse(status_code=409, content={"detail": str(exc)})


@app.exception_handler(BookNotFoundError)
async def book_not_found_handler(req: Request, exc: BookNotFoundError):
    return JSONResponse(status_code=404, content={"detail": str(exc)})


@app.exception_handler(InvalidIsbnError)
@app.exception_handler(InvalidPageRangeError)
async def unprocessable_entity_handler(req: Request, exc: Exception):
    return JSONResponse(status_code=422, content={"detail": str(exc)})


app.include_router(books_router, prefix="/api/v1/books", tags=["Books"])
app.include_router(reading_router, prefix="/api/v1/reading", tags=["Reading"])
app.include_router(stats_router, prefix="/api/v1", tags=["Statistics & Backup"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return "Library API"
