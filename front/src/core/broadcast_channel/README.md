# Broadcast Channel - Управление вкладками

Система межвкладочного взаимодействия через BroadcastChannel API для синхронизации действий между всеми открытыми экземплярами приложения.

## 🏗️ Архитектура

### Основные компоненты:

**1. Константы:**
- `CHANNEL_NAMES.ts` - названия каналов
- `FRONT_MIDDLEWARE_ACTIONS.ts` - действия middleware

**2. Типы:**
- `front_middleware_channel.ts` - TypeScript типы сообщений

**3. Утилиты:**
- `tab_management.ts` - класс для управления вкладками

**4. Обработчики:**
- `src/processes/broadcast_middleware/broadcast_middleware.ts` - обработка сообщений

## 🚀 Использование

### Закрытие вкладок

```typescript
import { TabManagement } from '../../../core/broadcast_channel/tab_management';

// Закрыть все остальные вкладки (кроме текущей)
TabManagement.closeAllOtherTabs();

// Закрыть все вкладки включая текущую
TabManagement.closeAllTabsIncludingCurrent();

// Кастомная настройка
TabManagement.closeAllTabs(false, 'custom_reason');
```

### Добавление новых действий

**1. Добавить действие в `FRONT_MIDDLEWARE_ACTIONS.ts`:**
```typescript
NEW_ACTION: 'NEW_ACTION'
```

**2. Создать тип в `front_middleware_channel.ts`:**
```typescript
export type PostMessageParamNewAction = {
  action: typeof FrontMiddlewareActions['NEW_ACTION'],
  data: {
    // ваши данные
  },
}
```

**3. Добавить в union type `PostMessageParam`**

**4. Добавить обработчик в `broadcast_middleware.ts`:**
```typescript
if (param.action === FrontMiddlewareActions.NEW_ACTION) {
  // обработка действия
}
```

## 📡 Текущие действия

- `ADD_ACCOUNTS` - добавление аккаунтов
- `DELETE_ACCOUNTS` - удаление аккаунтов  
- `ADD_FRIENDS` - добавление друзей
- `DELETE_FRIENDS` - удаление друзей
- `ADD_ROOMS` - добавление комнат
- `DELETE_ROOMS` - удаление комнат
- `CLOSE_ALL_TABS` - **НОВОЕ** - закрытие вкладок

## 🔧 Интеграция

Система автоматически инициализируется при запуске приложения через `src/processes/app_processes_mount.ts`:

```typescript
broadcast_middleware(); // Подключение обработчика
```

## 💡 Возможности

- ✅ Типизированные сообщения
- ✅ Синхронизация между вкладками
- ✅ Расширяемая архитектура
- ✅ Управление вкладками
- ✅ Подтверждение действий
- ✅ Настройка исключений

## 🎯 Интерфейс

Функциональность доступна в **Настройки → Управление вкладками**:

- **"Закрыть остальные вкладки"** - закрывает все кроме текущей
- **"Закрыть все вкладки"** - закрывает включая текущую

Все действия требуют подтверждения пользователя через `confirm()`.
