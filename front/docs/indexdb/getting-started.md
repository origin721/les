# 🚀 IndexedDB для новичков - Начните отсюда!

Добро пожаловать в систему IndexedDB проекта secure-message! Эта страница поможет вам разобраться с системой пошагово, от простых концепций к более сложным.

## 🤔 Зачем нужна эта система?

### Проблемы обычного IndexedDB

Стандартный IndexedDB имеет множество неудобств:

```javascript
// ❌ Обычный IndexedDB - много кода для простых операций
const request = indexedDB.open('mydb', 1);
request.onerror = function(event) { /* обработка ошибок */ };
request.onupgradeneeded = function(event) { /* создание схемы */ };
request.onsuccess = function(event) {
  const db = event.target.result;
  const transaction = db.transaction(['users'], 'readwrite');
  const store = transaction.objectStore('users');
  const addRequest = store.add({ name: 'John' });
  addRequest.onsuccess = function() { /* успех */ };
  addRequest.onerror = function() { /* ошибка */ };
};
```

### Что решает наша система?

✅ **Простота использования** - всего одна функция `indexdb_wrapper()`  
✅ **Автоматические миграции** - схема БД обновляется сама  
✅ **Управление версиями** - никаких конфликтов при обновлениях  
✅ **Надёжность** - система восстанавливается после сбоев  
✅ **Производительность** - код загружается только когда нужен  

```typescript
// ✅ Наша система - просто и понятно
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['users'], 'readwrite').objectStore('users');
  await store.add({ name: 'John' });
});
```

## 📚 IndexedDB за 5 минут

### Что такое IndexedDB?
IndexedDB - это встроенная база данных в браузере. Думайте о ней как о локальном хранилище, где можно сохранять большие объёмы данных (пользователи, сообщения, файлы).

### Основные понятия

| Термин | Простое объяснение | Аналогия |
|--------|-------------------|----------|
| **База данных** | Контейнер для всех ваших данных | Папка на компьютере |
| **Object Store** | Таблица с данными | Файл Excel с таблицей |
| **Миграция** | Обновление структуры БД | Добавление новых колонок в Excel |
| **Транзакция** | Группа операций | Сохранение нескольких изменений разом |

### Самый простой пример

```typescript
import { indexdb_wrapper } from './main_les_store_v1/indexdb_wrapper';

// Сохранить данные
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite').objectStore('accounts');
  await store.put({
    id: 1,
    name: 'Мой аккаунт',
    email: 'test@example.com'
  });
});

// Получить данные
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readonly').objectStore('accounts');
  const account = await store.get(1);
  console.log(account); // { id: 1, name: 'Мой аккаунт', email: 'test@example.com' }
});
```

## 🎯 Пошаговый Tutorial

### Шаг 1: Чтение данных (5 минут)

Начнём с самого простого - чтения существующих данных:

```typescript
import { indexdb_wrapper } from './main_les_store_v1/indexdb_wrapper';

// Получить все аккаунты
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readonly');
  const store = transaction.objectStore('accounts');
  
  // Получить все записи
  const allAccounts = await store.getAll();
  console.log('Все аккаунты:', allAccounts);
  
  // Получить конкретную запись
  const account = await store.get(1);
  console.log('Аккаунт с ID 1:', account);
});
```

**💡 Важно понимать:**
- `readonly` - мы только читаем, не изменяем
- `getAll()` - получает все записи из таблицы
- `get(id)` - получает запись по ID

### Шаг 2: Сохранение данных (10 минут)

Теперь научимся сохранять:

```typescript
// Добавить новый аккаунт
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite');
  const accountStore = store.objectStore('accounts');
  
  const newAccount = {
    id: Date.now(), // Простой способ создать уникальный ID
    name: 'Новый пользователь',
    email: 'new@example.com',
    createdAt: new Date()
  };
  
  await accountStore.add(newAccount);
  console.log('Аккаунт добавлен!');
});
```

**💡 Важно понимать:**
- `readwrite` - разрешает изменение данных
- `add()` - добавляет новую запись (ошибка если ID уже существует)
- `put()` - добавляет или обновляет запись

### Шаг 3: Обновление данных (10 минут)

```typescript
// Обновить существующий аккаунт
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite');
  const accountStore = store.objectStore('accounts');
  
  // Сначала получаем существующую запись
  const account = await accountStore.get(1);
  if (account) {
    // Обновляем нужные поля
    account.name = 'Обновлённое имя';
    account.updatedAt = new Date();
    
    // Сохраняем изменения
    await accountStore.put(account);
    console.log('Аккаунт обновлён!');
  }
});
```

### Шаг 4: Удаление данных (5 минут)

```typescript
// Удалить аккаунт
await indexdb_wrapper(async (db) => {
  const store = db.transaction(['accounts'], 'readwrite');
  const accountStore = store.objectStore('accounts');
  
  await accountStore.delete(1);
  console.log('Аккаунт удалён!');
});
```

### Шаг 5: Проверка состояния системы (10 минут)

