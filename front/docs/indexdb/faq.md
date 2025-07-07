# ❓ FAQ - Частые вопросы и ответы

Здесь собраны ответы на самые частые вопросы новичков и решения типичных проблем при работе с системой IndexedDB.

## 🚨 Частые ошибки и их решения

### Ошибка: "База данных заблокирована"

**Проблема:** При попытке работы с БД возникает ошибка о блокировке.

```typescript
// ❌ Неправильно - может привести к блокировке
await indexdb_wrapper(async (db) => {
  // Долгая операция без await
  someAsyncOperation(); // Забыли await!
});
```

**Решение:** Всегда используйте `await` для асинхронных операций:

```typescript
// ✅ Правильно
await indexdb_wrapper(async (db) => {
  await someAsyncOperation(); // С await
});
```

### Ошибка: "Transaction has finished"

**Проблема:** Попытка использовать транзакцию после её завершения.

```typescript
// ❌ Неправильно
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite').objectStore('accounts');
  
  await store.add({ id: 1, name: 'User 1' });
  
  // Транзакция уже завершена, новая операция не сработает
  await store.add({ id: 2, name: 'User 2' }); // Ошибка!
});
```

**Решение:** Выполняйте все операции в одной транзакции или создавайте новые:

```typescript
// ✅ Правильно - все в одной транзакции
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readwrite');
  const store = transaction.objectStore('accounts');
  
  await store.add({ id: 1, name: 'User 1' });
  await store.add({ id: 2, name: 'User 2' });
});
```

### Ошибка: "Key already exists"

**Проблема:** Попытка добавить запись с уже существующим ID.

```typescript
// ❌ Неправильно - ID уже существует
await store.add({ id: 1, name: 'New User' }); // Ошибка если ID 1 уже есть
```

**Решение:** Используйте `put()` вместо `add()` или проверяйте существование:

```typescript
// ✅ Правильно - put() обновляет или создаёт
await store.put({ id: 1, name: 'Updated User' });

// ✅ Или проверяйте существование
const existing = await store.get(1);
if (!existing) {
  await store.add({ id: 1, name: 'New User' });
}
```

## 🤔 Концептуальные вопросы

### В чём разница между `add()` и `put()`?

| Метод | Поведение | Когда использовать |
|-------|-----------|-------------------|
| `add()` | Только создаёт новые записи | Когда точно знаете, что записи нет |
| `put()` | Создаёт или обновляет | Универсальный метод для сохранения |

```typescript
// add() - только для новых записей
await store.add({ id: 1, name: 'John' }); // Ошибка если ID 1 уже есть

// put() - создаёт или обновляет
await store.put({ id: 1, name: 'John' }); // Всегда работает
```

### Когда нужен `readonly` vs `readwrite`?

**`readonly`** - только для чтения данных:
```typescript
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readonly').objectStore('accounts');
  const data = await store.getAll(); // Только чтение
});
```

**`readwrite`** - для изменения данных:
```typescript
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite').objectStore('accounts');
  await store.put({ id: 1, name: 'John' }); // Изменение данных
});
```

### Что такое "комбинированная миграция"?

Это файл, который содержит:
1. **Изменения схемы БД** (создание таблиц, индексов)
2. **Преобразование данных** (изменение существующих записей)

```typescript
// Пример комбинированной миграции
export function migrationScheme(db: IDBDatabase): void {
  // 1. Изменения схемы
  const store = db.createObjectStore('users', { keyPath: 'id' });
  store.createIndex('email', 'email', { unique: true });
}

export async function migrationData(db: IDBDatabase): Promise<void> {
  // 2. Преобразование данных
  const store = db.transaction(['users'], 'readwrite').objectStore('users');
  // ... операции с данными
}
```

## 📋 Вопросы по использованию

### Как узнать, что БД готова к работе?

```typescript
import { getDbState } from './db_state_manager_v1/db_state_manager';
import { DB_NAMES } from './constants';

const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);

if (state?.status === 'IDLE') {
  console.log('БД готова к работе');
} else {
  console.log('БД не готова:', state?.status);
}
```

### Как обработать ошибки?

```typescript
try {
  await indexdb_wrapper(async (db) => {
    // Ваши операции с БД
  });
} catch (error) {
  if (error.name === 'QuotaExceededError') {
    console.error('Закончилось место в БД');
  } else if (error.name === 'DataError') {
    console.error('Ошибка в данных');
  } else {
    console.error('Общая ошибка БД:', error);
  }
}
```

### Как получить количество записей?

```typescript
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readonly').objectStore('accounts');
  
  const count = await store.count();
  console.log('Количество аккаунтов:', count);
  
  // Или с условием
  const countActive = await store.index('status').count('active');
  console.log('Активных аккаунтов:', countActive);
});
```

### Как искать записи?

```typescript
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readonly').objectStore('accounts');
  
  // Поиск по индексу
  const usersByEmail = await store.index('email').get('user@example.com');
  
  // Поиск в диапазоне
  const range = IDBKeyRange.bound(1, 100);
  const usersInRange = await store.getAll(range);
  
  // Курсор для больших объёмов данных
  const cursor = await store.openCursor();
  while (cursor) {
    console.log('Запись:', cursor.value);
    cursor.continue();
  }
});
```

