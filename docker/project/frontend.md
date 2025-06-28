# Frontend контейнер (Svelte)

## Dockerfile для frontend

```dockerfile
# Dockerfile.frontend
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package files
COPY front/package*.json ./
RUN npm ci

# Копируем исходники и собираем
COPY front/ .
RUN npm run build

# Production образ
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY docker/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Конфигурация nginx

```nginx
# docker/nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    
    server {
        listen 80;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # API проксирование
        location /api/ {
            proxy_pass http://backend:8080/;
        }
    }
}
```

## Команды

```bash
# Собрать образ
docker build -f docker/Dockerfile.frontend -t secure-message-frontend .

# Запустить
docker run -d -p 3000:80 --name frontend secure-message-frontend

# Для разработки с hot reload
docker run -d -p 3000:5173 \
  -v $(pwd)/front:/app \
  -w /app \
  node:18-alpine \
  npm run dev -- --host
```

## .dockerignore для frontend

```
front/node_modules
front/dist
front/.svelte-kit
front/build
