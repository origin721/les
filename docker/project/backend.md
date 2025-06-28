# Backend контейнер (Rust)

## Dockerfile для backend

```dockerfile
# Dockerfile.backend
FROM rust:1.75 AS builder

WORKDIR /app

# Копируем Cargo files для кеширования зависимостей
COPY back/Cargo.toml back/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm src/main.rs

# Копируем исходники и собираем
COPY back/src ./src
RUN cargo build --release

# Production образ
FROM debian:bookworm-slim

# Устанавливаем зависимости
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем бинарник
COPY --from=builder /app/target/release/secure-message-backend ./

EXPOSE 8080

CMD ["./secure-message-backend"]
```

## Команды

```bash
# Собрать образ
docker build -f docker/Dockerfile.backend -t secure-message-backend .

# Запустить
docker run -d -p 8080:8080 --name backend secure-message-backend

# С переменными окружения
docker run -d -p 8080:8080 \
  -e RUST_LOG=debug \
  -e DATABASE_URL=postgres://user:pass@db:5432/secure_message \
  --name backend secure-message-backend

# Для разработки
docker run -it --rm \
  -v $(pwd)/back:/app \
  -w /app \
  -p 8080:8080 \
  rust:1.75 \
  cargo run
```

## Оптимизация размера

```dockerfile
# Минимальный образ с musl
FROM rust:1.75-alpine AS builder

RUN apk add --no-cache musl-dev

WORKDIR /app
COPY back/Cargo.toml back/Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release --target x86_64-unknown-linux-musl
RUN rm src/main.rs

COPY back/src ./src
RUN cargo build --release --target x86_64-unknown-linux-musl

# Финальный образ
FROM scratch
COPY --from=builder /app/target/x86_64-unknown-linux-musl/release/secure-message-backend /
EXPOSE 8080
CMD ["/secure-message-backend"]
