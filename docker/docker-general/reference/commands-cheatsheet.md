# Docker команды - шпаргалка

## Образы

```bash
# Построить
docker build -t myapp .

# Список
docker images

# Удалить
docker rmi myapp

# Очистить
docker image prune -a
```

## Контейнеры

```bash
# Запустить
docker run -d -p 3000:3000 --name myapp myapp

# Список
docker ps -a

# Остановить
docker stop myapp

# Удалить
docker rm myapp

# Логи
docker logs -f myapp

# Выполнить команду
docker exec -it myapp bash
```

## Docker Compose

```bash
# Запустить
docker-compose up -d

# Остановить
docker-compose down

# Логи
docker-compose logs -f

# Пересобрать
docker-compose up --build

# Полная очистка
docker-compose down --volumes --rmi all --remove-orphans

# Остановить и удалить тома
docker-compose down --volumes

# Остановить и удалить образы
docker-compose down --rmi all

# Удалить осиротевшие контейнеры
docker-compose down --remove-orphans
```

## Очистка

```bash
# Все неиспользуемое
docker system prune -a

# Контейнеры
docker container prune

# Образы
docker image prune

# Тома
docker volume prune
```

## Отладка

```bash
# Информация о системе
docker info

# Статистика
docker stats

# События
docker events

# Использование диска
docker system df
