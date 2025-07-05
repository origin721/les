# IndexedDB система с управлением состояниями

## Обзор

Обновленная система IndexedDB с улучшенным управлением миграциями и отслеживанием состояний баз данных.

## Основные компоненты

### 1. Константы (`constants.ts`)
- `DB_NAMES` - названия баз данных
- `DB_UPDATE_STATUS` - статусы обновления баз
- Типы для записей состояния

### 2. Система управления состояниями (`db_state_manager/`)
- Отдельная база данных для отслеживания состояний всех баз
- Функции для управления статусами обновления
- Предотвращение одновременных обновлений

### 3. Основная база данных (`main_les_store_v1/`)
- Обновленный wrapper с интеграцией системы состояний
- Улучшенная логика предзагрузки миграций
- Исправленная экстренная миграция

## Ключевые улучшения

### Предзагрузка миграций
```typescript
// Система теперь использует надежную версию для предзагрузки
const reliableOldVersion = Math.max(currentVersion, previousStateVersion);
const preloadedMigrations = await preloadMigrations(reliableOldVersion, targetVersion);
```

### Управление статусами
```typescript
// Проверка возможности начать обновление
const canStart = await canStartUpdate(dbName);

// Установка статуса обновления
await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_STARTED, oldVersion, targetVersion);

// Завершение обновления
await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_SUCCESS, finalVersion);
```

### Исправленная экстренная миграция
- Создает базовые хранилища независимо от версии, если они отсутствуют
- Дополнительная проверка критических object stores
- Более надежная обработка рассинхронизации версий

## Решенные проблемы

1. **Рассинхронизация версий**: Система теперь корректно обрабатывает случаи, когда `getCurrentDbVersion()` и `event.oldVersion` возвращают разные значения

2. **Отсутствующие object stores**: Экстренная миграция гарантированно создает все необходимые хранилища

3. **Предзагрузка миграций**: Использует более надежный способ определения версии для предзагрузки

4. **Управление состояниями**: Предотвращает одновременные обновления и отслеживает статус

## Использование

```typescript
import { indexdb_wrapper } from './main_les_store_v1/indexdb_wrapper';
import { DB_NAMES, DB_UPDATE_STATUS } from './constants';
import { getDbState, getAllDbStates } from './db_state_manager/db_state_manager';

// Обычная работа с базой
await indexdb_wrapper(async (db) => {
  // Работа с базой данных
});

// Проверка состояния базы
const state = await getDbState(DB_NAMES.MAIN_LES_STORE);
console.log('Статус базы:', state?.status);

// Отладка - просмотр всех состояний
const allStates = await getAllDbStates();
console.log('Все состояния баз:', allStates);
```

## Логирование

Система предоставляет подробные логи:
- 📊 Информация о версиях БД
- 🔄 Ход предзагрузки миграций
- 🚨 Экстренные миграции
- ✅ Успешные завершения
- ❌ Ошибки с деталями

## Статусы обновления

- `IDLE` - база в обычном состоянии
- `UPDATE_STARTED` - началось обновление
- `UPDATE_SUCCESS` - обновление завершено успешно
- `UPDATE_FAILED` - обновление завершилось с ошибкой
- `CORRUPTED` - база повреждена
