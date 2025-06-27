# 🚀 Secure Message App

## 📋 Быстрые ответы

**Q: Какой фреймворк?** A: Svelte 5 + TypeScript + Vite  
**Q: Где стили?** A: [`src/styles/`](#стили) - Tailwind + темы  
**Q: Где компоненты?** A: [`src/components/`](#компоненты) - не правильно, [`src/widgets/`](#виджеты) - правильно  
**Q: Роутинг?** A: [`src/routing/`](#роутинг) - кастомное решение  
**Q: База данных?** A: [`src/indexdb/`](#база-данных) - IndexedDB  

## 📂 Навигация по проекту

### 🧩 [Компоненты](src/components/)
- [`ThemeSwitcher.svelte`](src/components/ThemeSwitcher.svelte) - переключатель тем
- [`loading_screens/`](src/components/loading_screens/) - экраны загрузки

### 🎯 [Виджеты](src/widgets/)
- [`app_header/`](src/widgets/app_header/) - шапка приложения
- [`field_http_servers/`](src/widgets/field_http_servers/) - поля HTTP серверов

### 📄 [Страницы](src/pages/)
- [`auth/`](src/pages/auth/) - авторизация
- [`home/`](src/pages/home/) - главная
- [`chat_room/`](src/pages/chat_room/) - чаты
- [`settings/`](src/pages/settings/) - настройки

### 🛠 [Ядро](src/core/)
- [`svelte_default/`](src/core/svelte_default/) - Svelte утилиты
- [`crypt/`](src/core/crypt/) - криптография
- [`local-storage/`](src/core/local-storage/) - локальное хранилище

### 🌐 [API](src/api/)
- [`libp2p/`](src/api/libp2p/) - P2P соединения
- [`http/`](src/api/http/) - HTTP запросы
- [`sse/`](src/api/sse/) - Server-Sent Events

### 💾 [База данных](src/indexdb/)
- [`accounts/`](src/indexdb/accounts/) - аккаунты пользователей
- [`friends/`](src/indexdb/friends/) - список друзей
- [`rooms/`](src/indexdb/rooms/) - комнаты чатов

### 🎨 [Стили](src/styles/)
- [`app.css`](src/styles/app.css) - основные стили
- [`themes.css`](src/styles/themes.css) - темы оформления
- [`colors.ts`](src/styles/colors.ts) - палитра цветов

### 📦 [Сторы](src/stores/)
- [`theme.ts`](src/stores/theme.ts) - состояние темы
- [`app_auth_store/`](src/stores/app_auth_store/) - авторизация

### 🔄 [Роутинг](src/routing/)
- [`ui/RoutesView.svelte`](src/routing/ui/RoutesView.svelte) - основной роутер
- [`constants.ts`](src/routing/constants.ts) - маршруты

### ⚙️ [Процессы](src/processes/)
- [`app_processes_mount.ts`](src/processes/app_processes_mount.ts) - инициализация
- [`broadcast_middleware/`](src/processes/broadcast_middleware/) - межпроцессное взаимодействие

## 🏗 Правила архитектуры

### Components vs Widgets
```
❌ ОШИБКА: src/components/widgets/ (как сделал Gemini 2.5 Pro)
✅ ПРАВИЛЬНО:
  src/components/ - простые переиспользуемые UI компоненты
  src/widgets/    - сложные бизнес-компоненты с логикой
```

**Components** - чистые UI элементы:
- Кнопки, инпуты, модалки
- Без бизнес-логики  
- Принимают props, возвращают разметку

**Widgets** - бизнес-компоненты:
- Собственные сторы и состояние
- Интеграция с API
- `data-widget-name="WidgetName"` атрибут

### Структура страниц
```
src/pages/page_name/
  ├── ui/           # Svelte компоненты
  ├── stores/       # Локальные сторы (опционально)  
  └── index.ts      # Экспорты
```

## 📚 Документация

- [🌍 Языки](docs/) - EN/RU документация
- [🎨 Темы](docs/themes.md) - кастомизация UI
- [📱 Адаптивность](docs/ru/README.md) - rem единицы

## 🔧 Команды

```bash
npm run dev    # Разработка
npm run build  # Сборка
npm run test   # Тесты
```

---
**Для LLM:** Консультируйтесь с `/docs` и `/llm` для детальной информации по проекту.
