# Wiki Базовых Технологий

Этот раздел содержит документацию по базовым технологиям, используемым в проекте secure-message.

## 📚 Разделы документации

### 🚀 [GitHub Actions](./github-actions/INDEX.md) ✅ Полная документация
Автоматизация CI/CD процессов и деплой на GitHub Pages
- **[Центральный индекс](./github-actions/INDEX.md)** - Навигация по всей документации
- **[Полное руководство](./github-actions/README.md)** - Основы GitHub Actions
- **[peaceiris/actions-gh-pages](./github-actions/peaceiris-gh-pages.md)** - Деплой на GitHub Pages
- **[Анализ проекта](./github-actions/project-integration-summary.md)** - Проблемы и решения
- **[Практическое руководство](./github-actions/PRACTICAL_GUIDE.md)** - Пошаговые инструкции
- **[Быстрый справочник](./github-actions/QUICK_REFERENCE.md)** - Команды и решения

### 🐳 [Docker](./docker/README.md) 🔄 В разработке
Контейнеризация и развертывание приложений
- Основы Docker
- Docker Compose
- Настройка окружения разработки

### ⚡ [Svelte](./svelte/README.md) 🔄 В разработке
Современный фреймворк для создания пользовательских интерфейсов
- Основы Svelte
- Компоненты и реактивность
- Интеграция с проектом

### 📊 [Прогресс разработки](./progress/current-status.md)
Текущий статус и планы развития проекта

## 📈 Статус изучения технологий

### ✅ Полностью документированные
- **GitHub Actions** - Полная документация с практическими примерами
  - Основы и концепции
  - Настройка workflow для проекта
  - Деплой на GitHub Pages
  - Устранение проблем и отладка
  - Быстрый справочник

### 🔄 В процессе документирования
- **Docker** - Базовые концепции и команды
- **Svelte** - Основы фреймворка

### 🎯 Планируемые к документированию
- Docker Compose для проекта
- Svelte Kit
- TypeScript интеграция
- Vite конфигурация
- Rust backend деплой

## 🗂️ Структура документации

```
wiki-base-technologies/
├── README.md                 # Этот файл - общий обзор
├── github-actions/           # ✅ Полная документация по GitHub Actions
│   ├── INDEX.md             # Центральный индекс документации
│   ├── README.md            # Полное руководство по GitHub Actions
│   ├── peaceiris-gh-pages.md # Руководство по peaceiris/actions-gh-pages
│   ├── project-integration-summary.md # Анализ проблем проекта
│   ├── PRACTICAL_GUIDE.md   # Пошаговые инструкции
│   └── QUICK_REFERENCE.md   # Быстрый справочник
├── docker/                   # 🔄 Документация по Docker
│   └── README.md            # Обзор Docker
├── svelte/                   # 🔄 Документация по Svelte
│   └── README.md            # Обзор Svelte
└── progress/                 # 📊 Отслеживание прогресса
    └── current-status.md    # Текущий статус проекта
```

## 🚨 Критические задачи

### Немедленные действия (GitHub Actions)
1. **Исправить workflow** - Текущий `.github/workflows/gh-pages-deploy.yml` содержит ошибки
2. **Настроить GitHub Pages** - Проверить настройки репозитория
3. **Протестировать деплой** - Убедиться в работоспособности

> **📖 Подробнее**: См. [практическое руководство](./github-actions/PRACTICAL_GUIDE.md)

### Краткосрочные задачи
- Завершить документацию Docker
- Расширить документацию Svelte
- Добавить примеры интеграции технологий

## 🎯 Цели документации

### Основные цели
- ✅ Создать полную справочную базу по GitHub Actions
- 🔄 Получить базовые знания по каждой технологии
- 🔄 Понять интеграцию технологий в проект
- 🔄 Создать быстрые справочники

### Практические результаты
- ✅ Автоматический деплой фронтенда на GitHub Pages
- 🔄 Контейнеризация всех компонентов проекта
- 🔄 Оптимизированная разработка на Svelte
- 🔄 Полная автоматизация CI/CD процессов

## 🔗 Связанная документация

### Документация проекта
- **[GitHub Pages Deployment](../docs/github-pages-deployment.md)** - Настройка деплоя
- **[Архитектура проекта](../docs/architecture.md)** - Общая архитектура
- **[Статус разработки](../docs/status.md)** - Текущий статус

### Внешние ресурсы
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com/)
- [Svelte Documentation](https://svelte.dev/docs)

---

**💡 Совет**: Начните с [GitHub Actions INDEX](./github-actions/INDEX.md) для навигации по документации автоматизации проекта.

**🚨 Важно**: Текущий workflow GitHub Actions требует немедленного исправления. См. [практическое руководство](./github-actions/PRACTICAL_GUIDE.md).
