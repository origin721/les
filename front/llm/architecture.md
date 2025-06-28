# 🏗 Архитектурные правила

## Структура папок
```
src/
├── components/  # ⚠️ Нужно перенести в widgets/ - не создавайте новые!
├── widgets/     # ✅ Все компоненты (UI элементы + бизнес-логика)
├── pages/       # Страницы приложения
├── stores/      # Глобальные сторы
├── core/        # Утилиты и хелперы
├── api/         # HTTP, WebSocket, P2P
└── indexdb/     # База данных
```

## ❌ Частые ошибки
- `src/components/widgets/` - НЕ создавать! Widgets в корне src/
- Компоненты с бизнес-логикой - должны быть в widgets/
- API вызовы в components/ - переносить в widgets/

## Виджеты
- Добавлять `data-widget-name="WidgetName"`
- Структура: `ui/`, `stores/`, `index.ts`
- Могут иметь собственные сторы

## Технологии
- Svelte 5 + TypeScript + Vite
- Tailwind CSS + кастомные темы
- IndexedDB для хранения
- LibP2P для P2P
- Кастомный роутинг
