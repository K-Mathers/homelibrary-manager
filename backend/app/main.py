# 4. Точка входа main.py и CORS
# В 

# app/main.py
#  мы соединяем приложение:

# Инициализация FastAPI с названием и документацией.
# CORSMiddleware: Разрешает браузеру и десктопному Electron/React приложению (порты http://localhost:5173, http://localhost:3000 и т.д.) делать AJAX-запросы к нашему API. Без этого браузер заблокирует запросы политикой Same-Origin.
# Подключение роутеров:
# python
# app.include_router(books_router, prefix="/api/v1/books", tags=["Books"])
# app.include_router(reading_router, prefix="/api/v1/reading", tags=["Reading"])
# app.include_router(stats_router, prefix="/api/v1", tags=["Statistics & Backup"])
# Маппинг бизнес-ошибок в HTTP-коды:
# BookAlreadyExistsError ➔ 409 Conflict (или 400 Bad Request)
# BookNotFoundError ➔ 404 Not Found
# InvalidIsbnError, InvalidPageRangeError ➔ 422 Unprocessable Entity