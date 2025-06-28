# 🔨 Процесс сборки Secure Message

## 🏗️ Правильная архитектура сборки

### 1. Frontend → Статика
```bash
cd front
npm run build
# Результат: front/dist/ - статические файлы
```

### 2. Backend → Копирование статики
```rust
// Backend копирует статику из front/dist/
// и обслуживает её через Actix-web
// Один сервер для всего
```

### 3. Event-Stream → Отдельный сервер
```bash
cd event-stream
node src/app.js
# Отдельный Node.js сервер с собственным протоколом
```

## 📦 Пошаговый процесс сборки

### Шаг 1: Сборка Frontend
```bash
# Переходим в директорию frontend
cd front

# Устанавливаем зависимости (если нужно)
npm install

# Собираем статику
npm run build

# Результат в front/dist/:
# ├── index.html
# ├── assets/
# │   ├── index-[hash].js
# │   ├── index-[hash].css
# │   └── [другие ассеты]
# └── vite.svg
```

### Шаг 2: Настройка Backend для статики
```rust
// В back/src/modules/host_dist/
// Backend должен:
// 1. Копировать файлы из ../front/dist/
// 2. Обслуживать их через Actix-web
// 3. Настроить fallback на index.html для SPA

use actix_web::{web, App, HttpServer, Result};
use actix_files::Files;

// Обслуживание статических файлов
.service(Files::new("/", "./static").index_file("index.html"))
// Fallback для SPA роутинга
.default_service(web::route().to(serve_index))
```

### Шаг 3: Запуск Backend
```bash
cd back

# Сборка Rust приложения
cargo build --release

# Запуск (обслуживает и API, и статику)
cargo run
# или
./target/release/secure-message-backend

# Доступно на: http://localhost:8080
```

### Шаг 4: Запуск Event-Stream
```bash
cd event-stream

# Установка зависимостей (если нужно)
npm install

# Запуск сервера
npm start
# или
node src/app.js

# Доступно на: http://localhost:3000
```

## 🌐 Мультипротокольная архитектура

### Протоколы связи

#### 1. HTTP/HTTPS (Основной)
```
Frontend ↔ Backend
- REST API запросы
- Загрузка статических файлов
- Аутентификация
- Файловые операции
```

#### 2. Server-Sent Events (SSE)
```
Frontend ↔ Event-Stream
- Получение событий в реальном времени
- Уведомления
- Синхронизация состояния
```

#### 3. WebSocket
```
Frontend ↔ Event-Stream
- Двусторонняя связь
- Чат в реальном времени
- Быстрый обмен сообщениями
```

#### 4. LibP2P (P2P)
```
Frontend ↔ Frontend (напрямую)
- Прямые P2P соединения
- Обход серверов
- Децентрализованная связь
```

## 🔧 Конфигурация для Production

### Frontend (Vite конфигурация)
```typescript
// vite.config.ts
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // для production
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['svelte'],
          crypto: ['libsodium-wrappers']
        }
      }
    }
  }
});
```

### Backend (Rust конфигурация)
```rust
// Cargo.toml
[profile.release]
opt-level = 3
lto = true
codegen-units = 1
panic = "abort"

[dependencies]
actix-web = "4.0"
actix-files = "0.6"
tokio = { version = "1.0", features = ["full"] }
```

### Event-Stream (Node.js конфигурация)
```javascript
// app_config.js
module.exports = {
  port: process.env.PORT || 3000,
  protocols: {
    http: true,
    websocket: true,
    sse: true
  },
  cors: {
    origins: process.env.CORS_ORIGINS?.split(',') || ['*']
  }
};
```

## 📁 Структура после сборки

### Production структура
```
secure-message/
├── back/
│   ├── target/release/
│   │   └── secure-message-backend  # Исполняемый файл
│   └── static/                     # Копия front/dist/
│       ├── index.html
│       └── assets/
├── event-stream/
│   ├── src/
│   └── node_modules/
└── front/
    └── dist/                       # Статика (копируется в back/static/)
```

## 🚀 Скрипты автоматизации

### build.sh (Полная сборка)
```bash
#!/bin/bash
set -e

echo "🔨 Сборка Secure Message..."

# 1. Сборка Frontend
echo "📦 Сборка Frontend..."
cd front
npm run build
cd ..

# 2. Копирование статики в Backend
echo "📋 Копирование статики..."
rm -rf back/static
cp -r front/dist back/static

# 3. Сборка Backend
echo "🦀 Сборка Backend..."
cd back
cargo build --release
cd ..

# 4. Проверка Event-Stream
echo "🌊 Проверка Event-Stream..."
cd event-stream
npm install --production
cd ..

echo "✅ Сборка завершена!"
echo "Backend: ./back/target/release/secure-message-backend"
echo "Event-Stream: cd event-stream && npm start"
```

### start-production.sh
```bash
#!/bin/bash

# Запуск Event-Stream в фоне
cd event-stream
npm start &
EVENT_STREAM_PID=$!

# Запуск Backend (основной сервер)
cd ../back
./target/release/secure-message-backend &
BACKEND_PID=$!

echo "🚀 Сервисы запущены:"
echo "Backend PID: $BACKEND_PID (http://localhost:8080)"
echo "Event-Stream PID: $EVENT_STREAM_PID (http://localhost:3000)"

# Ожидание завершения
wait $BACKEND_PID
kill $EVENT_STREAM_PID
```

## 🔍 Проверка работы

### 1. Проверка Frontend
```bash
# Статика должна обслуживаться Backend'ом
curl http://localhost:8080/
curl http://localhost:8080/assets/index-[hash].js
```

### 2. Проверка API
```bash
# Backend API
curl http://localhost:8080/api/health

# Event-Stream API
curl http://localhost:3000/events
```

### 3. Проверка протоколов
```bash
# SSE соединение
curl -N -H "Accept: text/event-stream" http://localhost:3000/events

# WebSocket (через браузер или wscat)
wscat -c ws://localhost:3000/ws
```

## ⚠️ Важные моменты

### 1. Порты в Production
```
- Backend: 8080 (обслуживает Frontend + API)
- Event-Stream: 3000 (отдельный протокол)
- Frontend: НЕ нужен отдельный сервер (статика в Backend)
```

### 2. CORS настройки
```rust
// Backend должен разрешать запросы к Event-Stream
.wrap(
    Cors::default()
        .allowed_origin("http://localhost:3000")
        .allowed_methods(vec!["GET", "POST"])
)
```

### 3. Fallback для SPA
```rust
// Все неизвестные маршруты → index.html
async fn serve_index() -> Result<NamedFile> {
    Ok(NamedFile::open("./static/index.html")?)
}
```

## 🎯 Checklist сборки

### Перед сборкой
- [ ] Node.js установлен
- [ ] Rust установлен
- [ ] Все зависимости установлены
- [ ] Тесты проходят

### После сборки
- [ ] Frontend собран в dist/
- [ ] Статика скопирована в back/static/
- [ ] Backend скомпилирован
- [ ] Event-Stream готов к запуску
- [ ] Все порты доступны
- [ ] CORS настроен правильно
