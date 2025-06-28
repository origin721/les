# 🌊 Event-Stream (Node.js) - Secure Message

## 🏗️ Архитектура Event-Stream

### Технологический стек
- **Node.js**: Основная платформа
- **Express**: HTTP сервер (встроенный)
- **WebSocket**: Реальное время
- **libsodium**: Криптография
- **File System**: Временное хранение

## 📁 Структура проекта
```
event-stream/
├── package.json           # Зависимости
├── app_config.js         # Конфигурация
├── src/
│   ├── app.js            # Точка входа
│   ├── core/             # Основная логика
│   │   ├── crypt/        # Криптографические функции
│   │   ├── fs/           # Файловая система
│   │   └── *.js          # Утилиты
│   ├── http_server/      # HTTP сервер
│   │   ├── create_http_server.js
│   │   ├── post/         # POST обработчики
│   │   ├── create_event_socket/  # WebSocket
│   │   └── shared_service/       # Общие сервисы
│   ├── types/            # Типы данных
│   ├── validation/       # Валидация
│   └── libs/             # Библиотеки
└── docs/                 # Документация
```

## 🔧 Основные компоненты

### app.js - Точка входа
```javascript
// Запуск HTTP сервера
// Инициализация shared_service
// Настройка портов и конфигурации
```

### core/crypt/ - Криптография
```javascript
// libsodium-wrappers для:
// - Curve25519 шифрование
// - Ed25519 подписи
// - Генерация ключей
// - Хеширование
```

### http_server/ - HTTP API
```javascript
// Endpoints:
// - /events (POST) - отправка событий
// - /events (GET) - SSE подключение
// - /crypto (POST) - криптографические операции
```

## 🌐 API Endpoints

### События
```
POST /events
- Отправка событий в систему
- Валидация и обработка
- Рассылка подписчикам

GET /events
- Server-Sent Events (SSE)
- Подписка на события
- Фильтрация по типам
```

### Криптография
```
POST /crypto
- Генерация ключей
- Шифрование/расшифровка
- Цифровые подписи
- Валидация ключей
```

## 🔄 Взаимодействие с другими компонентами

### Frontend ↔ Event-Stream
```javascript
// SSE для получения событий
// HTTP POST для отправки событий
// WebSocket для альтернативного канала
// Crypto API для шифрования
```

### Backend ↔ Event-Stream
```javascript
// HTTP API для синхронизации
// Обмен событиями
// Координация состояния
```

## 💾 Хранение данных

### Memory Storage
```javascript
// Активные SSE соединения
// Очередь событий
// Кэш сессий
// Временные данные
```

### File System
```javascript
// Логи событий
// Конфигурационные файлы
// Временные файлы
// Backup данных
```

## 🔐 Безопасность

### Валидация
```javascript
// Проверка входящих данных
// Валидация JSON структур
// Санитизация параметров
// Rate limiting
```

### Криптография
```javascript
// Проверка подписей
// Валидация ключей
// Безопасное хранение
// Защищенная передача
```

## 🚀 Развертывание

### Development
```bash
cd event-stream
npm install
npm start
# Сервер на http://localhost:3000
```

### Production
```bash
# PM2 для production
npm install -g pm2
pm2 start src/app.js --name event-stream

# Docker
docker build -t event-stream .
docker run -p 3000:3000 event-stream
```

### Environment Variables
```bash
# Порт сервера
PORT=3000

# Режим работы
NODE_ENV=production

# Пути к данным
DATA_PATH=./data

# CORS настройки
CORS_ORIGINS=http://localhost:5173,http://localhost:8080
```

## 📊 Мониторинг

### Логирование
```javascript
// Структурированные логи
// Уровни логирования
// Ротация файлов
// Error tracking
```

### Метрики
```javascript
// Количество подключений SSE
// Время обработки событий
// Использование памяти
// Пропускная способность
```

## 🔧 Конфигурация

### app_config.js
```javascript
module.exports = {
  port: process.env.PORT || 3000,
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*']
  },
  events: {
    maxQueueSize: 1000,
    cleanupInterval: 60000
  },
  crypto: {
    keyExpiration: 3600000 // 1 час
  }
};
```

## ⚠️ Частые проблемы

### Производительность
- Утечки памяти в SSE соединениях
- Переполнение очереди событий
- Блокирующие криптографические операции

### Сеть
- CORS проблемы с frontend
- Таймауты SSE соединений
- Потеря WebSocket соединений

### Безопасность
- Недостаточная валидация событий
- Уязвимости в crypto API
- Отсутствие rate limiting

## 🎯 Best Practices

### Код
```javascript
// Используй async/await
// Обрабатывай все ошибки
// Валидируй входные данные
// Логируй важные события
```

### Архитектура
```javascript
// Разделяй логику по модулям
// Используй middleware паттерн
// Применяй dependency injection
// Тестируй критические пути
```

### Безопасность
```javascript
// Всегда валидируй входные данные
// Используй HTTPS в production
// Ограничивай размер запросов
// Логируй подозрительную активность
```

## 📚 Зависимости

### package.json
```json
{
  "dependencies": {
    "libsodium-wrappers": "^0.7.11",
    "uuid": "^9.0.0",
    "express": "^4.18.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.0"
  }
}
```

## 🔗 Интеграция с проектом

### Crypto API для Frontend
```javascript
// Доступ к libsodium функциям через HTTP
// Генерация ключей на сервере
// Централизованная криптография
// Кэширование ключей
```

### Event System
```javascript
// Координация между frontend и backend
// Реальное время уведомления
// Синхронизация состояния
// Обработка offline режима
