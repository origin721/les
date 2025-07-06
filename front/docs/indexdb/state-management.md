# Управление состояниями БД

Система управления состояниями отслеживает статусы всех баз данных IndexedDB в проекте, предотвращает одновременные обновления и обеспечивает надежную работу с миграциями.

## Архитектура

### Отдельная база для состояний

Система использует **отдельную базу данных** `db_state_manager_v1` для хранения информации о состояниях всех других баз данных:

```typescript
// Отдельная БД только для состояний
const DB_STATE_MANAGER_VERSION = 1;
const stateDb = indexedDB.open('db_state_manager_v1', DB_STATE_MANAGER_VERSION);
```

**Преимущества:**
- Независимость от основных БД
- Невозможность "поломать" состояния при проблемах с основной БД
- Централизованное управление всеми базами

### Структура записи состояния

```typescript
interface DbStateRecord {
  id: string;              // название базы (ключ)
  dbName: string;          // дублируем для удобства
  version: number;         // текущая версия базы
  status: DbUpdateStatus;  // статус обновления
  lastUpdated: number;     // timestamp последнего обновления
  targetVersion?: number;  // целевая версия (во время обновления)
  errorMessage?: string;   // сообщение об ошибке (если есть)
}
```

## Статусы базы данных

| Статус | Константа | Описание |
|--------|-----------|----------|
| `idle` | `DB_UPDATE_STATUS.IDLE` | База в обычном состоянии, доступна для работы |
| `update_started` | `DB_UPDATE_STATUS.UPDATE_STARTED` | Началось обновление, доступ заблокирован |
| `update_success` | `DB_UPDATE_STATUS.UPDATE_SUCCESS` | Обновление завершилось успешно |
| `update_failed` | `DB_UPDATE_STATUS.UPDATE_FAILED` | Обновление завершилось с ошибкой |
| `corrupted` | `DB_UPDATE_STATUS.CORRUPTED` | База повреждена, требует восстановления |

## Основные функции

### Получение состояния БД

```typescript
import { getDbState } from './db_state_manager_v1/db_state_manager';
import { DB_NAMES } from './constants';

// Получить состояние основной БД
const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);

if (state) {
  console.log('Версия БД:', state.version);
  console.log('Статус:', state.status);
  console.log('Последнее обновление:', new Date(state.lastUpdated));
} else {
  console.log('БД еще не инициализирована');
}
```

### Обновление состояния

```typescript
import { updateDbState } from './db_state_manager_v1/db_state_manager';

const stateRecord = {
  id: 'main_les_store_v1',
  dbName: 'main_les_store_v1', 
  version: 2,
  status: 'update_success',
  lastUpdated: Date.now()
};

await updateDbState(stateRecord);
```

### Установка статуса обновления

```typescript
import { setUpdateStatus } from './db_state_manager_v1/db_state_manager';
import { DB_UPDATE_STATUS } from './constants';

// Начало обновления
await setUpdateStatus(
  'main_les_store_v1',
  DB_UPDATE_STATUS.UPDATE_STARTED,
  1, // текущая версия
  2  // целевая версия
);

// Успешное завершение
await setUpdateStatus(
  'main_les_store_v1',
  DB_UPDATE_STATUS.UPDATE_SUCCESS,
  2  // финальная версия
);

// Обновление с ошибкой
await setUpdateStatus(
  'main_les_store_v1',
  DB_UPDATE_STATUS.UPDATE_FAILED,
  1, // остается на старой версии
  undefined,
  'Ошибка при выполнении миграции: детали ошибки'
);
```

### Проверка возможности обновления

```typescript
import { canStartUpdate } from './db_state_manager_v1/db_state_manager';

const canUpdate = await canStartUpdate('main_les_store_v1');

if (canUpdate) {
  console.log('Можно начинать обновление');
  // Начать миграцию
} else {
  console.log('Обновление уже выполняется или БД заблокирована');
  // Подождать или показать сообщение пользователю
}
```

### Получение предыдущей версии для миграций

```typescript
import { getPreviousDbVersion } from './db_state_manager_v1/db_state_manager';

// Надежное получение версии для планирования миграций
const previousVersion = await getPreviousDbVersion('main_les_store_v1');
const targetVersion = getMaxVersion();

if (previousVersion < targetVersion) {
  // Требуются миграции
  await runMigrations(previousVersion, targetVersion);
}
```

## Интеграция с миграциями

### Жизненный цикл обновления БД

