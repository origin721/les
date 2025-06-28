# 🚀 Быстрая справка

## Svelte 5 + TypeScript
- Используй новый синтаксис: `let { prop } = $props()`
- Реактивность: `$derived`, `$effect`

## Структура
```
src/
├── components/     # ⚠️ Нужно перенести в widgets/ - не создавайте новые!
├── widgets/        # ✅ Все компоненты + data-widget-name
├── pages/         # Страницы: ui/, stores/, index.ts
├── api/libp2p/    # P2P соединения
├── indexdb/       # База данных
└── stores/        # Глобальные сторы
```

## ❌ НЕ создавать
- `src/components/widgets/` - только src/widgets/

## Технологии
- Tailwind CSS + темы
- IndexedDB
- LibP2P для P2P
- Кастомный роутинг
