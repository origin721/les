# 📱 Запуск на Android через Termux

**[🏠 ← Главная навигация](../../../links.md)** | **[📱 ← Front](../../links.md)** | **[📖 ← Руководство](README.md)**

Как запустить фронтенд на Android через Termux.

## 📲 Установка Termux

Скачайте Termux с F-Droid: [https://f-droid.org/packages/com.termux/](https://f-droid.org/packages/com.termux/)

**⚠️ Важно:** Используйте только версию с F-Droid, а не из Google Play Store!

## 🚀 Запуск

Откройте Termux и выполните команды по порядку:

### 1. Обновление системы
```bash
apt update
```
```bash
apt upgrade -y
```

### 2. Установка зависимостей
```bash
apt install nodejs git
```

### 3. Скачивание проекта
```bash
git clone https://github.com/origin721/les
```

### 4. Переход в папку и установка
```bash
cd les/front
```
```bash
npm i
```

### 5. Сборка и запуск
```bash
npm run build
```
```bash
npm run preview
```

## 📚 Базовые команды терминала

### `cd` - навигация по папкам
```bash
cd                    # переход в домашнюю папку
cd les                # переход в папку les
cd les/front          # переход в папку front внутри les
cd ..                 # подняться на уровень выше
cd ../..              # подняться на два уровня выше
```

### `pwd` - где я нахожусь
```bash
pwd                   # покажет полный путь
# Пример: /data/data/com.termux/files/home/les/front
```

### `ls` - что в папке
```bash
ls                    # показать файлы и папки
ls -l                 # показать с подробностями
ls src/               # показать содержимое папки src
```

### Понимание команд npm
- `npm run preview` - запуск приложения (основная команда для работы)
- `npm run build` - сборка новой версии (делать перед preview)
- `npm ci` - установка зависимостей (только при обновлении проекта)

## ⏹️ Управление

### Остановка
Нажмите `Ctrl + C` (на экранной клавиатуре: сначала Ctrl, потом C)

### Выход  
Команда `exit`

---

**Готово!** Приложение запущено на Android.
