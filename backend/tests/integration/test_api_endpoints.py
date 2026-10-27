import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_get_book(client: AsyncClient):
    response = await client.get("/api/v1/books")
    assert response.status_code == 200
    
@pytest.mark.asyncio
async def test_add_book(client: AsyncClient):
    payload = {"title": "Book", "page_count": 56, "publication_year": 2003, "description": "Mix"}
    response = await client.post("/api/v1/books/manual", json=payload)

    assert response.status_code == 201

    data = response.json()
    assert data["title"] == "Book"
    assert "id" in data

@pytest.mark.asyncio
async def test_negative_get_book(client: AsyncClient):
    response = await client.get("/api/v1/books/0")
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_negative_add_book(client: AsyncClient):
    payload = {"title": "NegativeBook", "page_count": -494, "raw_isbn": "3324", "publication_year": 4444, "description": "Mix"}
    response = await client.post("/api/v1/books/manual", json=payload)

    assert response.status_code == 422

@pytest.mark.asyncio
async def test_negarive_duplicate_isbn(client: AsyncClient):
    isbn = "9780132350884"
    payload = {"title": "Book", "page_count": 464, "raw_isbn": isbn}

    await client.post("/api/v1/books/manual", json=payload)

    response = await client.post("/api/v1/books/manual", json=payload)
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_add_book_crud(client: AsyncClient):
    payload = {"title": "Book", "page_count": 56, "publication_year": 2003, "description": "test"}
    response = await client.post("/api/v1/books/manual", json=payload)
    assert response.status_code == 201

    book_id = response.json()["id"]
    
    response = await client.get(f"/api/v1/books/{book_id}")
    assert response.status_code == 200

    assert response.json()["title"] == payload["title"]
    