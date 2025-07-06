# Система миграций IndexedDB

Система миграций предоставляет мощный механизм для управления изменениями схемы и данных IndexedDB с асинхронной загрузкой кода и предзагрузкой миграций.

## Архитектура системы

### Комбинированные миграции

Каждая миграция представляет собой **единый файл**, содержащий:
- **Миграцию схемы** (синхронная) - изменения структуры БД
- **Миграцию данных** (асинхронная) - преобразование существующих данных

### Асинхронная загрузка кода

```typescript
// Код миграций загружается динамически
const module = await import(`./combined/${fileName}.ts`);
```

**Преимущества:**
- Код миграций не увеличивает размер основного bundle
- Загружаются только необходимые миграции
- Если БД уже актуальна, код миграций не загружается вообще

## Структура файла миграции

Каждый файл миграции должен экспортировать три элемента:

```typescript
// src/indexdb/main_les_store_v1/migrations/combined/2_example.ts

/**
 * Информация о миграции
 */
export const migrationInfo = {
  version: 2,                              // Номер версии (уникальный)
  name: 'example',                         // Краткое название
  description: 'Описание изменений',       // Подробное описание
  fileName: '2_example.ts'                 // Имя файла
};

/**
 * Миграция схемы (синхронная)
 * Выполняется в контексте onupgradeneeded события IndexedDB
 */
export function migrationScheme(db: IDBDatabase): void {
  // Создание object stores
  if (!db.objectStoreNames.contains('settings')) {
    const store = db.createObjectStore('settings', { keyPath: 'id' });
    
    // Создание индексов
    store.createIndex('byCategory', 'category', { unique: false });
    store.createIndex('byKey', 'key', { unique: true });
  }
  
  // Модификация существующих stores (через transaction будет доступна)
}

/**
 * Миграция данных (асинхронная) 
 * Выполняется после завершения миграции схемы
 */
export async function migrationData(db: IDBDatabase): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(['accounts', 'settings'], 'readwrite');
      const accountsStore = transaction.objectStore('accounts');
      const settingsStore = transaction.objectStore('settings');
      
      // Сложная логика преобразования данных
      const getAllRequest = accountsStore.getAll();
      
      getAllRequest.onsuccess = () => {
        const accounts = getAllRequest.result;
        
        // Пример: создание настроек по умолчанию для каждого аккаунта
        accounts.forEach(account => {
          settingsStore.add({
            id: `${account.id}_theme`,
            accountId: account.id,
            category: 'appearance',
            key: 'theme',
            value: 'light'
          });
        });
        
        resolve();
      };
      
      getAllRequest.onerror = () => reject(getAllRequest.error);
      
    } catch (error) {
      reject(error);
    }
  });
}
```

## Соглашения об именовании

### Файлы
- Формат: `{версия}_{название}.ts`
- Версии начинаются с 0 и увеличиваются последовательно
- Название должно отражать суть изменений

**Примеры:**
- `0_initialization.ts` - инициализация базы данных
- `1_accounts_friends.ts` - добавление связи аккаунтов и друзей
- `2_add_settings_store.ts` - добавление хранилища настроек
- `3_optimize_indexes.ts` - оптимизация индексов

### Переменные и функции
- `migrationInfo` - информация о миграции
- `migrationScheme` - функция миграции схемы
- `migrationData` - функция миграции данных

## Регистрация новой миграции

### 1. Создайте файл миграции

```bash
# Создайте файл в папке combined/
touch src/indexdb/main_les_store_v1/migrations/combined/2_add_settings.ts
```

### 2. Реализуйте структуру миграции

Используйте шаблон выше, заполнив соответствующую логику.

### 3. Зарегистрируйте в реестре

```typescript
// src/indexdb/main_les_store_v1/migrations/migrations.ts

const MIGRATIONS_REGISTRY: Record<number, string> = {
  0: '0_initialization',
  1: '1_accounts_friends',
  2: '2_add_settings',     // ← Добавьте новую миграцию
  // 3: '3_next_migration', // ← Будущие миграции
};
```

### 4. Миграция выполнится автоматически

При следующем запуске приложения система:
- Определит текущую версию БД
- Найдет необходимые миграции
- Асинхронно загрузит код только нужных миграций
- Выполнит их последовательно

## Процесс выполнения миграций

### 1. Инициализация
```typescript
// Определение версий без обновления БД
const currentVersion = await getCurrentDbVersion(dbName);
const targetVersion = getMaxVersion();
```

### 2. Предзагрузка
```typescript
// Асинхронная загрузка только нужных модулей
const preloadedMigrations = await preloadMigrations(currentVersion, targetVersion);
```

### 3. Миграция схемы (синхронная)
```typescript
// В контексте onupgradeneeded
runSchemaMigrations(db, oldVersion, newVersion, preloadedMigrations);
```

