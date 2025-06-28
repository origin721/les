# Docker Documentation

**[🏠 ← Главная навигация](../links.md)** | Документация по Docker для проекта secure-message, организованная по темам и практическим вопросам.

## Структура документации

### 📚 Основы
- [Введение в Docker](./basics/introduction.md) - Что такое Docker и зачем он нужен
- [Установка Docker](./basics/installation.md) - Установка Docker на разных ОС
- [Основные концепции](./basics/concepts.md) - Образы, контейнеры, тома, сети

### 🛠️ Практические руководства
- [Базовые команды](./guides/basic-commands.md) - Основные команды Docker
- [Создание Dockerfile](./guides/dockerfile.md) - Как писать Dockerfile
- [Docker Compose](./guides/docker-compose.md) - Многоконтейнерные приложения
- [Работа с томами](./guides/volumes.md) - Управление данными

### 🏗️ Для проекта secure-message
- [Frontend контейнер](./project/frontend.md) - Контейнеризация Svelte приложения
- [Backend контейнер](./project/backend.md) - Контейнеризация Rust приложения
- [Event-stream сервис](./project/event-stream.md) - Контейнеризация Node.js сервиса
- [Полная сборка](./project/full-setup.md) - Запуск всего проекта в Docker
- [Alpine Linux Setup](./alpine-setup.md) - Минимальный контейнер для разработки

### 🔧 Решение проблем
- [Отладка контейнеров](./troubleshooting/debugging.md) - Как найти и исправить проблемы
- [Проблемы с сетью](./troubleshooting/networking.md) - Сетевые проблемы
- [Проблемы с производительностью](./troubleshooting/performance.md) - Оптимизация
- [Частые ошибки](./troubleshooting/common-errors.md) - Типичные ошибки и их решения

### 🚀 Продвинутые темы
- [Безопасность](./advanced/security.md) - Безопасность контейнеров
- [Оптимизация образов](./advanced/optimization.md) - Уменьшение размера образов
- [CI/CD интеграция](./advanced/cicd.md) - Автоматизация сборки и деплоя
- [Мониторинг](./advanced/monitoring.md) - Мониторинг контейнеров

### 📖 Справочники
- [Команды Docker](./reference/docker-commands.md) - Полный список команд
- [Команды Docker Compose](./reference/compose-commands.md) - Команды Compose
- [Переменные окружения](./reference/environment-vars.md) - Настройка через ENV
- [Лучшие практики](./reference/best-practices.md) - Рекомендации

## Быстрый старт

### Запуск Alpine Linux контейнера для разработки

```bash
# Перейти в папку docker
cd docker

# Собрать и запустить Alpine контейнер с git, nodejs, rust
docker-compose up --build

# Подключиться к контейнеру
docker-compose exec alpine-dev sh
```

### Запуск полного проекта

```bash
# Клонировать репозиторий
git clone <repository-url>
cd secure-message

# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps
```

## Полезные ссылки

- [Официальная документация Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- [Docker Compose документация](https://docs.docker.com/compose/)
- [Лучшие практики Dockerfile](https://docs.docker.com/develop/dev-best-practices/)

## Поддержка

Если у вас возникли вопросы:
1. Проверьте [раздел решения проблем](./troubleshooting/)
2. Посмотрите [частые ошибки](./troubleshooting/common-errors.md)
3. Изучите [справочники](./reference/)

---

*Документация обновлена: 28.06.2025*
