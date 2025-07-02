# Инструкция по внедрению системы дебага в проект

## Что уже реализовано

✅ **Создан файл окружения** `.env.local` с настройкой `is_debug_enable=true`
✅ **Добавлена команда продакшен сборки** в `package.json`: `npm run build:prod` 
✅ **Создана система логирования** `src/core/debug/logger.ts`
✅ **Написаны правила проекта** в `docs/debug-system-rules.md`
✅ **Проведен рефакторинг** файла `src/indexdb/migrations/data_migrations.ts` (пример)

## Что необходимо доделать

### 1. Глобальный поиск и замена console.log

Найти все файлы с `console.log` и заменить на правильную систему:

```bash
# Найти все console.log в проекте
find src -name "*.ts" -o -name "*.svelte" -o -name "*.js" | xargs grep -l "console\.log"
```

**Правила замены:**
- **Дебаг информация** → `debugLog()` (скрывается в продакшене)
- **Критические операции** → `forceLog()` (всегда видно)
- **Ошибки** → оставить `console.error()` или `console.warn()`

### 2. Импорт логгера в файлы

В каждый файл где используется логирование добавить импорт:

```typescript
import { debugLog, forceLog } from '../path/to/core/debug/logger';
```

**Важно:** Использовать относительные пути, а не алиас `@/` (пока не настроен).

### 3. Категории логов для замены

#### ➡️ debugLog() - заменить эти случаи:
- `console.log()` с отладочной информацией
- Логи состояния компонентов
- API ответы для дебага
- Информация о загрузке данных
- Временные логи разработчика

#### ➡️ forceLog() - заменить эти случаи:
- Миграции базы данных
- Инициализация критических систем
- Важные системные события
- Операции с криптографией
- Подключения к сети/p2p

#### ❌ Не трогать (оставить как есть):
- `console.error()` 
- `console.warn()`
- `console.info()` в тестах

### 4. Примеры замены

**Было:**
```typescript
console.log('User authenticated:', user);
console.log('Loading friends list...');
console.log('API response:', response);
```

**Стало:**
```typescript
import { debugLog } from '../core/debug/logger';

debugLog('User authenticated:', user);
debugLog('Loading friends list...');
debugLog('API response:', response);
```

**Было (критические операции):**
```typescript
console.log('Database migration started');
console.log('IndexDB initialized');
console.log('P2P connection established');
```

**Стало:**
```typescript
import { forceLog } from '../core/debug/logger';

forceLog('Database migration started');
forceLog('IndexDB initialized'); 
forceLog('P2P connection established');
```

### 5. Файлы приоритетные для рефакторинга

1. **src/indexdb/** - миграции БД (критические)
2. **src/api/** - API запросы (дебаг)
3. **src/core/** - основные системы (смешанное)
4. **src/local_back/** - бэкенд логика (смешанное) 
5. **src/pages/** - UI компоненты (дебаг)

### 6. Проверка работы системы

После замен проверить:

```bash
# Разработка (логи видны)
npm run dev

# Продакшен (дебаг логи скрыты)
npm run build:prod
```

В браузере в консоли должны быть видны:
- `[DEBUG]` - только в development
- `[SYSTEM]` - всегда
- Обычные ошибки - всегда

### 7. Настройка конфигурации окружения

Добавить в Vite для корректной работы переменных:

```typescript
// vite.config.ts
export default defineConfig({
  // ... остальные настройки
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production')
  }
})
```

### 8. Обновление .gitignore

Убедиться что `.env.local` в `.gitignore`:

```
# Environment files
.env.local
.env.production
```

## Команды для автоматизации

### Поиск файлов с console.log:
```bash
grep -r "console\.log" src/ --include="*.ts" --include="*.svelte" --include="*.js"
```

### Поиск файлов без импорта логгера:
```bash
grep -L "debug/logger" $(grep -l "debugLog\|forceLog" src/**/*.ts)
```

## Результат

После завершения работ:
- ✅ Все `console.log` заменены на правильную систему
- ✅ В продакшене (`npm run build:prod`) дебаг логи скрыты
- ✅ Критические операции всегда логируются
- ✅ Разработчики используют единую систему логирования
- ✅ Настроены переменные окружения

## Использование в будущем

Разработчики должны использовать:

```typescript
import { debugLog, forceLog } from '@/core/debug/logger';

// Дебаг (скрывается в проде)
debugLog('User clicked button', buttonData);

// Критическое (всегда видно)
forceLog('Payment processed successfully', paymentInfo);

// Ошибки (всегда видно)
console.error('Payment failed', error);
