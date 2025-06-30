# 🦀 Back - Документация

## 🏠 [← Главная навигация](../links.md)

## 🚀 Быстрый старт
- **[README.md](README.md)** - Основная документация и инструкции по запуску
- **Команды запуска:**
  - `cargo run` - обычный запуск
  - `cargo run dev` - запуск в режиме разработки

## 📖 Конфигурация и зависимости
- **[Cargo.toml](Cargo.toml)** - Зависимости и конфигурация Rust проекта
- **[Cargo.lock](Cargo.lock)** - Зафиксированные версии зависимостей

## 🔧 Исходный код

### Основные файлы
- **[src/main.rs](src/main.rs)** - Точка входа приложения
- **[src/modules/mod.rs](src/modules/mod.rs)** - Основной модуль сервера
- **[src/utils/mod.rs](src/utils/mod.rs)** - Утилиты для работы с файлами

### Модули приложения
- **[src/modules/api/](src/modules/api/)** - API модули
- **[src/modules/host_dist/](src/modules/host_dist/)** - Модуль раздачи статических файлов
- **[src/modules/my_events/](src/modules/my_events/)** - Модуль обработки событий

## 🌐 Архитектура

### Основные компоненты
1. **HTTP сервер** - Actix-web сервер на порту 8080
2. **Статический хостинг** - Раздача файлов из папки `../dist`
3. **SPA поддержка** - Все неизвестные роуты возвращают `index.html`
4. **Файловые утилиты** - Работа с файловой системой

### Технологический стек
- **Rust 2021 Edition** - Основной язык
- **Actix-web 4.x** - Web framework
- **Tokio** - Асинхронный runtime

## 📚 Подробная документация

### Руководства для разработчиков
- **[docs/quick-reference.md](docs/quick-reference.md)** - ⚡ Быстрый справочник команд
- **[docs/architecture.md](docs/architecture.md)** - Подробная архитектура системы
- **[docs/development.md](docs/development.md)** - Руководство по разработке
- **[docs/api-guide.md](docs/api-guide.md)** - Руководство по созданию API

## 🔍 Навигация по коду

### Для изучения архитектуры:
1. Начните с **[src/main.rs](src/main.rs)** - понимание точки входа
2. Изучите **[src/modules/mod.rs](src/modules/mod.rs)** - основная логика сервера
3. Посмотрите **[src/utils/mod.rs](src/utils/mod.rs)** - вспомогательные функции

### Для модификации функционала:
- **API изменения** → [src/modules/api/](src/modules/api/)
- **Статические файлы** → [src/modules/host_dist/](src/modules/host_dist/)
- **События** → [src/modules/my_events/](src/modules/my_events/)

## 🎯 Быстрые ссылки

### Для новичков:
1. **[README.md](README.md)** - Начните здесь
2. **[docs/development.md](docs/development.md)** - Настройка среды разработки
3. **[src/main.rs](src/main.rs)** - Изучите точку входа

### Для опытных разработчиков:
1. **[docs/architecture.md](docs/architecture.md)** - Глубокое понимание системы
2. **[src/modules/mod.rs](src/modules/mod.rs)** - Основная бизнес-логика
3. **[Cargo.toml](Cargo.toml)** - Зависимости и конфигурация

---

**💡 Для разработчиков:** 
- Сервер автоматически раздает все файлы из папки `dist`
- Поддерживает SPA роутинг (возвращает index.html для неизвестных путей)
- Использует асинхронную архитектуру для высокой производительности
- Команда `cargo run dev` для запуска в режиме разработки
