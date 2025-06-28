# Docker Knowledge Base

## Изученная документация проекта

### Структура Docker документации в проекте
- `docker/README.md` - главная навигация по Docker документации
- `docker/basics/introduction.md` - введение в Docker, основные концепции
- `docker/guides/quick-start.md` - быстрый старт с Docker
- `docker/project/frontend.md` - контейнеризация Svelte приложения
- `docker/project/backend.md` - контейнеризация Rust приложения
- `docker/project/docker-compose.md` - многоконтейнерная настройка
- `docker/troubleshooting/common-errors.md` - решение типичных проблем
- `docker/reference/commands-cheatsheet.md` - шпаргалка команд

### Архитектура проекта secure-message в Docker

#### Сервисы:
1. **Frontend (Svelte)** - порт 3000
   - Node.js 18 alpine для сборки
   - nginx для продакшена
   - Проксирование API на backend

2. **Backend (Rust)** - порт 8080
   - Rust 1.75 для сборки
   - Debian bookworm-slim для продакшена
   - Поддержка переменных окружения

3. **Event-stream (Node.js)** - порт 3001
   - Node.js сервис для real-time коммуникации

4. **PostgreSQL** - порт 5432
   - База данных для проекта

#### Сети и тома:
- Сеть: `secure-network`
- Том: `postgres_data` для персистентности БД

### Ключевые особенности

#### Многоэтапная сборка:
- Frontend: сборка в Node.js → деплой в nginx
- Backend: сборка в Rust → минимальный runtime образ

#### Оптимизации:
- Кеширование зависимостей через отдельное копирование package.json/Cargo.toml
- Alpine образы для уменьшения размера
- .dockerignore для исключения ненужных файлов

#### Режимы работы:
- **Продакшен**: docker-compose.yml с оптимизированными образами
- **Разработка**: docker-compose.dev.yml с volume mounting

### Текущее состояние

#### Что есть:
✅ Полная документация по Docker
✅ Примеры Dockerfile для всех сервисов
✅ Docker Compose конфигурация
✅ Руководства по troubleshooting
✅ Команды для разработки и продакшена

#### Что отсутствует:
❌ Реальные Dockerfile файлы в корне проекта
❌ docker-compose.yml файл
❌ .dockerignore файлы
❌ nginx.conf для frontend

### Следующие шаги для полной контейнеризации:

1. Создать Dockerfile.frontend на основе документации
2. Создать Dockerfile.backend на основе документации  
3. Создать Dockerfile.event-stream
4. Создать docker-compose.yml
5. Создать .dockerignore файлы
6. Создать nginx.conf для frontend
7. Протестировать сборку и запуск

### Полезные команды из документации:

```bash
# Быстрый старт всего проекта
docker-compose up -d

# Проверка статуса
docker-compose ps

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка
docker-compose up --build -d
```

---
*Обновлено: 28.06.2025 - изучена вся Docker документация проекта*
