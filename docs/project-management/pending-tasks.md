# 📋 ОТЛОЖЕННЫЕ ЗАДАЧИ

*Файл создан для фокуса на текущей работе - рефакторинге accounts типов*

---

## 🔥 ВЫСОКИЙ ПРИОРИТЕТ (после завершения accounts)

### 1. Contributing Guide
- **Файл:** `docs/developer-guide/contributing.md`
- **Описание:** Настройка среды разработки (Frontend + Backend)
- **Включить:**
  - Анализ `package.json`, `Cargo.toml` для зависимостей
  - Команды для запуска frontend/backend
  - Правила PR и code review
  - Структура проекта
- **Команды для анализа:**
  ```bash
  cat secure-message/package.json | grep -A 20 "scripts"
  cat secure-message/back/Cargo.toml | grep -A 10 "dependencies"
  ```

---

## 📋 СРЕДНИЙ ПРИОРИТЕТ

### 2. Performance Guide
- **Файл:** `docs/developer-guide/performance.md`
- **Описание:** Оптимизация и production deployment
- **Включить:**
  - Optimizations для IndexedDB
  - SharedWorker best practices
  - Bundle size optimization
  - Memory management

### 3. Roadmap
- **Файл:** `docs/project-management/roadmap.md`
- **Описание:** Планы развития проекта
- **Включить:**
  - Краткосрочные цели (3-6 месяцев)
  - Долгосрочные планы
  - Техническое развитие

---

## ℹ️ СПРАВОЧНАЯ ИНФОРМАЦИЯ

### Завершенные задачи:
- ✅ **Friends типы:** Полностью рефакторены в `entities/friends/types/`
- ✅ **Базовая документация:** Создана структура в `docs/`
- ✅ **Rooms типы:** Рефакторинг выполнен

### Ссылки на полную информацию:
- **Детальный отчет:** `docs/project-management/documentation-improvement-report.md`
- **AI инструкции:** `docs/project-management/next-ai-instructions.md`
- **Навигация:** `docs/README.md`

---

## 🎯 ЧТО ДЕЛАТЬ ПОСЛЕ ACCOUNTS

1. **Сначала:** Contributing Guide (самый важный для разработчиков)
2. **Потом:** Performance Guide
3. **Наконец:** Roadmap
4. **Обновить:** Навигацию в `docs/README.md`

---

*Возвращайтесь к этому файлу после завершения рефакторинга accounts типов*
*Создано: январь 2025*