# 📝 API и типы уведомлений

## 🏷️ Типы

### NotificationType
```typescript
type NotificationType = 'success' | 'error' | 'warning' | 'info'
```

### Notification
```typescript
interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number // миллисекунды, по умолчанию 5000
  persistent?: boolean // не исчезает автоматически
  action?: {
    label: string
    handler: () => void
  }
}
```

## 🔧 Функции

### addNotification
```typescript
addNotification(notification: Omit<Notification, 'id'>): string
```
Добавляет уведомление, возвращает ID.

### removeNotification  
```typescript
removeNotification(id: string): void
```
Удаляет уведомление по ID.

### clearNotifications
```typescript
clearNotifications(): void
```
Очищает все уведомления.

### Хелперы
```typescript
notifySuccess(title: string, message: string, options?: Partial<Notification>): string
notifyError(title: string, message: string, options?: Partial<Notification>): string
notifyWarning(title: string, message: string, options?: Partial<Notification>): string
notifyInfo(title: string, message: string, options?: Partial<Notification>): string
