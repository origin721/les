# 🦀 Backend (Rust) - Secure Message

## 🏗️ Архитектура Backend

### Технологический стек
- **Rust**: Основной язык
- **Actix-web**: Web фреймворк
- **Tokio**: Асинхронная среда выполнения
- **Serde**: Сериализация JSON
- **File System**: Хранение файлов

## 📁 Структура проекта
```
back/
├── Cargo.toml              # Зависимости и конфигурация
├── src/
│   ├── main.rs            # Точка входа приложения
│   ├── modules/           # Модули приложения
│   │   ├── mod.rs         # Экспорт модулей
│   │   ├── api/           # HTTP API endpoints
│   │   ├── host_dist/     # Статические файлы
│   │   └── my_events/     # Обработка событий
│   └── utils/             # Утилиты
│       └── mod.rs
```

## 🔧 Основные компоненты

### main.rs - Точка входа
```rust
// Запуск HTTP сервера
// Настройка маршрутов
// Конфигурация CORS
// Инициализация модулей
```

### modules/api/ - HTTP API
```rust
// REST endpoints для:
// - Аутентификация
// - Управление файлами
// - Синхронизация данных
// - WebSocket соединения
```

### modules/host_dist/ - Статические файлы
```rust
// Обслуживание frontend файлов
// Кэширование статики
// Gzip сжатие
```

### modules/my_events/ - События
```rust
// Обработка событий от event-stream
// Синхронизация состояния
// Уведомления
```

## 🌐 API Endpoints

### Аутентификация
```
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
GET  /api/auth/profile
```

### Файлы
```
POST /api/files/upload
GET  /api/files/:id
DELETE /api/files/:id
GET  /api/files/list
```

### События
```
POST /api/events/send
GET  /api/events/history
WebSocket /ws/events
```

## 🔐 Безопасность

### Аутентификация
- JWT токены
- Bcrypt для паролей
- Session management

### Авторизация
- Role-based access control
- Resource ownership validation
- Rate limiting

### Файловая безопасность
- Валидация типов файлов
- Ограничение размеров
- Sandbox для загрузок

## 💾 Хранение данных

### File System структура
```
data/
├── uploads/           # Загруженные файлы
│   ├── images/
│   ├── documents/
│   └── temp/
├── logs/             # Логи системы
├── config/           # Конфигурационные файлы
└── cache/            # Кэш данных
```

### Управление файлами
```rust
// Загрузка с валидацией
async fn upload_file(payload: Multipart) -> Result<FileInfo>

// Получение файла
async fn get_file(file_id: String) -> Result<FileStream>

// Удаление файла
async fn delete_file(file_id: String) -> Result<()>
```

## 🔄 Взаимодействие с другими компонентами

### Frontend ↔ Backend
```rust
// HTTP API для основных операций
// WebSocket для реального времени
// File upload/download
// CORS настройки для dev/prod
```

### Backend ↔ Event-Stream
```rust
// HTTP клиент для отправки событий
// Получение уведомлений
// Синхронизация состояния
```

## 🚀 Развертывание

### Development
```bash
cd back
cargo run
# Сервер запускается на http://localhost:8080
```

### Production
```bash
# Сборка release версии
cargo build --release

# Docker контейнер
docker build -t secure-message-backend .
docker run -p 8080:8080 secure-message-backend
```

### Environment Variables
```bash
# Порт сервера
PORT=8080

# Путь к данным
DATA_PATH=./data

# Event-stream URL
EVENT_STREAM_URL=http://localhost:3000

# JWT секрет
JWT_SECRET=your-secret-key

# CORS origins
CORS_ORIGINS=http://localhost:5173
```

## 📊 Мониторинг и логирование

### Логирование
```rust
// Структурированные логи
log::info!("Server started on port {}", port);
log::error!("Failed to process request: {}", error);

// Логи в файлы
// Ротация логов
// Уровни логирования
```

### Метрики
```rust
// Время ответа API
// Количество запросов
// Ошибки и исключения
// Использование ресурсов
```

## ⚠️ Частые проблемы

### Производительность
- Блокирующие операции в async контексте
- Неэффективная работа с файлами
- Утечки памяти в long-running процессах

### Безопасность
- Недостаточная валидация входных данных
- Отсутствие rate limiting
- Небезопасное хранение секретов

### Развертывание
- Неправильные CORS настройки
- Проблемы с правами доступа к файлам
- Конфликты портов

## 🎯 Best Practices

### Код
```rust
// Используй Result<T, E> для обработки ошибок
// Избегай unwrap() в production коде
// Применяй async/await правильно
// Валидируй все входные данные
```

### Архитектура
```rust
// Разделяй логику по модулям
// Используй dependency injection
// Применяй паттерн Repository
// Тестируй критические компоненты
```

### Безопасность
```rust
// Всегда валидируй входные данные
// Используй prepared statements
// Логируй все важные события
// Применяй принцип least privilege
```

## 🔧 Полезные команды

```bash
# Проверка кода
cargo check

# Тестирование
cargo test

# Форматирование
cargo fmt

# Линтинг
cargo clippy

# Документация
cargo doc --open

# Обновление зависимостей
cargo update
```

## 📚 Зависимости (Cargo.toml)

```toml
[dependencies]
actix-web = "4.0"
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
uuid = { version = "1.0", features = ["v4"] }
chrono = { version = "0.4", features = ["serde"] }
env_logger = "0.10"
log = "0.4"
