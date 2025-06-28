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
ENTRYPOINT ["./target/release/back"]

# Открываем порт 8080
EXPOSE 8080