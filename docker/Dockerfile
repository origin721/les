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

# Копируем файлы проекта (если нужно)
# COPY . .

# Команда по умолчанию
CMD ["sh"]
