# 🔔 Система уведомлений

Документация по компонентам и сервисам уведомлений в Secure Message App.

## 📋 Содержание

- [🧩 Компоненты](notifications/components.md)
- [🏪 Сторы и состояние](notifications/stores.md)
- [🎨 Стили и темы](notifications/styles.md)
- [📝 API и типы](notifications/api.md)
- [🔧 Примеры использования](notifications/examples.md)

## ✨ Обзор системы

Система уведомлений предоставляет:
- Различные типы уведомлений (success, error, warning, info)
- Автоматическое исчезновение
- Кастомные действия
- Управление позицией на экране
- Ограничение количества уведомлений

## 🚀 Быстрый старт

```typescript
import { notifySuccess } from '$lib/widgets/notifications'

// Простое уведомление
notifySuccess('Успех!', 'Сообщение отправлено')

// С дополнительными настройками
notifyError('Ошибка', 'Не удалось отправить', {
  persistent: true,
  action: {
    label: 'Повторить',
    handler: () => console.log('Повтор')
  }
})
