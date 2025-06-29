# LLM Documentation Index

Этот файл служит навигационным центром для всей документации, предназначенной для работы с ИИ в проекте secure-message.

## 🎯 Быстрый старт для ИИ

### Основная информация о проекте
- **[Архитектура проекта](architecture.md)** - общая архитектура системы
- **[Главная LLM документация](main.md)** - основные концепции и подходы
- **[Ограничения и уроки ИИ](ai-limitations-and-lessons.md)** - важные ограничения инструментов ИИ

### Специфичные области

#### Backend (Rust)
- **[Backend документация](backend.md)** - специфика работы с Rust сервером
- **[Процесс сборки](build-process.md)** - как собирать и развертывать

#### Frontend (Svelte)
- **[Frontend LLM документация](../front/llm/)** - специфичная документация для frontend
  - [Svelte 5 руководство](../front/llm/svelte5.md)
  - [Архитектура frontend](../front/llm/architecture.md)
  - [Правила разработки](../front/llm/rules.md)
  - [Тестирование](../front/llm/testing.md)

#### Криптография
- **[Криптография](crypto.md)** - работа с шифрованием
- **[Curve25519 анализ](curve25519-analysis-and-issues.md)** - специфика криптографических алгоритмов

#### Развертывание
- **[Docker](docker.md)** - контейнеризация
- **[Развертывание](deployment.md)** - процесс развертывания

## 📁 Структура документации проекта

```
secure-message/
├── llm/                          # 🤖 LLM документация (корневая)
│   ├── README.md                 # 👈 Этот файл - навигация
│   ├── ai-limitations-and-lessons.md
│   ├── architecture.md
│   └── ...
├── front/
│   ├── llm/                      # 🎨 Frontend-специфичная LLM документация
│   │   ├── svelte5.md
│   │   ├── architecture.md
│   │   └── ...
│   └── docs/                     # 📚 Общая документация frontend
│       ├── ru/                   # 🇷🇺 Русская документация
│       └── ...
├── docs/                         # 📖 Общая документация проекта
│   ├── architecture.md
│   ├── quick-start.md
│   └── ...
├── docker/project/               # 🐳 Docker документация
└── event-stream/docs/            # 🌊 Event-stream документация
```

## 🧭 Навигация по контексту

### Если начинаете работу из корня проекта:
1. **Сначала прочитайте:** [llm/main.md](main.md) - общий контекст
2. **Затем:** [docs/architecture.md](../docs/architecture.md) - архитектура проекта
3. **Потом:** выберите специфичную область (frontend/backend)

### Если начинаете работу из frontend (`front/`):
1. **Сначала прочитайте:** [front/llm/main.md](../front/llm/main.md)
2. **Затем:** [front/llm/architecture.md](../front/llm/architecture.md)
3. **Для общего контекста:** вернитесь к [llm/README.md](README.md)

### Если работаете с backend (`back/`):
1. **Сначала прочитайте:** [llm/backend.md](backend.md)
2. **Для архитектуры:** [llm/architecture.md](architecture.md)
3. **Для сборки:** [llm/build-process.md](build-process.md)

## ⚠️ Важные ограничения ИИ

**ОБЯЗАТЕЛЬНО прочитайте:** [ai-limitations-and-lessons.md](ai-limitations-and-lessons.md)

Ключевые моменты:
- Инструменты ИИ могут показывать неактуальную информацию о файлах
- Всегда верифицируйте состояние файловой системы через пользователя
- При расхождениях доверяйте командам пользователя, а не инструментам ИИ

## 🔍 Поиск информации

### По технологиям:
- **Rust/Backend:** [backend.md](backend.md), [build-process.md](build-process.md)
- **Svelte/Frontend:** [../front/llm/](../front/llm/)
- **Docker:** [docker.md](docker.md), [../docker/project/](../docker/project/)
- **Криптография:** [crypto.md](crypto.md), [curve25519-analysis-and-issues.md](curve25519-analysis-and-issues.md)

### По задачам:
- **Диагностика проблем:** [ai-limitations-and-lessons.md](ai-limitations-and-lessons.md)
- **Разработка новых функций:** [main.md](main.md), [next-development-steps.md](next-development-steps.md)
- **Тестирование:** [../front/llm/testing.md](../front/llm/testing.md)

## 📝 Обновление документации

При добавлении новой LLM документации:
1. Добавьте ссылку в соответствующий раздел этого файла
2. Убедитесь, что есть обратные ссылки из новой документации
3. Обновите дату последнего изменения

---

**Последнее обновление:** 29.06.2025  
**Автор:** AI Assistant (Cline)