## 🛠️ Когда использовать какой подход?

### Для небольших объёмов данных (< 1000 записей)

```typescript
// Простой подход - getAll()
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readonly').objectStore('accounts');
  const allAccounts = await store.getAll();
  
  // Фильтрация в JavaScript
  const activeAccounts = allAccounts.filter(acc => acc.status === 'active');
});
```

### Для больших объёмов данных (> 1000 записей)

```typescript
// Используйте курсоры
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readonly').objectStore('accounts');
  const results = [];
  
  const cursor = await store.openCursor();
  while (cursor) {
    if (cursor.value.status === 'active') {
      results.push(cursor.value);
    }
    cursor.continue();
  }
});
```

### Для частых поисков

```typescript
// Создайте индексы в миграции
export function migrationScheme(db: IDBDatabase): void {
  const store = db.createObjectStore('accounts', { keyPath: 'id' });
  
  // Индексы для быстрого поиска
  store.createIndex('email', 'email', { unique: true });
  store.createIndex('status', 'status');
  store.createIndex('createdAt', 'createdAt');
}
```

## 🔧 Отладка и диагностика

### Как посмотреть содержимое БД?

1. **В браузере:** DevTools → Application → Storage → IndexedDB
2. **В коде:**

```typescript
async function debugDatabase() {
  await indexdb_wrapper(async (db) => {
    const storeNames = Array.from(db.objectStoreNames);
    console.log('Таблицы в БД:', storeNames);
    
    for (const storeName of storeNames) {
      const store = db.transaction([storeName], 'readonly').objectStore(storeName);
      const count = await store.count();
      const sample = await store.getAll(null, 5); // Первые 5 записей
      
      console.log(`Таблица ${storeName}:`, {
        count,
        sample
      });
    }
  });
}
```

### Как очистить БД для тестирования?

```typescript
// ⚠️ ОСТОРОЖНО: Удаляет все данные!
async function clearDatabase() {
  const dbName = 'main_les_store_v1';
  
  // Закрываем все соединения
  indexedDB.deleteDatabase(dbName);
  
  console.log('База данных очищена');
}
```

### Как проверить версию БД?

```typescript
import { getDbState } from './db_state_manager_v1/db_state_manager';
import { DB_NAMES } from './constants';

async function checkDbVersion() {
  const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);
  
  console.log('Текущая версия БД:', state?.version);
  console.log('Статус:', state?.status);
  console.log('Последнее обновление:', state?.lastUpdated);
}
```

## 🚫 Чего НЕ делать

### ❌ Не сохраняйте функции в БД
```typescript
// Неправильно
await store.put({
  id: 1,
  name: 'John',
  callback: () => console.log('Hello') // Функции не сериализуются!
});
```

### ❌ Не создавайте очень длинные транзакции
```typescript
// Неправильно - слишком долго
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite').objectStore('accounts');
  
  for (let i = 0; i < 10000; i++) {
    await store.put({ id: i, name: `User ${i}` });
    await new Promise(resolve => setTimeout(resolve, 100)); // Задержка убьёт транзакцию
  }
});
```

### ❌ Не вызывайте indexdb_wrapper во время миграций
```typescript
// Неправильно - может заблокировать БД
export async function migrationData(db: IDBDatabase): Promise<void> {
  // Не делайте так:
  await indexdb_wrapper(async (anotherDb) => {
    // Вложенный вызов может создать проблемы
  });
}
```

### ❌ Не игнорируйте ошибки
```typescript
// Неправильно
await indexdb_wrapper(async (db) => {
  store.put(someData); // Забыли await и обработку ошибок
});

// Правильно
try {
  await indexdb_wrapper(async (db) => {
    await store.put(someData);
  });
} catch (error) {
  console.error('Ошибка сохранения:', error);
}
```

## 🎯 Лучшие практики

### ✅ Группируйте операции в транзакции
```typescript
// Эффективно
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts', 'settings'], 'readwrite');
  const accountStore = transaction.objectStore('accounts');
  const settingsStore = transaction.objectStore('settings');
  
  await accountStore.put(accountData);
  await settingsStore.put(settingsData);
  // Обе операции в одной транзакции
});
```

### ✅ Используйте типизацию TypeScript
```typescript
interface Account {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
}

await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite').objectStore('accounts');
  
  const account: Account = {
    id: Date.now(),
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: new Date()
  };
  
  await store.put(account);
});
```

### ✅ Проверяйте состояние БД перед важными операциями
```typescript
async function criticalOperation() {
  const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);
  
  if (state?.status !== 'IDLE') {
    throw new Error(`БД не готова: ${state?.status}`);
  }
  
  await indexdb_wrapper(async (db) => {
    // Критически важные операции
  });
}
```

## 📞 Куда обратиться за помощью?

1. **[📖 Примеры использования](./examples.md)** - практические решения
2. **[🏠 Общий обзор](./overview.md)** - понимание архитектуры
3. **[🔄 Система миграций](./migrations.md)** - создание миграций
4. **[📋 Техническая документация](../../src/indexdb/README.md)** - детали реализации

---

**💡 Совет:** Если ваша проблема не описана здесь, сначала проверьте логи в консоли браузера - система IndexedDB предоставляет подробную информацию об ошибках.
