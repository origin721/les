# Docker конфигурация проекта

Эта папка содержит документацию по контейнеризации компонентов проекта secure-message.

## Компоненты проекта

### [Frontend (Svelte)](./frontend.md)
- Dockerfile для Svelte приложения
- Конфигурация nginx
- Команды для сборки и запуска

### [Backend (Rust)](./backend.md)
- Dockerfile для Rust приложения
- Настройка cargo и зависимостей
- Команды для сборки и запуска

### [Event-stream (Node.js)](./event-stream.md)
- Dockerfile для Node.js сервиса
- Настройка npm зависимостей
- Команды для сборки и запуска

### [Docker Compose](./docker-compose.md)
- Полная конфигурация всех сервисов
- Настройка сетей и томов
- Переменные окружения

## Быстрый запуск

```bash
# Из корня проекта
docker-compose up -d

# Или из папки docker
cd docker
docker-compose up -d
```

---

*Документация по контейнеризации компонентов проекта secure-message*
