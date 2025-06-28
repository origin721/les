# Docker для проекта secure-message

**[🏠 ← Главная навигация](../links.md)** | Документация по Docker для запуска и сборки проекта secure-message.

## Быстрый запуск проекта

### Запуск Alpine Linux контейнера для разработки

```bash
# Перейти в папку docker
cd docker

# Собрать и запустить Alpine контейнер с git, nodejs, rust
docker-compose up --build

# Подключиться к контейнеру
docker-compose exec les-scripton sh
```

### Запуск полного проекта

```bash
# Клонировать репозиторий
git clone <repository-url>
cd les-scripton

# Запустить все сервисы
docker-compose up -d

# Проверить статус
docker-compose ps
```

## Структура проекта

### 🏗️ Контейнеры проекта
- [Frontend контейнер](./project/frontend.md) - Контейнеризация Svelte приложения
- [Backend контейнер](./project/backend.md) - Контейнеризация Rust приложения
- [Docker Compose настройка](./project/docker-compose.md) - Конфигурация всех сервисов
- [Alpine Linux Setup](./alpine-setup.md) - Минимальный контейнер для разработки

### 📁 Файлы проекта
- `docker-compose.yml` - Основная конфигурация для запуска всех сервисов
- `Dockerfile` - Dockerfile для Alpine контейнера разработки
- `alpine-setup.md` - Документация по настройке Alpine контейнера

## Команды для разработки

### Основные команды
```bash
# Запустить все сервисы
docker-compose up -d

# Остановить все сервисы
docker-compose down

# Пересобрать и запустить
docker-compose up --build

# Посмотреть логи
docker-compose logs -f

# Подключиться к les-scripton контейнеру
docker-compose exec les-scripton sh
```

### Команды очистки
```bash
# Полная очистка (удаляет контейнеры, тома, образы, сети)
docker-compose down --volumes --rmi all --remove-orphans

# Остановить и удалить тома
docker-compose down --volumes

# Остановить и удалить образы
docker-compose down --rmi all

# Удалить осиротевшие контейнеры
docker-compose down --remove-orphans

# Общая очистка Docker системы
docker system prune -a
```

**⚠️ Внимание:** Команды с `--volumes` удалят все данные из базы данных!

### Отдельные сервисы
```bash
# Запустить les-scripton контейнер для разработки
docker-compose up les-scripton
```

## Порты сервисов

- **Backend**: http://localhost:8080 (после сборки в les-scripton контейнере)
- **Les-scripton**: интерактивный контейнер для разработки

## Общая документация Docker

Если вы новичок в Docker или нужна справочная информация, смотрите:
- [📚 Общая документация Docker](./docker-general/README.md) - Основы, руководства, справочники

## Поддержка

Если у вас возникли проблемы с Docker в проекте:
1. Проверьте [общие проблемы Docker](./docker-general/troubleshooting/common-errors.md)
2. Убедитесь, что Docker и Docker Compose установлены
3. Проверьте, что порты не заняты другими приложениями

---

*Документация обновлена: 28.06.2025*