```typescript
import { 
  setUpdateStatus, 
  canStartUpdate,
  getPreviousDbVersion 
} from './db_state_manager_v1/db_state_manager';
import { DB_UPDATE_STATUS, DB_NAMES } from './constants';

async function updateDatabase() {
  const dbName = DB_NAMES.MAIN_LES_STORE_V1;
  
  try {
    // 1. Проверяем возможность обновления
    const canStart = await canStartUpdate(dbName);
    if (!canStart) {
      throw new Error('Обновление уже выполняется');
    }
    
    // 2. Получаем надежную версию
    const currentVersion = await getPreviousDbVersion(dbName);
    const targetVersion = getMaxVersion();
    
    if (currentVersion >= targetVersion) {
      return; // Обновление не требуется
    }
    
    // 3. Устанавливаем статус начала обновления
    await setUpdateStatus(
      dbName, 
      DB_UPDATE_STATUS.UPDATE_STARTED,
      currentVersion,
      targetVersion
    );
    
    // 4. Выполняем миграции
    await runMigrations(currentVersion, targetVersion);
    
    // 5. Устанавливаем статус успешного завершения
    await setUpdateStatus(
      dbName,
      DB_UPDATE_STATUS.UPDATE_SUCCESS,
      targetVersion
    );
    
  } catch (error) {
    // 6. В случае ошибки устанавливаем статус failed
    await setUpdateStatus(
      dbName,
      DB_UPDATE_STATUS.UPDATE_FAILED,
      undefined,
      undefined,
      error.message
    );
    throw error;
  }
}
```

### Предотвращение одновременных обновлений

Система автоматически предотвращает одновременные обновления:

```typescript
// Первый процесс
await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_STARTED);

// Второй процесс (в это же время)
const canStart = await canStartUpdate(dbName); // false
if (!canStart) {
  console.log('Обновление уже выполняется другим процессом');
  return;
}
```

## Отладка и мониторинг

### Просмотр всех состояний

```typescript
import { getAllDbStates } from './db_state_manager_v1/db_state_manager';

// Получить все состояния для отладки
const allStates = await getAllDbStates();

allStates.forEach(state => {
  console.log(`БД: ${state.dbName}`);
  console.log(`  Версия: ${state.version}`);
  console.log(`  Статус: ${state.status}`);
  console.log(`  Обновлена: ${new Date(state.lastUpdated)}`);
  
  if (state.targetVersion) {
    console.log(`  Целевая версия: ${state.targetVersion}`);
  }
  
  if (state.errorMessage) {
    console.log(`  Ошибка: ${state.errorMessage}`);
  }
  
  console.log('---');
});
```

### Логирование состояний

Система автоматически логирует изменения состояний:

```
✅ Состояние БД обновлено: {
  dbName: "main_les_store_v1",
  version: 2,
  status: "update_success"
}
```

## Обработка ошибок

### Восстановление после сбоев

```typescript
async function recoverFromFailedUpdate(dbName: string) {
  const state = await getDbState(dbName);
  
  if (state?.status === DB_UPDATE_STATUS.UPDATE_FAILED) {
    console.log('Обнаружено неудачное обновление:', state.errorMessage);
    
    // Сбросить статус для повторной попытки
    await setUpdateStatus(dbName, DB_UPDATE_STATUS.IDLE, state.version);
    
    // Можно попробовать обновление снова
    console.log('Статус сброшен, можно повторить обновление');
  }
}
```

### Обработка поврежденной БД

```typescript
async function handleCorruptedDatabase(dbName: string) {
  await setUpdateStatus(
    dbName, 
    DB_UPDATE_STATUS.CORRUPTED,
    0,
    undefined,
    'БД повреждена, требует полного пересоздания'
  );
  
  // Удалить поврежденную БД
  await new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(dbName);
    deleteRequest.onsuccess = () => resolve(true);
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });
  
  // Сбросить состояние для пересоздания
  await setUpdateStatus(dbName, DB_UPDATE_STATUS.IDLE, 0);
}
```

## Производительность

### Оптимизация запросов состояний

```typescript
// Кеширование состояния в рамках одной операции
let cachedState: DbStateRecord | null = null;

async function getCachedDbState(dbName: string): Promise<DbStateRecord | null> {
  if (!cachedState) {
    cachedState = await getDbState(dbName);
  }
  return cachedState;
}

// Сброс кеша после обновления
async function updateStateAndResetCache(state: DbStateRecord) {
  await updateDbState(state);
  cachedState = null; // Сброс кеша
}
```

### Мониторинг производительности

База состояний очень компактная и быстрая:
- Отдельная БД размером в несколько KB
- Быстрые операции чтения/записи
- Минимальное влияние на производительность приложения

Система управления состояниями обеспечивает надежную работу с IndexedDB, предотвращает конфликты и помогает отслеживать состояние всех баз данных в приложении.