### 4. Миграция данных (асинхронная)
```typescript
// После открытия БД
await runDataMigrations(db, oldVersion, newVersion, preloadedMigrations);
```

## Лучшие практики

### Миграции схемы

✅ **Делайте:**
- Проверяйте существование stores перед созданием
- Создавайте индексы сразу при создании store
- Используйте описательные имена для stores и индексов
- Логируйте каждое действие

❌ **Не делайте:**
- Асинхронные операции в `migrationScheme`
- Доступ к данным в миграции схемы
- Удаление stores без крайней необходимости

```typescript
export function migrationScheme(db: IDBDatabase): void {
  // ✅ Правильно
  if (!db.objectStoreNames.contains('newStore')) {
    const store = db.createObjectStore('newStore', { keyPath: 'id' });
    store.createIndex('byDate', 'createdAt', { unique: false });
    prodInfo('✅ Хранилище newStore создано');
  }
  
  // ❌ Неправильно - асинхронная операция
  // await someAsyncOperation();
}
```

### Миграции данных

✅ **Делайте:**
- Обрабатывайте ошибки с помощью try-catch
- Используйте транзакции для атомарности
- Логируйте прогресс для больших объемов данных
- Предусматривайте откат при ошибках

❌ **Не делайте:**
- Изменение схемы в миграции данных
- Игнорирование ошибок
- Блокирующие операции без Promise

```typescript
export async function migrationData(db: IDBDatabase): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(['accounts'], 'readwrite');
      const store = transaction.objectStore('accounts');
      
      transaction.oncomplete = () => {
        prodInfo('✅ Миграция данных завершена успешно');
        resolve();
      };
      
      transaction.onerror = () => {
        prodError('❌ Ошибка миграции данных:', transaction.error);
        reject(transaction.error);
      };
      
      // Ваша логика миграции данных
      
    } catch (error) {
      prodError('❌ Критическая ошибка:', error);
      reject(error);
    }
  });
}
```

## Логирование и отладка

Система предоставляет детальные логи:

```
🔄 Предварительная загрузка модулей миграций: {oldVersion: 0, newVersion: 2}
🔄 Загружаем модуль миграции: 0_initialization
✅ Модуль миграции 0_initialization загружен успешно
🔄 Загружаем модуль миграции: 1_accounts_friends  
✅ Модуль миграции 1_accounts_friends загружен успешно
✅ Предварительно загружено 2 модулей миграций

🚀 Начинаем выполнение миграций схемы IndexedDB: {oldVersion: 0, newVersion: 2}
📋 Выполняем миграцию схемы с версии 0 до 1
📦 Выполняем миграцию схемы 0: Создание базовых хранилищ
✅ Хранилище accounts создано
✅ Хранилище friends создано  
✅ Хранилище rooms создано
✅ Миграция схемы 0_initialization выполнена за 5мс

🚀 Начинаем выполнение миграций данных IndexedDB: {oldVersion: 0, newVersion: 2}
📋 Выполняем миграцию данных с версии 0 до 1
🔄 Начинаем миграцию данных аккаунтов для добавления поля friendsByIds
✅ Миграция данных завершена (пока без изменений)
✅ Миграция данных 1_accounts_friends выполнена за 12мс
🏁 Все миграции данных IndexedDB выполнены успешно
```

## Использование утилит

### Получение информации о версии
```typescript
import { getCurrentDbVersion, getMaxVersion } from './migrations';

const currentVersion = await getCurrentDbVersion('MainLesStore');
const targetVersion = getMaxVersion();
console.log(`Текущая версия: ${currentVersion}, целевая: ${targetVersion}`);
```

### Проверка доступности миграции
```typescript
import { hasMigration, getAvailableMigrations } from './migrations';

if (hasMigration(5)) {
  console.log('Миграция версии 5 доступна');
}

const allMigrations = getAvailableMigrations();
console.log('Доступные миграции:', allMigrations);
```

## Обработка ошибок

Система обрабатывает различные типы ошибок:

- **Ошибки загрузки модулей** - отсутствующие файлы миграций
- **Ошибки схемы** - проблемы с созданием stores/индексов  
- **Ошибки данных** - проблемы при преобразовании данных
- **Ошибки транзакций** - конфликты доступа к БД

При возникновении ошибки:
1. Миграция прерывается
2. Ошибка логируется с детальной информацией
3. Состояние БД помечается как `UPDATE_FAILED`
4. Приложение может принять решение о повторной попытке или откате

## Производительность

### Оптимизация загрузки
- Код миграций загружается только при необходимости
- Модули кешируются браузером после первой загрузки
- Предзагрузка уменьшает задержки при выполнении

### Мониторинг времени выполнения
- Каждая миграция измеряется по времени выполнения
- Логируется как схема, так и миграция данных отдельно
- Можно отслеживать производительность различных миграций

Эта система обеспечивает надежное, производительное и расширяемое управление миграциями IndexedDB с современными возможностями асинхронной загрузки и детальным логированием.
