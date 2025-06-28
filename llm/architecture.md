# 🏗️ Архитектура Secure Message

## 📁 Структура проекта
```
secure-message/
├── front/                  # Frontend приложение
│   ├── src/
│   │   ├── pages/         # Страницы (ui/stores/index.ts)
│   │   ├── widgets/       # Бизнес-компоненты
│   │   ├── components/    # Простые UI элементы
│   │   ├── stores/        # Глобальные сторы
│   │   ├── core/          # Утилиты и хелперы
│   │   ├── api/           # HTTP, WebSocket, P2P
│   │   ├── indexdb/       # База данных
│   │   └── routing/       # Кастомный роутинг
│   └── llm/               # LLM документация frontend
├── back/                   # Backend сервер (Rust)
│   ├── src/
│   │   ├── main.rs        # Точка входа
│   │   ├── modules/       # Модули приложения
│   │   └── utils/         # Утилиты
│   └── Cargo.toml
├── event-stream/          # Event сервер (Node.js)
│   ├── src/
│   │   ├── app.js         # Точка входа
│   │   ├── core/          # Основная логика
│   │   ├── http_server/   # HTTP сервер
│   │   └── types/         # Типы данных
│   └── package.json
└── llm/                   # LLM документация проекта
```

## 🔄 Взаимодействие компонентов

### Frontend ↔ Backend
- **HTTP API**: REST запросы для основных операций
- **WebSocket**: Реальное время для чатов
- **File Upload**: Загрузка файлов и медиа

### Frontend ↔ Event-Stream
- **Server-Sent Events (SSE)**: Получение событий
- **HTTP POST**: Отправка событий
- **WebSocket**: Альтернативный канал

### Backend ↔ Event-Stream
- **HTTP API**: Синхронизация состояния
- **File System**: Общие файлы и логи

## 🔐 Криптографическая архитектура

### Уровни шифрования
1. **Transport Layer**: TLS/HTTPS
2. **Application Layer**: Curve25519 + Ed25519
3. **Storage Layer**: Зашифрованный IndexedDB

### Ключи и подписи
- **Curve25519**: Шифрование сообщений
- **Ed25519**: Цифровые подписи
- **Пароли**: Для локального шифрования

## 🌐 Сетевая архитектура

### P2P соединения
- **LibP2P**: Основной P2P протокол
- **WebRTC**: Прямые соединения
- **STUN/TURN**: NAT traversal

### Централизованные сервисы
- **Event-Stream**: Координация событий
- **Backend**: API и файловое хранилище

## 💾 Хранение данных

### Frontend (IndexedDB)
- Аккаунты пользователей
- Ключи шифрования
- История сообщений
- Настройки приложения

### Backend (File System)
- Медиа файлы
- Логи системы
- Конфигурация

### Event-Stream (Memory + Files)
- Активные соединения
- Очередь событий
- Временные данные

## 🚀 Развертывание

### Development
```bash
# Frontend
cd front && npm run dev

# Backend  
cd back && cargo run

# Event-Stream
cd event-stream && npm start
```

### Production
- **Frontend**: Static hosting (Nginx)
- **Backend**: Docker container
- **Event-Stream**: Node.js server

## ⚠️ Критические зависимости
- **libsodium**: Криптография
- **LibP2P**: P2P сеть
- **Svelte 5**: Frontend фреймворк
- **Actix-web**: Backend фреймворк
- **IndexedDB**: Локальное хранилище
