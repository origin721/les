# 🔐 Secure Message App

Децентрализованное приложение для безопасного обмена сообщениями с использованием P2P технологий.

## 🚀 Быстрый старт

```bash
# Клонировать репозиторий
git clone <repository-url>
cd secure-message/front

# Установить зависимости
npm install

# Запустить для разработки
npm run dev

# Собрать для продакшена
npm run build
```

## 📁 Структура проекта

```
src/
├── components/      # Простые UI компоненты
├── widgets/         # Бизнес-компоненты с логикой  
├── pages/          # Страницы приложения
├── stores/         # Svelte stores
├── routing/        # Кастомный роутинг
├── api/           # HTTP, LibP2P, SSE
├── indexdb/       # IndexedDB операции
├── local_back/    # Локальный backend
├── core/          # Утилиты и ядро
└── styles/        # CSS и темы
```

## 🧭 Навигация для LLM

### Обязательная документация
- **[llm/rules.md](llm/rules.md)** - Основные правила кодирования
- **[llm/architecture.md](llm/architecture.md)** - Архитектура проекта  
- **[llm/svelte5.md](llm/svelte5.md)** - Особенности Svelte 5
- **[llm/quick-reference.md](llm/quick-reference.md)** - Быстрый справочник

### Дополнительные гайды
- **[llm/libp2p.md](llm/libp2p.md)** - Работа с LibP2P
- **[llm/testing.md](llm/testing.md)** - Тестирование
- **[src/local_back/README.md](src/local_back/README.md)** - API local_back

## ⚠️ Важные правила

### 🚫 ЗАПРЕЩЕНО
- **Переписывать код "под ноль"** без веских причин  
- Менять архитектуру без согласования
- Удалять существующую функциональность
- Переделывать стили без необходимости

### ✅ РАЗРЕШЕНО  
- Добавлять новые компоненты/виджеты
- Улучшать существующий код
- Исправлять баги и ошибки
- Документировать изменения

## 🏗️ Архитектурные принципы

### Components vs Widgets
```
src/components/ - чистые UI элементы (кнопки, инпуты)  
src/widgets/    - бизнес-компоненты с состоянием
```

### Структура страниц
```
src/pages/page_name/
├── ui/           # Svelte компоненты
├── stores/       # Локальные сторы  
└── index.ts      # Экспорты
```

## 🛠️ Технологии

- **Frontend:** Svelte 5 + TypeScript + Vite
- **Стили:** Tailwind CSS + кастомные темы
- **БД:** IndexedDB с шифрованием
- **P2P:** LibP2P для децентрализации
- **Роутинг:** Кастомное решение

## 📚 Документация

- **[docs/](docs/)** - Пользовательская документация (EN/RU)
- **[llm/](llm/)** - Техническая документация для разработчиков
- **Темы:** [docs/themes.md](docs/themes.md)

## 🔧 Команды разработки

```bash
npm run dev      # Разработка (http://localhost:5173)
npm run build    # Сборка продакшена  
npm run preview  # Предпросмотр сборки
npm run test     # Запуск тестов
```

---

**📖 Для детального изучения консультируйтесь с файлами в папке `/llm/`**