Узнаем, в каком состоянии находится наша база:

```typescript
import { getDbState } from './db_state_manager_v1/db_state_manager';
import { DB_NAMES } from './constants';

// Проверить статус базы данных
const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);

if (state) {
  console.log('Версия БД:', state.version);
  console.log('Статус:', state.status);
  console.log('Последнее обновление:', state.lastUpdated);
} else {
  console.log('База данных ещё не инициализирована');
}
```

**Возможные статусы:**
- `IDLE` - всё в порядке, можно работать
- `UPDATE_STARTED` - идёт обновление БД
- `UPDATE_SUCCESS` - обновление завершилось успешно
- `UPDATE_FAILED` - произошла ошибка

## 🔍 Глоссарий основных терминов

### Основы IndexedDB

**IndexedDB** - база данных в браузере для хранения больших объёмов структурированных данных.

**Object Store** - аналог таблицы в SQL базе данных. Хранит записи определённого типа.

**Transaction** - группа операций с БД, которые выполняются как единое целое (либо все успешно, либо ни одной).

**Key** - уникальный идентификатор записи в Object Store (аналог PRIMARY KEY в SQL).

### Термины нашей системы

**Миграция** - процесс обновления структуры БД или данных при переходе на новую версию.

**Комбинированная миграция** - файл, содержащий и изменения схемы БД, и преобразование данных.

**State Manager** - система отслеживания состояния БД, предотвращающая конфликты.

**Code Splitting** - технология загрузки кода миграций только когда они нужны.

**Connection Manager** - система управления подключениями к БД.

### Статусы БД

**IDLE** - база данных готова к работе.

**UPDATE_STARTED** - началось обновление БД (миграция).

**UPDATE_SUCCESS** - обновление прошло успешно.

**UPDATE_FAILED** - обновление завершилось с ошибкой.

**CORRUPTED** - база данных повреждена и требует восстановления.

## 🎯 Что изучать дальше?

### Для начинающих разработчиков:
1. **[📖 Примеры использования](./examples.md)** - практические задачи с решениями
2. **[❓ FAQ](./faq.md)** - ответы на частые вопросы
3. **[🎛️ Управление состояниями](./state-management.md)** - когда освоите основы

### Для опытных разработчиков:
1. **[🏠 Общий обзор](./overview.md)** - архитектура системы
2. **[🔄 Система миграций](./migrations.md)** - создание собственных миграций
3. **[📋 Техническая документация](../../src/indexdb/README.md)** - детали реализации

### Для архитекторов:
1. **[🔄 Пользователь-центричная архитектура](../../src/indexdb/user-centric-architecture.md)** - новые возможности (в разработке)
2. **[🏗️ Архитектурные решения](../../src/indexdb/main_les_store_v1/ARCHITECTURE_DECISIONS.md)** - принципы проектирования

## ⚠️ Важные предупреждения

### Что НЕ стоит делать

❌ **Не вызывайте indexdb_wrapper во время миграций** - может привести к блокировке БД
❌ **Не создавайте длинные транзакции** - браузер может их отменить
❌ **Не забывайте про async/await** - все операции асинхронные
❌ **Не храните функции в БД** - IndexedDB поддерживает только данные

### Что стоит помнить

✅ **Всегда обрабатывайте ошибки** - БД может быть недоступна  
✅ **Используйте транзакции** - они гарантируют целостность данных  
✅ **Проверяйте статус БД** - особенно после обновлений приложения  
✅ **Тестируйте на разных браузерах** - IndexedDB может вести себя по-разному  

## 🚀 Быстрый старт - Полный пример

Вот полный рабочий пример для начала работы:

```typescript
import { indexdb_wrapper } from './main_les_store_v1/indexdb_wrapper';
import { getDbState } from './db_state_manager_v1/db_state_manager';
import { DB_NAMES } from './constants';

async function myFirstDatabaseFunction() {
  try {
    // 1. Проверяем состояние БД
    const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);
    console.log('Состояние БД:', state?.status);
    
    // 2. Работаем с данными
    await indexdb_wrapper(async (db) => {
      const store = db.transaction(['accounts'], 'readwrite').objectStore('accounts');
      
      // Добавляем тестовую запись
      const testAccount = {
        id: Date.now(),
        name: 'Тестовый пользователь',
        email: 'test@example.com',
        createdAt: new Date()
      };
      
      await store.put(testAccount);
      console.log('Аккаунт сохранён!');
      
      // Получаем все записи
      const allAccounts = await store.getAll();
      console.log('Все аккаунты:', allAccounts);
    });
    
  } catch (error) {
    console.error('Ошибка работы с БД:', error);
  }
}

// Запускаем функцию
myFirstDatabaseFunction();
```

---

**🎉 Поздравляем!** Теперь вы знаете основы работы с нашей системой IndexedDB. 

**Следующий шаг:** изучите [примеры использования](./examples.md) для более сложных сценариев или [FAQ](./faq.md) для ответов на частые вопросы.
