# ⚙️ Установка

Подробное руководство по установке и настройке Secure Message App.

## 🖥️ Системные требования

### Операционные системы
- **Windows:** 10/11 (x64)
- **macOS:** 12.0+ (Intel/Apple Silicon)
- **Linux:** Ubuntu 20.04+, Debian 11+, Fedora 35+

### Программное обеспечение

#### Обязательные компоненты
- **Node.js:** v18.0.0 или выше ([скачать](https://nodejs.org/))
- **npm:** v8.0.0 или выше (идёт с Node.js)
- **Git:** для клонирования репозитория ([скачать](https://git-scm.com/))

#### Рекомендуемые версии
- **Node.js:** v20 LTS
- **npm:** v10+

### Браузеры
- **Chrome:** 90+ ✅
- **Firefox:** 88+ ✅
- **Safari:** 14+ ✅
- **Edge:** 90+ ✅

## 📥 Установка Node.js

### Windows
1. Перейдите на [nodejs.org](https://nodejs.org/)
2. Скачайте LTS версию для Windows
3. Запустите `.msi` файл и следуйте инструкциям
4. Перезагрузите компьютер

### macOS
```bash
# Через Homebrew (рекомендуется)
brew install node

# Или скачайте с официального сайта
```

### Linux (Ubuntu/Debian)
```bash
# Через NodeSource репозиторий
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Проверка установки
node --version
npm --version
```

## 📂 Установка приложения

### 1. Клонирование репозитория
```bash
# HTTPS
git clone https://github.com/your-repo/secure-message.git

# SSH (если настроен)
git clone git@github.com:your-repo/secure-message.git

# Переход в папку
cd secure-message/front
```

### 2. Установка зависимостей
```bash
# Установка всех зависимостей
npm install

# Или с очисткой кэша
npm ci
```

### 3. Проверка установки
```bash
# Проверка версий
node --version    # должно быть v18+
npm --version     # должно быть v8+

# Проверка зависимостей
npm list --depth=0
```

## 🔧 Конфигурация

### Переменные окружения
Создайте файл `.env` в корне проекта:

```bash
# .env
VITE_APP_NAME="Secure Message App"
VITE_API_URL="http://localhost:3000"
VITE_P2P_PORT="9000"
```

### Настройка портов
По умолчанию используются порты:
- **Frontend:** 5173 (Vite dev server)
- **P2P:** 9000 (LibP2P)

Если порты заняты, они будут изменены автоматически.

## 🚀 Запуск

### Режим разработки
```bash
npm run dev
```
Приложение будет доступно на: [http://localhost:5173](http://localhost:5173)

### Продакшен сборка
```bash
# Сборка
npm run build

# Предпросмотр
npm run preview
```

## 🧪 Проверка работоспособности

### 1. Тестирование
```bash
# Запуск всех тестов
npm run test

# Тестирование с покрытием
npm run test:coverage
```

### 2. Линтинг
```bash
# Проверка кода
npm run lint

# Автоматическое исправление
npm run lint:fix
```

### 3. Типизация
```bash
# Проверка TypeScript
npm run type-check
```

## 📱 Мобильная разработка

### Локальная сеть
Для тестирования на мобильных устройствах:

```bash
# Запуск с доступом по сети
npm run dev -- --host

# Вы увидите:
# Local:   http://localhost:5173
# Network: http://192.168.1.100:5173
```

## 🐳 Docker (опционально)

### Dockerfile
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  secure-message:
    build: .
    ports:
      - "5173:5173"
    volumes:
      - .:/app
      - /app/node_modules
```

## ⚡ Оптимизация

### Очистка кэша
```bash
# Очистка npm кэша
npm cache clean --force

# Очистка node_modules
rm -rf node_modules package-lock.json
npm install
```

### Обновление зависимостей
```bash
# Проверка устаревших пакетов
npm outdated

# Обновление всех пакетов
npm update

# Аудит безопасности
npm audit
npm audit fix
```

## ❗ Устранение проблем

### Ошибки установки
```bash
# Ошибка прав доступа (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Ошибка сети
npm config set registry https://registry.npmjs.org/
```

### Проблемы с портами
```bash
# Проверка занятых портов
netstat -tulpn | grep :5173

# Принудительная остановка процесса
kill -9 $(lsof -t -i:5173)
```

## 🔄 Обновление

### Обновление приложения
```bash
# Получение изменений
git pull origin main

# Установка новых зависимостей
npm install

# Перезапуск
npm run dev
```

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте [Устранение неполадок](troubleshooting.md)
2. Изучите [FAQ](faq.md)
3. Создайте Issue в репозитории

---

**Готово!** Переходите к [быстрому старту](quick-start.md) для запуска приложения.
