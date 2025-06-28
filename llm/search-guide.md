# 🔍 Руководство по поиску для LLM

## Быстрый поиск документации

### 📂 Структура навигации
- **[Главная навигация](../links.md)** - Все разделы проекта
- **[Front документация](../front/links.md)** - Фронтенд приложение
- **[Event-Stream документация](../event-stream/links.md)** - Сервер событий
- **[Back документация](../back/links.md)** - Rust сервер

### 🔍 Методы поиска

#### 1. Поиск по файлам
Используйте инструмент `search_files` для поиска по содержимому:
```
- Поиск функций: `function\s+\w+`
- Поиск компонентов: `<\w+.*?>`
- Поиск TODO: `TODO|FIXME|XXX`
- Поиск типов: `interface\s+\w+|type\s+\w+`
```

#### 2. Поиск по структуре
Используйте `list_code_definition_names` для обзора:
- Классы и функции в директории
- Экспорты и импорты
- Основные конструкции кода

#### 3. Навигация по документации
- Начните с `links.md` в корне
- Переходите в нужный раздел (front/event-stream/back)
- Используйте соответствующий `links.md` раздела

### 📋 Часто используемые пути

#### Frontend (Svelte 5 + TypeScript)
- **Компоненты:** `front/src/components/`
- **Страницы:** `front/src/pages/`
- **API:** `front/src/api/`
- **Роутинг:** `front/src/routing/`
- **Хранилища:** `front/src/stores/`
- **Типы:** `front/src/types/`

#### Backend (Rust)
- **Основной файл:** `back/src/main.rs`
- **Модули:** `back/src/modules/`
- **Утилиты:** `back/src/utils/`

#### Event-Stream (Node.js)
- **Основной файл:** `event-stream/src/app.js`
- **HTTP сервер:** `event-stream/src/http_server/`
- **Ядро:** `event-stream/src/core/`

### 🎯 Рекомендации для LLM

1. **Начинайте с навигации** - всегда используйте `links.md` файлы
2. **Используйте поиск** - `search_files` эффективнее чем чтение всех файлов
3. **Проверяйте архитектуру** - читайте `llm/architecture.md` для понимания структуры
4. **Следуйте правилам** - изучите `front/llm/rules.md` перед изменениями
5. **Проверяйте типы** - TypeScript типы в `front/src/types/`

### 🔧 Полезные команды поиска

```bash
# Поиск всех компонентов Svelte
search_files: "\.svelte$"

# Поиск всех TypeScript файлов
search_files: "\.ts$"

# Поиск функций API
search_files: "export.*function|export.*async"

# Поиск конфигураций
search_files: "config|Config"
```

---

**💡 Совет:** Всегда начинайте исследование проекта с файлов навигации `links.md`
