# HomeLibrary Manager — Backend Documentation

> **Асинхронный REST API-бэкенд для системы учёта домашней библиотеки и трекинга чтения (HomeLibrary Manager)**.  
> Стек: **Python 3.11+**, **FastAPI**, **SQLAlchemy 2.0 (Asyncio)**, **PostgreSQL (asyncpg)**, **Alembic**, **Pydantic**, **HTTPX**.  
> Архитектура: **Clean Architecture (Чистая архитектура)** + **Domain-Driven Design (DDD)** + **Ports and Adapters (Гексагональная архитектура)**.

---

## 📌 Навигация по документу

- [1. Назначение проекта](#-1-назначение-проекта)
- [2. Архитектурное решение](#-2-архитектурное-решение)
- [3. Архитектура и структура каталогов](#-3-архитектура-и-структура-каталогов)
- [4. Разбор каждого модуля и файла](#-4-разбор-каждого-модуля-и-файла)
- [5. Технологический стек](#-5-технологический-стек)
- [6. Модели данных и схема БД](#-6-модели-данных-и-схема-бд)
- [7. Спецификация REST API](#-7-спецификация-rest-api)
- [8. Инструкция по запуску и развертыванию](#-8-инструкция-по-запуску-и-развертыванию)

---

## 🎯 1. Назначение проекта

**HomeLibrary Manager Backend** представляет собой сервер для управления библиотекой книг, трекинга читательского прогресса и аналитики читательской активности. Сервис спроектирован для взаимодействия с веб-интерфейсом на React и десктопным клиентом на Electron.

### Функционал:
- 📚 **Каталогизация книг**: хранение полной информации о книгах (название, авторы, жанры, издательство, теги, год издания, количество страниц, описание, статус, рейтинг, локальная обложка).
- 🔍 **Автоматическое обогащение по ISBN**: поиск и загрузка метаданных и обложек через внешние открытые API (**OpenLibrary API** и **Google Books API**).
- ⏱ **Трекинг читательских сессий**: фиксация прочитанных страниц (`start_page` ➔ `end_page`), длительности чтения в минутах, даты и заметок. Автоматическое обновление статуса книги (`unread` ➔ `reading` ➔ `read`) по мере прогресса.
- 🎯 **Читательские цели**: постановка и отслеживание целей по прочитанным книгам и страницам на год или конкретный месяц.
- 💬 **Цитатник**: сохранение любимых цитат с привязкой к книге и номеру страницы.
- 📊 **Аналитика и статистика**: агрегация данных за периоды (неделя, месяц, год): общее число прочитанных страниц, завершенных книг, скорость чтения (стр/мин) и процент выполнения целей.
- 📑 **Экспорт данных**: выгрузка каталога библиотеки в формате **CSV** для копирования или переноса в табличные редакторы.

---

## 🏛 2. Архитектурное решение

В основу бэкенда заложены принципы **Чистой Архитектуры (Clean Architecture)** Роберта Мартина и **Domain-Driven Design (DDD)**. Вся система разделена на четыре независимых концентрических слоя с жестким соблюдением **Dependency Rule** (зависимости направлены только внутрь — к Доменному слою):

```mermaid
graph TD
    subgraph "1. Presentation Layer (Внешний транспорт)"
        FastAPI["FastAPI App (app/main.py)"]
        BooksRouter["Books Router (/api/v1/books)"]
        ReadingRouter["Reading Router (/api/v1/reading)"]
        StatsRouter["Stats Router (/api/v1/stats, /backup)"]
        Container["DI Container (app/presentation/container.py)"]
        Schemas["Pydantic v2 Schemas (app/presentation/schemas/)"]
    end

    subgraph "2. Application Layer (Сценарии использования)"
        AddIsbnUC["AddBookByIsbnUseCase"]
        AddManualUC["AddManualBookUseCase"]
        GetCatalogUC["GetLibraryCatalogUseCase"]
        RecordSessionUC["RecordReadingSessionUseCase"]
        GetStatsUC["GetReadingStatisticsUseCase"]
        DTOs["Data Transfer Objects (app/application/dtos/)"]
    end

    subgraph "3. Domain Layer (Бизнес-логика и правила)"
        BookEntity["Entity: Book"]
        SessionEntity["Entity: ReadingSession"]
        GoalEntity["Entity: ReadingGoal"]
        QuoteEntity["Entity: Quote"]
        VO_ISBN["Value Object: ISBN"]
        VO_PageRange["Value Object: PageRange"]
        VO_Rating["Value Object: Rating"]
        Ports["Abstract Ports (Interfaces)"]
        DomainExceptions["Domain Exceptions"]
    end

    subgraph "4. Infrastructure Layer (Адаптеры и БД)"
        SABookRepo["SABookRepository (SQLAlchemy)"]
        SASessionRepo["SAReadingSessionRepository"]
        SAGoalRepo["SAReadingGoalRepository"]
        OpenLibraryClient["OpenLibraryClient (HTTPX)"]
        GoogleBooksClient["GoogleBooksClient (HTTPX)"]
        CoverStorage["LocalCoverStorage"]
        CsvExporter["CsvExportFile (csv.writer)"]
        DBEngine["PostgreSQL Engine (asyncpg)"]
    end

    FastAPI --> BooksRouter
    FastAPI --> ReadingRouter
    FastAPI --> StatsRouter

    BooksRouter --> Container
    ReadingRouter --> Container
    StatsRouter --> Container

    Container --> AddIsbnUC
    Container --> AddManualUC
    Container --> GetCatalogUC
    Container --> RecordSessionUC
    Container --> GetStatsUC

    AddIsbnUC --> Ports
    AddManualUC --> Ports
    GetCatalogUC --> Ports
    RecordSessionUC --> Ports
    GetStatsUC --> Ports

    SABookRepo -.->|implements| Ports
    SASessionRepo -.->|implements| Ports
    SAGoalRepo -.->|implements| Ports
    OpenLibraryClient -.->|implements| Ports
    GoogleBooksClient -.->|implements| Ports
    CoverStorage -.->|implements| Ports

    SABookRepo --> DBEngine
    SASessionRepo --> DBEngine
    SAGoalRepo --> DBEngine

    AddIsbnUC --> BookEntity
    RecordSessionUC --> BookEntity
    RecordSessionUC --> SessionEntity

    BookEntity --> VO_ISBN
    BookEntity --> VO_Rating
    SessionEntity --> VO_PageRange

    style BookEntity fill:#1e3a8a,stroke:#60a5fa,stroke-width:2px,color:#fff
    style AddIsbnUC fill:#064e3b,stroke:#34d399,stroke-width:2px,color:#fff
    style FastAPI fill:#1f2937,stroke:#f59e0b,stroke-width:2px,color:#fff
    style SABookRepo fill:#312e81,stroke:#818cf8,stroke-width:2px,color:#fff
```

### Ключевые архитектурные паттерны:
1. **Rich Domain Model (Богатая доменная модель)**:
   - Бизнес-логика инкапсулирована внутри доменных сущностей, а не «размазана» по сервисам. Например, метод `Book.update_reading_progress(current_page)` самостоятельно валидирует диапазон и переключает жизненный цикл книги (`unread` ➔ `reading` ➔ `read`).
2. **Value Objects (Объекты-значения)**:
   - Неизменяемые структуры (`ISBN`, `PageRange`, `Rating`) со встроенной самовалидацией. Невозможно создать невалидный ISBN (проверяется длина 10/13 цифр, контрольная сумма) или отрицательный диапазон страниц (`end_page >= start_page`).
3. **Ports and Adapters (Порты и адаптеры)**:
   - Доменный слой определяет абстрактные интерфейсы (`AbstractBookRepository`, `AbstractIsbnMetadataProvider`, `AbstractCoverStorage`). Инфраструктурный слой реализует их на конкретных библиотеках (SQLAlchemy 2.0, HTTPX, Pillow). Домен не зависит от деталей реализации и СУБД.
4. **Dependency Injection (Контейнер зависимостей)**:
   - Единая точка сборки зависимостей [`app/presentation/container.py`](./app/presentation/container.py). Контроллеры FastAPI не создают экземпляры классов вручную, а получают готовые Use Cases через `Depends()`.

---

## 📁 3. Архитектура и структура каталогов

Ниже приведена полная структура каталогов бэкенда с описанием роли каждого компонента:

```
backend/
├── app/                                        # Корневой Python-пакет приложения
│   ├── application/                            # Слой сценариев использования (Application Layer)
│   │   ├── dtos/                               # Объекты передачи данных (Data Transfer Objects)
│   │   │   ├── book_dto.py                     # DTO метаданных книг от внешних провайдеров
│   │   │   └── reading_dto.py                  # DTO читательских сессий и статистики
│   │   └── use_cases/                          # Специфичные бизнес-сценарии системы
│   │       ├── add_book_by_isbn.py             # Сценарий добавления книги по ISBN с fallback
│   │       ├── add_manual_book.py              # Сценарий ручного добавления книги пользователем
│   │       ├── get_library_catalog.py          # Сценарий поиска и фильтрации каталога
│   │       ├── get_reading_statistics.py       # Сценарий расчета агрегированной аналитики
│   │       └── record_reading_session.py       # Сценарий фиксации сессии чтения и смены статуса
│   ├── domain/                                 # Слой ядра предметной области (Domain Layer)
│   │   ├── entities/                           # Доменные сущности с идентификаторами и логикой
│   │   │   ├── book.py                         # Корневая сущность Книги (Book Aggregate Root)
│   │   │   ├── quote.py                        # Доменная сущность Цитаты (Quote)
│   │   │   ├── reading_goal.py                 # Доменная сущность Читательской цели (ReadingGoal)
│   │   │   └── reading_session.py              # Доменная сущность Сессии чтения (ReadingSession)
│   │   ├── exceptions.py                       # Чистые доменные исключения бизнес-правил
│   │   ├── ports/                              # Абстрактные интерфейсы репозиториев и провайдеров
│   │   │   ├── book_repository.py              # Контракт хранилища каталога книг
│   │   │   ├── cover_storage.py                # Контракт хранилища обложек книг
│   │   │   ├── isbn_metadata_provider.py       # Контракт внешнего поиска метаданных по ISBN
│   │   │   ├── reading_goal_repository.py      # Контракт хранилища читательских целей
│   │   │   └── reading_session_repository.py   # Контракт хранилища сессий чтения
│   │   └── value_objects/                      # Неизменяемые объекты-значения с валидацией
│   │       ├── isbn.py                         # Объект-значение ISBN (ISBN-10 / ISBN-13)
│   │       ├── page_range.py                   # Объект-значение диапазона прочитанных страниц
│   │       └── rating.py                       # Объект-значение пользовательской оценки (1-5)
│   ├── infrastructure/                         # Слой внешних адаптеров и инфраструктуры
│   │   ├── config.py                           # Настройки приложения через Pydantic Settings
│   │   ├── db/                                 # Настройка базы данных и ORM SQLAlchemy
│   │   │   ├── database.py                     # Создание async_engine и фабрики async_sessionmaker
│   │   │   └── models/                         # Декларативные модели SQLAlchemy 2.0
│   │   │       ├── __init__.py                 # Экспорт моделей для автогенерации Alembic
│   │   │       ├── associations.py             # Таблицы связей Many-to-Many (авторы, жанры, теги)
│   │   │       ├── base.py                     # Базовый DeclarativeBase
│   │   │       ├── book.py                     # Таблица books (BookModel)
│   │   │       ├── lookups.py                  # Справочники: authors, genres, publishers, tags
│   │   │       └── reading.py                  # Таблицы reading_sessions, quotes, reading_goals
│   │   ├── external/                           # Клиенты внешних HTTP-сервисов
│   │   │   ├── google_books_client.py          # Адаптер Google Books API (HTTPX + API Key)
│   │   │   └── open_library_client.py          # Адаптер OpenLibrary Books API (HTTPX)
│   │   ├── repositories/                       # Реализации портов на базе SQLAlchemy ORM
│   │   │   ├── sa_book_repository.py           # Реализация AbstractBookRepository
│   │   │   ├── sa_reading_goal_repository.py   # Реализация AbstractReadingGoalRepository
│   │   │   └── sa_reading_session_repository.py# Реализация AbstractReadingSessionRepository
│   │   └── storage/                            # Файловые хранилища и утилиты
│   │       ├── csv_export.py                   # Экспорт каталога библиотеки в формат CSV
│   │       └── local_cover_storage.py          # Загрузка и сохранение обложек на диск
│   ├── presentation/                           # Слой пользовательского интерфейса (API Transport)
│   │   ├── api/                                # REST контроллеры FastAPI
│   │   │   └── v1/                             # Версия API v1
│   │   │       ├── books_router.py             # Эндпоинты каталога книг (поиск, добавление)
│   │   │       ├── reading_router.py           # Эндпоинты сессий чтения и цитат
│   │   │       └── stats_router.py             # Эндпоинты сводной статистики и экспорта CSV
│   │   ├── container.py                        # Dependency Injection контейнер приложения
│   │   └── schemas/                            # Pydantic v2 схемы валидации и сериализации
│   │       ├── book_schemas.py                 # Схемы запросов и ответов для книг
│   │       └── reading_schemas.py              # Схемы запросов и ответов сессий, целей, статов
│   └── main.py                                 # Точка входа ASGI: CORS, роутеры, обработчики ошибок
├── migrations/                                 # Скрипты и ревизии миграций Alembic
│   ├── versions/                               # Версии миграций схемы базы данных PostgreSQL
│   │   └── 07ef50b32885_initial_postgresql_schema.py # Создание всех таблиц и связей
│   └── env.py                                  # Асинхронный запуск миграций с интеграцией config
├── storage/                                    # Локальное хранилище статических файлов
│   └── covers/                                 # Каталог сохраненных обложек книг
├── tests/                                      # Набор автотестов (МДК.01.02)
│   ├── integration/                            # Интеграционные тесты эндпоинтов REST API
│   │   ├── conftest.py                         # Фикстуры тестового клиента HTTPX
│   │   └── test_api_endpoints.py               # Проверка HTTP кодов и ответов API
│   ├── unit/                                   # Модульные тесты бизнес-логики и Value Objects
│   │   ├── test_book_domain.py                 # Тестирование сущности Book и смены статуса
│   │   ├── test_isbn_vo.py                     # Тестирование валидации и очистки ISBN
│   │   └── test_page_range_vo.py               # Тестирование диапазонов страниц
│   └── test_plan.md                            # План испытаний и матрица тест-кейсов
├── .env                                        # Переменные окружения (локальные секреты)
├── .env.example                                # Шаблон конфигурации переменных окружения
├── alembic.ini                                 # Конфигурационный файл CLI Alembic
├── pyproject.toml                              # Настройки инструментов (Ruff, Pytest)
├── pytest.ini                                  # Конфигурация запуска тестов pytest
├── requirements.txt                            # Зафиксированные зависимости Python
└── seed_data.py                                # Скрипт наполнения базы демонстрационными данными
```

---

## 🔍 4. Разбор каждого модуля и файла

### 🌐 Главная точка входа

#### [`app/main.py`](./app/main.py)
- **Назначение**: Сборка ASGI-приложения FastAPI.
- **Ключевой функционал**:
  - Инициализация `FastAPI(title="Library")`.
  - Регистрация централизованных обработчиков доменных исключений:
    * `BookAlreadyExistsError` ➔ HTTP `409 Conflict`.
    * `BookNotFoundError` ➔ HTTP `404 Not Found`.
    * `InvalidIsbnError`, `InvalidPageRangeError` ➔ HTTP `422 Unprocessable Entity`.
  - Подключение `CORSMiddleware` для взаимодействия с фронтендом (Vite: `http://localhost:5173`).
  - Монтирование роутеров: `/api/v1/books`, `/api/v1/reading`, `/api/v1`.

---

### 🧠 Слой предметной области (Domain Layer)

#### [`app/domain/entities/book.py`](./app/domain/entities/book.py)
- **Сущность `Book`**: Корень агрегата книги.
- **Свойства**: `id`, `title`, `isbn: ISBN | None`, `publication_year`, `page_count`, `description`, `cover_image_path`, `rating: Rating | None`, `status`, `authors`, `genres`, `publisher`, `tags`.
- **Бизнес-логика**:
  * `update_reading_progress(current_page: int)`: автоматически переключает статус между `"unread"`, `"reading"` и `"read"` (когда `current_page == page_count`).
  * `set_rating(rating: Rating)`: устанавливает рейтинг книги от 1 до 5.

#### [`app/domain/entities/reading_session.py`](./app/domain/entities/reading_session.py)
- **Сущность `ReadingSession`**: Запись об одном сеансе чтения книги.
- **Методы**: `calculate_delta()` — рассчитывает количество прочитанных страниц (`end_page - start_page`).

#### [`app/domain/entities/reading_goal.py`](./app/domain/entities/reading_goal.py)
- **Сущность `ReadingGoal`**: Читательская цель пользователя на год или конкретный месяц.

#### [`app/domain/value_objects/isbn.py`](./app/domain/value_objects/isbn.py)
- **Value Object `ISBN`**: Неизменяемый объект с очисткой от дефисов и пробелов. Валидирует длину (10 или 13 символов) и формат. Выбрасывает `InvalidIsbnError` при некорректных входных данных.

#### [`app/domain/value_objects/page_range.py`](./app/domain/value_objects/page_range.py)
- **Value Object `PageRange`**: Контролирует неотрицательность страниц и строгое условие `end_page >= start_page`. Выбрасывает `InvalidPageRangeError`.

#### [`app/domain/value_objects/rating.py`](./app/domain/value_objects/rating.py)
- **Value Object `Rating`**: Проверяет диапазон оценки от 1 до 5 звезд. Выбрасывает `InvalidRatingError`.

#### [`app/domain/ports/`](./app/domain/ports/)
- Абстрактные интерфейсы (`ABC`), определяющие контракты взаимодействия:
  - `AbstractBookRepository`: методы `save()`, `get_by_id()`, `get_by_isbn()`, `search_book()`.
  - `AbstractReadingSessionRepository`: методы `save()`, `get_by_period()`.
  - `AbstractReadingGoalRepository`: методы `save()`, `get_goal()`.
  - `AbstractIsbnMetadataProvider`: метод `fetch_by_isbn()`.
  - `AbstractCoverStorage`: методы `save_cover_from_url()`, `get_cover_path()`.

---

### ⚙️ Слой сценариев использования (Application Layer)

#### [`app/application/use_cases/add_book_by_isbn.py`](./app/application/use_cases/add_book_by_isbn.py)
- **Сценарий `AddBookByIsbnUseCase`**:
  1. Создает объект-значение `ISBN` и проверяет наличие дубликата в репозитории (`BookAlreadyExistsError`).
  2. Опрашивает внешнего провайдера (OpenLibrary). При неудаче переключается на резервного (Google Books).
  3. Если обложка найдена — асинхронно скачивает и сохраняет её через `AbstractCoverStorage`.
  4. Сохраняет книгу в базу через `AbstractBookRepository` и возвращает доменную сущность `Book`.

#### [`app/application/use_cases/add_manual_book.py`](./app/application/use_cases/add_manual_book.py)
- **Сценарий `AddManualBookUseCase`**: Ручное добавление книги пользователем с валидацией обязательных полей.

#### [`app/application/use_cases/get_library_catalog.py`](./app/application/use_cases/get_library_catalog.py)
- **Сценарий `GetLibraryCatalogUseCase`**: Полнотекстовый поиск по подстроке в названии и фильтрация каталога по статусу (`unread`, `reading`, `read`), авторам и жанрам.

#### [`app/application/use_cases/record_reading_session.py`](./app/application/use_cases/record_reading_session.py)
- **Сценарий `RecordReadingSessionUseCase`**:
  1. Проверяет существование книги по `book_id`.
  2. Создает `ReadingSession` с валидацией `PageRange`.
  3. Автоматически вызывает `book.update_reading_progress(end_page)` и обновляет статус книги.
  4. Сохраняет сессию и обновленную книгу в единой транзакции.

#### [`app/application/use_cases/get_reading_statistics.py`](./app/application/use_cases/get_reading_statistics.py)
- **Сценарий `GetReadingStatisticsUseCase`**: Рассчитывает статистику за выбранный интервал: суммарное число страниц, количество завершенных книг, скорость чтения (страниц в день/минуту) и процент выполнения годовой цели.

---

### 🗄 Слой инфраструктуры (Infrastructure Layer)

#### [`app/infrastructure/config.py`](./app/infrastructure/config.py)
- Типизированная конфигурация проекта на базе `pydantic-settings`.
- Считывает `DATABASE_URL` (обязательный параметр), `GOOGLE_BOOKS_API_KEY`, `OPEN_LIBRARY_URL`, `GOOGLE_BOOKS_URL`, `CORS_ORIGINS`.

#### [`app/infrastructure/db/database.py`](./app/infrastructure/db/database.py)
- Асинхронный пул соединений: `create_async_engine(settings.DATABASE_URL, echo=True)`.
- Генератор зависимости `get_db()` для внедрения `AsyncSession`.

#### [`app/infrastructure/db/models/`](./app/infrastructure/db/models/)
- Декларативные модели SQLAlchemy 2.0:
  * `BookModel`: таблица `books` (основные данные, связи с авторами, жанрами, тегами, издателем, сессиями и цитатами).
  * `AuthorModel`, `GenreModel`, `PublisherModel`, `TagModel`: справочники с уникальными наименованиями.
  * `ReadingSessionModel`, `BookQuoteModel`, `ReadingGoalModel`: таблицы трекинга чтения.
  * `book_authors`, `book_genres`, `book_tags`: ассоциативные таблицы для связей Many-to-Many.

#### [`app/infrastructure/repositories/`](./app/infrastructure/repositories/)
- `SABookRepository`: Асинхронная выборка через `select(BookModel).options(selectinload(...))`, мэппинг между ORM-моделями SQLAlchemy и чистыми сущностями `Book`.
- `SAReadingSessionRepository` и `SAReadingGoalRepository`: реализация агрегатных выборок и фильтрации по датам.

#### [`app/infrastructure/external/`](./app/infrastructure/external/)
- `OpenLibraryClient`: парсинг JSON-ответов OpenLibrary API (`ISBN:<val>`).
- `GoogleBooksClient`: вызов Google Books API с передачей авторизационного ключа `key=settings.GOOGLE_BOOKS_API_KEY`.

#### [`app/infrastructure/storage/local_cover_storage.py`](./app/infrastructure/storage/local_cover_storage.py)
- Скачивание картинок обложек через HTTPX и сохранение в папку `storage/covers/`.

#### [`app/infrastructure/storage/csv_export.py`](./app/infrastructure/storage/csv_export.py)
- Класс `CsvExportFile`: генерация структурированного CSV-документа со списком книг (ID, Title, ISBN, PageCount, Status, Rating) через `io.StringIO`.

---

### 🔌 Слой представления и API (Presentation Layer)

#### [`app/presentation/container.py`](./app/presentation/container.py)
- Фабрика внедрения зависимостей (Dependency Injection). Связывает сессию БД `AsyncSession` с репозиториями, клиентами внешних сервисов и создает Use Cases для контроллеров FastAPI.

#### [`app/presentation/api/v1/books_router.py`](./app/presentation/api/v1/books_router.py)
- `GET /api/v1/books`: поиск и фильтрация каталога книг.
- `GET /api/v1/books/{id}`: детальная информация о книге.
- `POST /api/v1/books/isbn/{isbn}`: автоматическое добавление книги по ISBN.
- `POST /api/v1/books/manual`: ручное добавление книги.

#### [`app/presentation/api/v1/reading_router.py`](./app/presentation/api/v1/reading_router.py)
- `POST /api/v1/reading/sessions`: добавление новой сессии чтения с обновлением статуса книги.
- `POST /api/v1/reading/quotes`: сохранение цитаты из книги.

#### [`app/presentation/api/v1/stats_router.py`](./app/presentation/api/v1/stats_router.py)
- `GET /api/v1/stats/summary`: сводная аналитика чтения (страницы, книги, цели).
- `GET /api/v1/backup/export-csv`: скачивание CSV-файла со всей библиотекой.

---

## 💻 5. Технологический стек

| Категория | Технология | Назначение в проекте |
| :--- | :--- | :--- |
| **Язык** | **Python 3.11+** | Основной язык |
| **Web Framework** | **FastAPI 0.110+** | Высокопроизводительный асинхронный веб-фреймворк REST API |
| **ASGI Сервер** | **Uvicorn 0.28+** | Сервер приложений ASGI для асинхронной обработки HTTP |
| **База данных** | **PostgreSQL 17+** | Реляционная СУБД для надежного хранения данных |
| **Драйвер БД** | **asyncpg 0.29+** | Асинхронный бинарный драйвер для PostgreSQL |
| **ORM** | **SQLAlchemy 2.0+** | Асинхронный ORM |
| **Миграции** | **Alembic 1.13+** | Версионирование и накат изменений схемы БД |
| **Валидация** | **Pydantic v2 & Settings** | Строгая валидация входящих/исходящих схем и считывание переменных окружения |
| **HTTP Клиент** | **HTTPX 0.27+** | Асинхронные HTTP-запросы к внешним API OpenLibrary и Google Books |

---

## 🗄 6. Модели данных и схема БД

Ниже представлена ER-диаграмма реляционных связей базы данных PostgreSQL:

```mermaid
erDiagram
    PUBLISHERS ||--o{ BOOKS : "publishes"
    AUTHORS ||--o{ BOOK_AUTHORS : "participates"
    BOOKS ||--o{ BOOK_AUTHORS : "written by"
    GENRES ||--o{ BOOK_GENRES : "categorizes"
    BOOKS ||--o{ BOOK_GENRES : "belongs to"
    TAGS ||--o{ BOOK_TAGS : "tags"
    BOOKS ||--o{ BOOK_TAGS : "tagged with"
    BOOKS ||--o{ READING_SESSIONS : "tracked in"
    BOOKS ||--o{ QUOTES : "contains"

    BOOKS {
        int id PK
        string title "Название книги"
        string isbn "ISBN-10 или ISBN-13"
        int publication_year "Год издания"
        int page_count "Количество страниц"
        text description "Аннотация книги"
        string cover_image_path "Относительный путь к обложке"
        int rating "Оценка от 1 до 5"
        string status "unread | reading | read"
        int publisher_id FK "Ссылка на издательство"
        datetime created_at "Дата добавления"
    }

    AUTHORS {
        int id PK
        string full_name UK "ФИО автора"
    }

    GENRES {
        int id PK
        string name UK "Название жанра"
    }

    PUBLISHERS {
        int id PK
        string name UK "Название издательства"
    }

    TAGS {
        int id PK
        string name UK "Пользовательский тег"
    }

    READING_SESSIONS {
        int id PK
        int book_id FK "Ссылка на книгу"
        int start_page "Начальная страница"
        int end_page "Конечная страница"
        int duration_minutes "Длительность чтения"
        text notes "Заметки по прочитанному"
        date session_date "Дата сессии"
    }

    QUOTES {
        int id PK
        int book_id FK "Ссылка на книгу"
        text quote_text "Текст цитаты"
        int page_number "Номер страницы"
        datetime created_at "Время сохранения"
    }

    READING_GOALS {
        int id PK
        int year "Целевой год"
        int month "Целевой месяц (опционально)"
        int target_books "Цель по книгам"
        int target_pages "Цель по страницам"
    }

    BOOK_AUTHORS {
        int book_id FK
        int author_id FK
    }

    BOOK_GENRES {
        int book_id FK
        int genre_id FK
    }

    BOOK_TAGS {
        int book_id FK
        int tag_id FK
    }
```

---

## 🔌 7. Спецификация REST API

Все маршруты API сгруппированы под префиксом `/api/v1`.

### 📚 Каталог книг (Books)

| Метод | Путь | Описание | Параметры / Тело | Ответ |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/books` | Поиск и фильтрация каталога книг | Query: `query`, `status`, `author_id`, `genre_id` | `200 OK`: `List[BookResponse]` |
| `GET` | `/api/v1/books/{id}` | Получение книги по первичному ключу | Path: `id` (int) | `200 OK`: `BookResponse`<br/>`404`: Не найдено |
| `POST`| `/api/v1/books/isbn/{isbn}` | Автоматическое добавление по ISBN | Path: `isbn` (строка) | `201 Created`: `BookResponse`<br/>`409`: Книга уже есть<br/>`422`: Невалидный ISBN |
| `POST`| `/api/v1/books/manual` | Ручное добавление книги | JSON: `BookRequest` (`title`, `page_count`, `raw_isbn`...) | `201 Created`: `BookResponse`<br/>`422`: Ошибка валидации |

---

### ⏱ Трекинг чтения и цитаты (Reading)

| Метод | Путь | Описание | Параметры / Тело | Ответ |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/reading/sessions` | Фиксация сессии чтения и обновление прогресса | JSON: `ReadingSessionRequest` (`book_id`, `start_page`, `end_page`...) | `201 Created`: `ReadingSessionResponse`<br/>`404`: Книга не найдена<br/>`422`: `end_page < start_page` |
| `POST` | `/api/v1/reading/quotes` | Сохранение цитаты из книги | JSON: `BookQuoteCreateRequest` (`book_id`, `quote_text`, `page_number`) | `201 Created`: `BookQuoteResponse`<br/>`404`: Книга не найдена |

---

### 📊 Статистика и Экспорт (Stats & Backup)

| Метод | Путь | Описание | Параметры / Тело | Ответ |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/stats/summary` | Сводная аналитика по прочитанным страницам и целям | Query: `start_date`, `end_date`, `year`, `month` | `200 OK`: `ReadingStatsResponse` |
| `GET` | `/api/v1/backup/export-csv`| Скачивание каталога библиотеки в формате CSV | — | `200 OK`: Файл `library_export.csv` (`Content-Disposition`) |

---

## 🚀 8. Инструкция по запуску и развертыванию

### 📋 Предварительные требования
- **Python** `3.11` или выше
- Установленная и запущенная СУБД **PostgreSQL 15+**

---

### ⚙️ 1. Настройка виртуального окружения
1. Перейдите в папку бэкенда:
   ```bash
   cd backend
   ```
2. Создайте и активируйте окружение:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # Linux / macOS
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Установите зависимости проекта:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```

---

### 📄 2. Конфигурация окружения (.env)
Создайте файл `.env` на основе шаблона `.env.example`:
```env
DATABASE_URL=postgresql+asyncpg://postgres:your_name@localhost:5432/home_library
OPEN_LIBRARY_URL="https://openlibrary.org/api/books"
GOOGLE_BOOKS_URL="https://www.googleapis.com/books/v1/volumes"
GOOGLE_BOOKS_API_KEY=your_google_books_api_key
```

---

### 🔄 3. Применение миграций базы данных
Примените схему таблиц к PostgreSQL:
```bash
alembic upgrade head
```

---

### 🧪 4. Наполнение базы демонстрационными данными (Seed)
Для заполнения каталога 10 популярными книгами, авторами, жанрами и сессиями чтения выполните:
```bash
python seed_data.py
```

---

### 🚀 5. Запуск сервера разработки
Запустите ASGI-сервер Uvicorn с автоперезагрузкой при изменении файлов:
```bash
uvicorn app.main:app --reload --port 8000
```
- **Swagger UI (Интерактивная документация)**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---
