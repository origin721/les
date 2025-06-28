# Частые ошибки Docker

## Ошибки запуска

### "Cannot connect to the Docker daemon"
```bash
# Проверить статус Docker
sudo systemctl status docker

# Запустить Docker
sudo systemctl start docker

# Добавить пользователя в группу docker
sudo usermod -aG docker $USER
# Перелогиниться
```

### "Port already in use"
```bash
# Найти процесс на порту
sudo lsof -i :3000

# Остановить контейнер на порту
docker ps | grep 3000
docker stop <container_name>

# Использовать другой порт
docker run -p 3001:3000 myapp
```

### "No space left on device"
```bash
# Очистить неиспользуемые данные
docker system prune -a

# Удалить старые образы
docker image prune -a

# Удалить тома
docker volume prune
```

## Ошибки сборки

### "COPY failed: no such file or directory"
```dockerfile
# Неправильно
COPY nonexistent.txt /app/

# Правильно - проверить путь
COPY ./src/app.js /app/
```

### "Package not found"
```dockerfile
# Обновить пакеты перед установкой
RUN apt-get update && apt-get install -y package-name
```

## Проблемы с сетью

### Контейнеры не видят друг друга
```bash
# Создать сеть
docker network create mynetwork

# Запустить в одной сети
docker run --network mynetwork --name app1 myapp
docker run --network mynetwork --name app2 myapp
```

### DNS не работает
```bash
# Перезапустить Docker
sudo systemctl restart docker

# Использовать IP вместо имени
docker run --add-host=myhost:192.168.1.100 myapp
```

## Проблемы с производительностью

### Медленная сборка
```dockerfile
# Использовать .dockerignore
echo "node_modules" > .dockerignore
echo ".git" >> .dockerignore

# Кешировать зависимости
COPY package.json .
RUN npm install
COPY . .
```

### Большой размер образа
```dockerfile
# Использовать alpine образы
FROM node:18-alpine

# Многоэтапная сборка
FROM node:18 AS builder
# ... сборка
FROM node:18-alpine
COPY --from=builder /app/dist /app
