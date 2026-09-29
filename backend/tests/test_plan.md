# Матрица тест-кейсов и план испытаний ПО «HomeLibrary Manager»
Дисциплина: МДК.01.02 «Поддержка и тестирование программных модулей»

---

## 1. План испытаний (Test Plan)

### 1.1. Цели тестирования
1. Проверка корректности бизнес-логики предметной области (Domain Layer) методом «белого ящика».
2. Проверка сценариев использования (Use Cases) с изоляцией от инфраструктуры (In-Memory Fake Repositories).
3. Проверка надежности внешнего REST API (Integration / Black Box) на соответствие спецификации HTTP-кодов и схем данных.
4. Достижение общего покрытия исходного кода тестами не менее **85%**.

---

## 2. Матрица модульных тест-кейсов (White Box: Unit Tests)

| ID | Компонент / Метод | Входные данные | Ожидаемый результат | Метод тестирования |
|---|---|---|---|---|
| **TC-U01** | `ISBN.__post_init__` | Валидный ISBN-13: `"978-5-93286-060-1"` | Успешная инициализация, очистка от дефисов: `"9785932860601"` | Класс эквивалентности (валидные) |
| **TC-U02** | `ISBN.__post_init__` | Валидный ISBN-10: `"0-306-40615-2"` | Успешная инициализация, очистка: `"0306406152"` | Класс эквивалентности (валидные) |
| **TC-U03** | `ISBN.__post_init__` | Неверная длина (9 цифр): `"123456789"` | Исключение `InvalidIsbnError` | Граничные значения |
| **TC-U04** | `ISBN.__post_init__` | Неверные символы: `"978-5-ABC86-060-1"` | Исключение `InvalidIsbnError` | Негативное тестирование |
| **TC-U05** | `ISBN.__post_init__` | Пустая строка: `""` | Исключение `InvalidIsbnError` | Граничные значения |
| **TC-U06** | `PageRange.__post_init__` | `start_page=10, end_page=25` | Успешная валидация, дельта: 15 стр. | Класс эквивалентности |
| **TC-U07** | `PageRange.__post_init__` | `start_page=50, end_page=50` | Успешная валидация, дельта: 0 стр. | Граничные значения |
| **TC-U08** | `PageRange.__post_init__` | `start_page=50, end_page=40` | Исключение `InvalidPageRangeError` (`end >= start`) | Граничные значения / Негативный |
| **TC-U09** | `Rating.__post_init__` | Рейтинг от 1 до 5 (например, `5`) | Успешная инициализация | Класс эквивалентности |
| **TC-U10** | `Rating.__post_init__` | Рейтинг вне диапазона (0 или 6) | Исключение `InvalidRatingError` | Граничные значения |
| **TC-U11** | `Book.update_reading_progress` | `current_page=0` | `status == "unread"` | Граничные значения |
| **TC-U12** | `Book.update_reading_progress` | `current_page=50` (при `page_count=200`) | `status == "reading"` | Класс эквивалентности |
| **TC-U13** | `Book.update_reading_progress` | `current_page=200` (при `page_count=200`) | `status == "read"` (автозавершение) | Граничные значения |
| **TC-U14** | `ReadingSession.calculate_delta` | `start=10, end=45` | Прочитано: 35 страниц | Модульное вычисление |
| **TC-U15** | `AddBookByIsbnUseCase` | Существующий ISBN в репозитории | Исключение `BookAlreadyExistsError` | Use Case логика |
| **TC-U16** | `RecordReadingSessionUseCase` | Достижение последней страницы | Сохранение сессии + статус книги `"read"` | Use Case интеграция |

---

## 3. Матрица интеграционных тест-кейсов API (Black Box: REST API)

| ID | Эндпоинт | Метод | Входные данные | Ожидаемый HTTP статус | Проверка тела ответа |
|---|---|---|---|---|---|
| **TC-I01** | `/api/v1/books` | `GET` | Пустая база данных | `200 OK` | `[]` (пустой список) |
| **TC-I02** | `/api/v1/books/manual` | `POST` | Валидное тело книги JSON | `201 Created` | Объект книги с сгенерированным `id` |
| **TC-I03** | `/api/v1/books/manual` | `POST` | `page_count: -5` (отрицательное число) | `422 Unprocessable Entity` | Детали валидации Pydantic |
| **TC-I04** | `/api/v1/books/manual` | `POST` | Отсутствует обязательное поле `title` | `422 Unprocessable Entity` | Сообщение об отсутствующем поле |
| **TC-I05** | `/api/v1/books/{id}` | `GET` | Несуществующий ID (`9999`) | `404 Not Found` | Сообщение `"Book not found"` |
| **TC-I06** | `/api/v1/reading/sessions`| `POST` | `end_page < start_page` | `422 Unprocessable Entity` | Ошибка валидации диапазона |
| **TC-I07** | `/api/v1/stats/summary` | `GET` | Без параметров | `200 OK` | Статистика: страницы, книги, цели |
| **TC-I08** | `/api/v1/backup/export-csv`| `GET` | Запрос экспорта | `200 OK` | Файл CSV в заголовке `Content-Disposition` |

---

## 4. Команда запуска полного тестового цикла и замера покрытия
```bash
pytest --cov=app tests/ --cov-report=term-missing --cov-report=html
```
Отчет HTML сохраняется в директорию `htmlcov/index.html`.
