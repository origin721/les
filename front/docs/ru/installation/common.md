# 🔧 Общие инструкции

**[📋 ← Установка](index.md)** | **[🎯 ← Требования](requirements.md)** | **[🌍 → Окружение](setup/environment.md)**

Универсальные команды для всех платформ после установки Node.js и Git.

## 📂 Клонирование репозитория

### Выбор способа клонирования
```bash
# HTTPS (рекомендуется для начинающих)
git clone https://github.com/your-repo/secure-message.git

# SSH (если настроен SSH ключ)
git clone git@github.com:your-repo/secure-message.git
```

### Переход в папку проекта
```bash
cd secure-message/front
```

## 📦 Установка зависимостей

### Первая установка
```bash
# Установка всех зависимостей
npm install

# Или с очисткой кэша (если есть проблемы)
npm ci
```

### Проверка установки
```bash
# Проверка версий
node --version    # должно быть v18+
npm --version     # должно быть v8+

# Проверка зависимостей
npm list --depth=0
```

## 🚀 Команды запуска

### Режим разработки
```bash
npm run dev
```
**Результат:** Приложение доступно на [http://localhost:5173](http://localhost:5173)

### Продакшен сборка
```bash
# Сборка для продакшена
npm run build

# Предпросмотр сборки
npm run preview
```

### Запуск с доступом по сети
```bash
# Для тестирования на мобильных устройствах
npm run dev -- --host
```

## 🧪 Тестирование и проверка

### Запуск тестов
```bash
# Все тесты
npm run test

# Тесты с покрытием
npm run test:coverage

# Тесты в режиме наблюдения
npm run test:watch
```

### Проверка кода
```bash
# Линтинг
npm run lint

# Автоматическое исправление
npm run lint:fix

# Проверка типов TypeScript
npm run type-check
```

## 📚 Базовые команды терминала

### Навигация по папкам (`cd`)
```bash
cd                    # переход в домашнюю папку
cd secure-message     # переход в папку проекта
cd front              # переход в папку frontend
cd ..                 # подняться на уровень выше
cd ../..              # подняться на два уровня выше
```

### Просмотр содержимого (`ls` / `dir`)
```bash
# Linux/macOS
ls                    # показать файлы и папки
ls -l                 # показать с подробностями
ls src/               # содержимое папки src

# Windows
dir                   # показать файлы и папки
dir src\              # содержимое папки src
```

### Определение текущей папки (`pwd`)
```bash
pwd                   # показать полный путь
# Пример: /home/user/secure-message/front
```

## 🔄 Обновление проекта

### Получение изменений
```bash
# Получить новый код из репозитория
git pull origin main

# Установить новые зависимости
npm install

# Перезапустить приложение
npm run dev
```

### Очистка и переустановка
```bash
# Очистить node_modules и переустановить
rm -rf node_modules package-lock.json  # Linux/macOS
rmdir /s node_modules & del package-lock.json  # Windows

npm install
```

## ⚡ Основные npm команды

### Понимание команд
- `npm install` - установка зависимостей
- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка для продакшена
- `npm run preview` - предпросмотр собранного приложения
- `npm run test` - запуск тестов
- `npm run lint` - проверка кода

### Управление зависимостями
```bash
# Проверка устаревших пакетов
npm outdated

# Обновление пакетов
npm update

# Аудит безопасности
npm audit
npm audit fix
```

## ⏹️ Остановка приложения

### В терминале
- **Ctrl + C** - остановка текущей команды
- `exit` - выход из терминала

### Принудительная остановка
```bash
# Если процесс завис (Linux/macOS)
kill -9 $(lsof -t -i:5173)

# Windows
netstat -ano | findstr :5173
taskkill /PID [PID_NUMBER] /F
```

---

**Следующий шаг:** [Настройка окружения](setup/environment.md) или выберите свою [платформу](index.md#🖥️-платформы)
