# Быстрый старт с Docker

## Установка Docker

### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### Windows/Mac
Скачать Docker Desktop с [docker.com](https://www.docker.com/products/docker-desktop)

## Основные команды

```bash
# Проверить установку
docker --version

# Запустить тестовый контейнер
docker run hello-world

# Построить образ
docker build -t myapp .

# Запустить контейнер
docker run -d -p 3000:3000 --name myapp myapp

# Посмотреть логи
docker logs myapp

# Остановить контейнер
docker stop myapp
```

## Для проекта secure-message

```bash
# Запустить весь проект
docker-compose up -d

# Проверить статус
docker-compose ps

# Остановить
docker-compose down
