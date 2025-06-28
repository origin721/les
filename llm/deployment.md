# 🚀 Развертывание Secure Message

## 🏗️ Архитектура развертывания

### Development (Локальная разработка)
```
Порты:
- Frontend: http://localhost:5173 (Vite dev server)
- Backend: http://localhost:8080 (Rust Actix)
- Event-Stream: http://localhost:3000 (Node.js)
```

### Production (Правильная архитектура)
```
1. Frontend: npm run build → статика
2. Backend: Rust сервер копирует статику и обслуживает её
3. Event-Stream: Отдельный Node.js сервер с собственным протоколом

Мультипротокольное приложение:
- HTTP/HTTPS (основной)
- WebSocket (реальное время)
- LibP2P (P2P соединения)
- SSE (Server-Sent Events)
```

## 🔧 Быстрый старт Development

### 1. Установка зависимостей
```bash
# Frontend
cd front
npm install

# Event-Stream
cd ../event-stream
npm install

# Backend (Rust)
cd ../back
# Rust должен быть установлен
```

### 2. Запуск всех сервисов
```bash
# Terminal 1 - Event-Stream
cd event-stream
npm start

# Terminal 2 - Backend
cd back
cargo run

# Terminal 3 - Frontend
cd front
npm run dev
```

### 3. Проверка работы
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Event-Stream: http://localhost:3000

## 🐳 Docker развертывание

### Backend (Rust)
```dockerfile
# Dockerfile для backend
FROM rust:1.70 as builder
WORKDIR /app
COPY . .
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/secure-message-backend /usr/local/bin/
EXPOSE 8080
CMD ["secure-message-backend"]
```

### Event-Stream (Node.js)
```dockerfile
# Dockerfile для event-stream
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["node", "src/app.js"]
```

### Frontend (Static)
```dockerfile
# Dockerfile для frontend
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

## 🔄 Docker Compose

### docker-compose.yml
```yaml
version: '3.8'
services:
  frontend:
    build: ./front
    ports:
      - "80:80"
    depends_on:
      - backend
      - event-stream

  backend:
    build: ./back
    ports:
      - "8080:8080"
    environment:
      - PORT=8080
      - EVENT_STREAM_URL=http://event-stream:3000
    volumes:
      - ./data:/app/data

  event-stream:
    build: ./event-stream
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
```

### Запуск
```bash
docker-compose up -d
```

## 🌐 Production настройки

### Nginx конфигурация
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Event-Stream
    location /events {
        proxy_pass http://event-stream:3000;
        proxy_set_header Host $host;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Upgrade $http_upgrade;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Environment Variables
```bash
# Production .env файл
NODE_ENV=production
PORT=3000
RUST_LOG=info
CORS_ORIGINS=https://your-domain.com
JWT_SECRET=your-super-secret-key
DATA_PATH=/app/data
```

## 📊 Мониторинг

### Health Checks
```bash
# Backend health
curl http://localhost:8080/health

# Event-Stream health
curl http://localhost:3000/health

# Frontend availability
curl http://localhost:5173
```

### Логирование
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f event-stream

# PM2 logs (для Node.js)
pm2 logs event-stream
```

## 🔐 Безопасность Production

### SSL/TLS
```bash
# Certbot для Let's Encrypt
certbot --nginx -d your-domain.com
```

### Firewall
```bash
# UFW настройки
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### Backup
```bash
# Backup скрипт
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf backup_$DATE.tar.gz ./data
```

## ⚠️ Частые проблемы

### CORS ошибки
```javascript
// Проверить CORS_ORIGINS в .env
CORS_ORIGINS=http://localhost:5173,https://your-domain.com
```

### Порты заняты
```bash
# Проверить занятые порты
netstat -tulpn | grep :3000
lsof -i :8080
```

### Права доступа к файлам
```bash
# Исправить права для data директории
chmod -R 755 ./data
chown -R app:app ./data
```

## 🎯 Checklist развертывания

### Development
- [ ] Node.js установлен
- [ ] Rust установлен
- [ ] Все зависимости установлены
- [ ] Все сервисы запущены
- [ ] Порты доступны

### Production
- [ ] Docker установлен
- [ ] SSL сертификаты настроены
- [ ] Environment variables настроены
- [ ] Backup настроен
- [ ] Мониторинг настроен
- [ ] Firewall настроен
- [ ] Health checks работают

## 📚 Полезные команды

```bash
# Проверка статуса всех сервисов
docker-compose ps

# Перезапуск сервиса
docker-compose restart backend

# Просмотр логов
docker-compose logs -f --tail=100

# Обновление образов
docker-compose pull
docker-compose up -d

# Очистка
docker system prune -a
