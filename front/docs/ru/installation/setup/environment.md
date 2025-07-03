# 🌍 Настройка окружения

**[📋 ← Установка](../index.md)** | **[🔧 ← Общие инструкции](../common.md)** | **[📦 ← Node.js](nodejs.md)**

Настройка переменных окружения и конфигурации проекта.

## 📝 Файл .env

### Создание файла .env
В корне папки `front` создайте файл `.env`:

```bash
# Linux/macOS
touch .env

# Windows (через командную строку)
echo. > .env
```

### Базовая конфигурация
```bash
# .env
VITE_APP_NAME="Secure Message App"
VITE_API_URL="http://localhost:3000"
VITE_P2P_PORT="9000"
VITE_DEBUG=false
```

### Конфигурация для разработки
```bash
# .env.development
VITE_DEBUG=true
VITE_LOG_LEVEL="debug"
VITE_API_URL="http://localhost:3000"
```

### Конфигурация для продакшена
```bash
# .env.production
VITE_DEBUG=false
VITE_LOG_LEVEL="error"
VITE_API_URL="https://your-api-domain.com"
```

## 🔌 Настройка портов

### Порты по умолчанию
- **Frontend (Vite):** 5173
- **P2P (LibP2P):** 9000
- **Preview:** 4173

### Изменение портов
```bash
# В package.json или через команду
npm run dev -- --port 3000

# Для preview
npm run preview -- --port 8080

# С доступом по сети
npm run dev -- --host --port 3000
```

### Проверка занятых портов

#### Linux/macOS
```bash
# Проверка порта
lsof -i :5173
netstat -tulpn | grep :5173

# Остановка процесса
kill -9 $(lsof -t -i:5173)
```

#### Windows
```cmd
# Проверка порта
netstat -ano | findstr :5173

# Остановка процесса
taskkill /PID [PID_NUMBER] /F
```

## 🔐 Переменные окружения

### Основные переменные
```bash
# Название приложения
VITE_APP_NAME="Secure Message App"

# URL API сервера
VITE_API_URL="http://localhost:3000"

# Порт для P2P соединений
VITE_P2P_PORT="9000"

# Режим отладки
VITE_DEBUG=false

# Уровень логирования (debug, info, warn, error)
VITE_LOG_LEVEL="info"
```

### Дополнительные переменные
```bash
# Настройки криптографии
VITE_ENCRYPTION_ENABLED=true
VITE_DEFAULT_ALGORITHM="AES-256-GCM"

# Настройки сети
VITE_NETWORK_TIMEOUT=5000
VITE_MAX_PEERS=50

# UI настройки
VITE_DEFAULT_THEME="dark"
VITE_DEFAULT_LANGUAGE="ru"
```

## 🎨 Настройка Vite

### vite.config.ts
Основные настройки уже включены в проект. При необходимости можете изменить:

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    port: 5173,        // порт разработки
    host: true,        // доступ по сети
    open: true,        // автооткрытие браузера
  },
  preview: {
    port: 4173,        // порт preview
    host: true,
  },
  // другие настройки...
});
```

### Переопределение настроек
```bash
# Изменение порта через CLI
npm run dev -- --port 3000

# С кастомным хостом
npm run dev -- --host 0.0.0.0 --port 3000

# Отключение автооткрытия браузера
npm run dev -- --no-open
```

## 📱 Настройки для мобильных устройств

### Локальная сеть
```bash
# Запуск с доступом по сети
npm run dev -- --host

# Результат:
# Local:   http://localhost:5173
# Network: http://192.168.1.100:5173
```

### Тестирование на устройствах
1. Убедитесь что устройства в одной Wi-Fi сети
2. Используйте Network адрес для доступа
3. Проверьте файрвол на компьютере

### Настройка для Android (Termux)
```bash
# В Termux используйте 0.0.0.0
npm run preview -- --host 0.0.0.0

# Или с кастомным портом
npm run preview -- --host 0.0.0.0 --port 8080
```

## 🔧 Дополнительные настройки

### Настройка npm
```bash
# Настройка глобального префикса (если нужно)
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Настройка реестра
npm config set registry https://registry.npmjs.org/

# Просмотр конфигурации
npm config list
```

### Настройка Git (если нужно)
```bash
# Глобальные настройки
git config --global user.name "Ваше Имя"
git config --global user.email "your.email@example.com"

# Для конкретного проекта
git config user.name "Ваше Имя"
git config user.email "your.email@example.com"
```

## ❗ Решение проблем

### .env файл не работает
```bash
# Убедитесь что файл в правильном месте
ls -la | grep .env

# Проверьте права доступа
chmod 644 .env

# Перезапустите dev сервер
npm run dev
```

### Проблемы с портами
```bash
# Смена порта через переменную
PORT=3000 npm run dev

# Или через vite.config.ts
# изменить server.port
```

### Переменные не загружаются
1. Перезапустите dev сервер
2. Убедитесь что переменные начинаются с `VITE_`
3. Проверьте синтаксис файла .env

### Проблемы с хостом
```bash
# Если --host не работает, попробуйте
npm run dev -- --host 0.0.0.0

# Или через переменную
HOST=0.0.0.0 npm run dev
```

## ✅ Проверка настроек

### Проверка переменных
Откройте консоль браузера и выполните:
```javascript
// Проверка переменных окружения
console.log(import.meta.env.VITE_APP_NAME);
console.log(import.meta.env.VITE_API_URL);
```

### Проверка сетевых настроек
```bash
# Проверка какие порты слушает приложение
netstat -tulpn | grep node

# Проверка доступности по сети
curl http://localhost:5173
```

---

**Следующий шаг:** [Установка Git](git.md) или [Общие инструкции](../common.md)
