# Docker - Контейнеризация приложений

## Статус изучения
- [ ] Основы Docker
- [ ] Dockerfile
- [ ] Docker Compose
- [ ] Volumes и Networks
- [ ] Best Practices

## Что такое Docker?

Docker - это платформа для разработки, доставки и запуска приложений в контейнерах. Контейнеры позволяют упаковать приложение со всеми его зависимостями в легковесную, переносимую единицу.

## Основные концепции

### Контейнер
- Изолированная среда выполнения
- Содержит приложение и все его зависимости
- Быстрый запуск и остановка

### Образ (Image)
- Шаблон для создания контейнеров
- Неизменяемый (immutable)
- Состоит из слоев (layers)

### Dockerfile
- Текстовый файл с инструкциями для сборки образа
- Описывает шаги создания образа

## Основные команды

```bash
# Основные команды Docker
docker --version              # Версия Docker
docker info                   # Информация о системе

# Работа с образами
docker images                 # Список образов
docker pull <image>           # Скачать образ
docker build -t <name> .      # Собрать образ

# Работа с контейнерами
docker ps                     # Запущенные контейнеры
docker ps -a                  # Все контейнеры
docker run <image>            # Запустить контейнер
docker stop <container>       # Остановить контейнер
docker rm <container>         # Удалить контейнер
```

## Применение в проекте

В нашем проекте Docker используется для:
- Контейнеризации backend приложения
- Создания изолированной среды разработки
- Упрощения развертывания

## Анализ Dockerfile проекта

### Структура Dockerfile
```dockerfile
FROM alpine:latest

# Обновляем пакеты Alpine
RUN apk update && apk upgrade

# Устанавливаем необходимые пакеты
RUN apk add --no-cache \
    git \
    nodejs \
    npm \
    cargo \
    rust

# Создаем рабочую директорию
WORKDIR /app

# Копируем файлы проекта
COPY . .

# Переходим в директорию фронтенда и собираем его
WORKDIR /app/front
RUN npm install
RUN npm run build

# Удаляем старую папку dist в back (если существует) и копируем новую
RUN rm -rf ../back/dist
RUN cp -r ./dist ../back/dist

# Переходим в директорию бэкенда
WORKDIR /app/back

# Собираем Rust приложение
RUN cargo build --release

# Запускаем только Rust сервер
ENTRYPOINT ["./back/target/release/back"]

# Открываем порт 8080
EXPOSE 8080
```

### Особенности архитектуры
1. **Multi-stage build**: Сборка frontend и backend в одном контейнере
2. **Alpine Linux**: Легковесный базовый образ
3. **Статическая сборка**: Frontend собирается и копируется в backend
4. **Rust backend**: Основное приложение на Rust

### Docker Compose конфигурация
```yaml
services:
  les-scripton:
    build:
      context: ..
      dockerfile: docker/Dockerfile
    container_name: les-scripton-development
    ports:
      - "8080:8080"
    volumes:
      - ../:/app
    working_dir: /app
    stdin_open: true
    tty: true
    command: sh
```

### Особенности Docker Compose
- **Development mode**: Контейнер запускается с shell для разработки
- **Volume mounting**: Код проекта монтируется для live reload
- **Port mapping**: Порт 8080 проброшен на хост

## Файлы проекта

- `docker/Dockerfile` - Dockerfile для backend
- `docker/docker-compose.yml` - Конфигурация Docker Compose
- `docker/README.md` - Документация по Docker в проекте

## Следующие шаги изучения

1. [ ] Изучить основы контейнеризации
2. [ ] Понять структуру Dockerfile
3. [ ] Освоить Docker Compose
4. [ ] Изучить volumes и networks
5. [ ] Применить best practices

## Полезные ресурсы

- [Официальная документация Docker](https://docs.docker.com/)
- [Docker Hub](https://hub.docker.com/)
- Локальная документация: `docker/docker-general/`
