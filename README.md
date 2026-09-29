# 📘 HomeLibrary Manager

> Десктопное приложение для каталогизации домашней библиотеки и трекинга чтения.  
> Курсовой проект по дисциплине **МДК.01.02 «Поддержка и тестирование программных модулей»** (специальность 09.02.07).

---

## 🛠 Технологический стек

- **Архитектура:** Clean Architecture (Чистая Архитектура / Ports & Adapters) + Pragmatic DDD
- **Backend:** Python 3.10+ • FastAPI • SQLAlchemy 2.0 (Async) • SQLite (`aiosqlite`) • Pydantic v2 • Alembic • HTTPX
- **Frontend:** React 18 • TypeScript • Vite • Tailwind CSS • Lucide React • Recharts • Axios
- **Десктоп-оболочка:** Electron • Electron Builder
- **Тестирование & качество:** Pytest • pytest-asyncio • pytest-cov (White Box / Black Box) • Ruff (PEP 8)

---

## 🚀 Быстрый старт и установка зависимостей

### 1. Предварительные требования
- **Python** 3.10 или выше
- **Node.js** 18 или выше (npm 9+)

---

### 2. Настройка Backend (Python)

1. Откройте терминал в папке `backend`:
   ```bash
   cd backend
   ```
2. Создайте виртуальное окружение:
   ```bash
   python -m venv venv
   ```
3. Активируйте виртуальное окружение:
   - **Windows (PowerShell):**
     ```powershell
     .\venv\Scripts\Activate.ps1
     ```
   - **Windows (cmd):**
     ```cmd
     venv\Scripts\activate.bat
     ```
   - **Linux / macOS:**
     ```bash
     source venv/bin/activate
     ```
4. Установите зависимости:
   ```bash
   pip install --upgrade pip
   pip install -r requirements.txt
   ```
5. Скопируйте файл конфигурации окружения:
   ```bash
   cp .env.example .env
   ```

---

### 3. Настройка Frontend (React + Vite)

1. Откройте терминал в папке `frontend`:
   ```bash
   cd frontend
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```
3. Скопируйте файл конфигурации окружения:
   ```bash
   cp .env.example .env
   ```

---

### 4. Настройка Electron (Desktop Shell)

1. Откройте терминал в папке `electron`:
   ```bash
   cd electron
   ```
2. Установите зависимости:
   ```bash
   npm install
   ```

*(Либо из корневой директории выполните `npm run install:all`)*

---

## 🧪 Запуск тестирования и замер покрытия (МДК.01.02)

Все команды запускаются в активированном виртуальном окружении из директории `backend`:

1. **Запуск модульных тестов:**
   ```bash
   pytest tests/unit/ -v
   ```

2. **Запуск интеграционных тестов API:**
   ```bash
   pytest tests/integration/ -v
   ```

3. **Сводный запуск всех тестов с отчетом о покрытии (не менее 85%):**
   ```bash
   pytest --cov=app tests/ --cov-report=term-missing
   ```

4. **Генерация HTML-отчета о покрытии для курсового проекта:**
   ```bash
   pytest --cov=app tests/ --cov-report=html
   # Откройте htmlcov/index.html в браузере
   ```

5. **Проверка линтером (PEP 8):**
   ```bash
   ruff check app tests
   ```

---

## 💻 Запуск проекта в режиме разработки

### Вариант 1: Раздельный запуск

1. **Backend:**
   ```bash
   cd backend
   uvicorn app.main:app --reload --port 8000
   ```
   *Swagger UI будет доступен по адресу:* `http://127.0.0.1:8000/docs`

2. **Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   *Веб-интерфейс будет доступен по адресу:* `http://localhost:5173`

3. **Electron:**
   ```bash
   cd electron
   npm run dev
   ```

### Вариант 2: Запуск из корня проекта

1. Установите зависимости в корне:
   ```bash
   npm install
   ```
2. Запустите веб-связку (Backend + Frontend):
   ```bash
   npm run dev:web
   ```
3. Запустите полный стек с Electron:
   ```bash
   npm run dev
   ```

---

## 📦 Сборка дистрибутива (.EXE)

1. **Сборка фронтенда:**
   ```bash
   cd frontend && npm run build
   ```
2. **Компиляция бэкенда в standalone исполняемый файл через PyInstaller:**
   ```bash
   cd backend && pyinstaller --onefile app/main.py --name homelibrary-backend
   ```
3. **Сборка инсталлятора Electron (.exe):**
   ```bash
   cd electron && npm run build
   ```
   Готовый установщик `HomeLibrary_Setup.exe` будет создан в папке `electron/release/`.
