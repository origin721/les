# GitHub Actions - Центральный индекс документации

## 📋 Обзор

Этот раздел содержит полную документацию по использованию GitHub Actions в проекте secure-message, включая настройку автоматического деплоя на GitHub Pages.

## 📚 Документация

### Основные руководства

1. **[GitHub Actions - Полное руководство](./README.md)**
   - Основные концепции и возможности GitHub Actions
   - Структура workflow файлов
   - События запуска и условное выполнение
   - Безопасность и лучшие практики

2. **[peaceiris/actions-gh-pages - Подробное руководство](./peaceiris-gh-pages.md)**
   - Настройка автоматического деплоя на GitHub Pages
   - Типы аутентификации (GITHUB_TOKEN, Deploy Key, Personal Token)
   - Примеры конфигураций для различных проектов
   - Устранение проблем и отладка

3. **[Интеграция в проект - Анализ и рекомендации](./project-integration-summary.md)**
   - Анализ текущего workflow проекта
   - Выявленные проблемы и их решения
   - Рекомендуемые исправления
   - Дополнительные улучшения

4. **[Практическое руководство](./PRACTICAL_GUIDE.md)**
   - Пошаговые инструкции по настройке
   - Исправление текущих проблем
   - Мониторинг и отладка деплоев

5. **[Быстрый справочник](./QUICK_REFERENCE.md)**
   - Чек-лист настройки GitHub Actions
   - Частые ошибки и их решения
   - Полезные команды для отладки

### Дополнительная документация

- **[GitHub Pages Deployment](../../docs/github-pages-deployment.md)** - Документация по настройке GitHub Pages в проекте

## 🚀 Быстрый старт

### Текущее состояние проекта

В проекте уже настроен workflow для автоматического деплоя фронтенда на GitHub Pages:
- **Файл**: `.github/workflows/gh-pages-deploy.yml`
- **Статус**: ❌ Требует исправления (есть критические ошибки)

### Критические проблемы

1. **Неправильная смена директории** - `cd front` не влияет на последующие команды
2. **Неверный путь сборки** - указан `./dist` вместо `./front/dist`
3. **Отсутствие permissions** - может вызвать ошибки доступа
4. **Неоптимальные команды** - использование `npm i` вместо `npm ci`

### Немедленные действия

1. **Исправить workflow** - см. [рекомендации](./project-integration-summary.md#рекомендуемые-исправления)
2. **Настроить GitHub Pages** - см. [инструкции](./PRACTICAL_GUIDE.md#настройка-github-pages)
3. **Проверить деплой** - см. [руководство по мониторингу](./PRACTICAL_GUIDE.md#мониторинг-деплоя)

## 🔧 Структура проекта

```
secure-message/
├── .github/
│   └── workflows/
│       └── gh-pages-deploy.yml     # ❌ Требует исправления
├── front/                          # Frontend приложение (Vite + Svelte)
│   ├── package.json
│   ├── vite.config.ts
│   └── dist/                       # Директория сборки (создается при build)
├── docs/
│   └── github-pages-deployment.md  # Документация по GitHub Pages
└── wiki-base-technologies/
    └── github-actions/             # Документация по GitHub Actions
        ├── INDEX.md                # Этот файл
        ├── README.md               # Полное руководство
        ├── peaceiris-gh-pages.md   # Руководство по peaceiris action
        ├── project-integration-summary.md
        ├── PRACTICAL_GUIDE.md
        └── QUICK_REFERENCE.md
```

## 🎯 Цели автоматизации

### Текущие цели
- ✅ Автоматический деплой фронтенда на GitHub Pages при push в main
- ❌ Исправление ошибок в текущем workflow
- ❌ Добавление тестирования перед деплоем
- ❌ Оптимизация времени сборки

### Будущие цели
- Деплой бэкенда (Rust) в контейнере
- Интеграция с event-stream сервисом
- Автоматическое тестирование криптографических функций
- Мониторинг производительности

## 📊 Статистика и мониторинг

### Ключевые метрики
- **Время сборки**: ~2-3 минуты (с кешированием npm)
- **Размер сборки**: ~500KB (фронтенд)
- **Частота деплоев**: При каждом push в main
- **Успешность деплоев**: Требует мониторинга после исправления

### Мониторинг
- **GitHub Actions**: Вкладка Actions в репозитории
- **GitHub Pages**: Settings → Pages для статуса деплоя
- **Логи**: Детальные логи в каждом запуске workflow

## 🔗 Полезные ссылки

### Официальная документация
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)

### Инструменты и Actions
- [peaceiris/actions-gh-pages](https://github.com/peaceiris/actions-gh-pages)
- [GitHub Actions Marketplace](https://github.com/marketplace?type=actions)
- [Vite Static Deploy Guide](https://vitejs.dev/guide/static-deploy.html)

### Проект
- [Основной README](../../README.md)
- [Архитектура проекта](../../docs/architecture.md)
- [Статус разработки](../../docs/status.md)

---

**Последнее обновление**: 29 июня 2025  
**Статус документации**: ✅ Актуальная  
**Следующий шаг**: Исправление workflow файла
