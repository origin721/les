# Правила системы дебага в проекте

## Переменные окружения

### Файл `.env.local`
- `is_debug_enable` - включает/выключает дебаг логи (true/false)
- Этот файл должен быть в `.gitignore` для локальной разработки

### Поведение логирования

#### Обычные логи (скрываются в проде)
- Используйте `debugLog()` вместо `console.log()` 
- Эти логи отображаются только когда `is_debug_enable = true`
- В продакшене (npm run build:prod) эти логи не видны

#### Критические логи (всегда видны)
- Используйте `console.error()`, `console.warn()` для ошибок
- Используйте `forceLog()` для важных операций (миграции БД, критические процессы)
- Эти логи отображаются всегда, независимо от настроек дебага

## Команды сборки

### Разработка
```bash
npm run dev          # разработка с дебаг логами
npm run build        # обычная сборка (с дебаг логами если включены)
```

### Продакшен
```bash
npm run build:prod   # продакшен сборка (дебаг логи отключены принудительно)
```

## Импорт и использование

```typescript
import { debugLog, forceLog } from '@/core/debug/logger';

// Дебаг лог - скрывается в проде
debugLog('User data loaded:', userData);

// Принудительный лог - всегда виден  
forceLog('Database migration completed');

// Ошибки - всегда видны
console.error('Critical error:', error);
```

## Примеры использования

### ✅ Правильно
```typescript
import { debugLog, forceLog } from '@/core/debug/logger';

// Отладочная информация
debugLog('API response:', response);

// Важные системные события
forceLog('IndexDB migration started');

// Ошибки
console.error('Failed to connect:', error);
```

### ❌ Неправильно
```typescript
// НЕ используйте прямой console.log для дебага
console.log('Debug info'); 

// НЕ пишите условие в каждом месте
if (import.meta.env.VITE_DEBUG) {
  console.log('Debug info');
}
```

## Конфигурация среды

### Разработка (.env.local)
```
is_debug_enable=true
```

### Продакшен (переменные среды)
```
is_debug_enable=false
VITE_PRODUCTION=true
