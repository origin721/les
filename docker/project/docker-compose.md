# Docker Compose для проекта

## docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:80"
    depends_on:
      - backend
    networks:
      - secure-network

  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "8080:8080"
    environment:
      - RUST_LOG=info
      - DATABASE_URL=postgres://postgres:password@db:5432/secure_message
    depends_on:
      - db
    networks:
      - secure-network

  event-stream:
    build:
      context: .
      dockerfile: docker/Dockerfile.event-stream
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
    networks:
      - secure-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=secure_message
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - secure-network

networks:
  secure-network:
    driver: bridge

volumes:
  postgres_data:
```

## Команды

```bash
# Запустить все сервисы
docker-compose up -d

# Посмотреть логи
docker-compose logs -f

# Остановить
docker-compose down

# Пересобрать и запустить
docker-compose up --build -d

# Запустить только определенный сервис
docker-compose up frontend

# Масштабирование
docker-compose up --scale backend=3 -d
```

## Для разработки

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend:
    image: node:18-alpine
    working_dir: /app
    volumes:
      - ./front:/app
    ports:
      - "5173:5173"
    command: npm run dev -- --host
    networks:
      - secure-network

  backend:
    image: rust:1.75
    working_dir: /app
    volumes:
      - ./back:/app
    ports:
      - "8080:8080"
    command: cargo run
    networks:
      - secure-network
```

```bash
# Запуск для разработки
docker-compose -f docker-compose.dev.yml up
