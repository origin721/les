# Примеры использования IndexedDB

Практические примеры работы с системой IndexedDB, основанные на реальном коде проекта.

## Базовые операции с БД

### Подключение к базе данных

```typescript
import { indexdb_wrapper } from './main_les_store_v1/indexdb_wrapper';

// Простое подключение и выполнение операции
await indexdb_wrapper(async (db) => {
  // Все операции с БД выполняются здесь
  const transaction = db.transaction(['accounts'], 'readonly');
  const store = transaction.objectStore('accounts');
  
  // Ваши операции...
});
```

### CRUD операции

#### Создание записи

```typescript
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readwrite');
  const store = transaction.objectStore('accounts');
  
  const newAccount = {
    id: 'account_123',
    name: 'John Doe',
    email: 'john@example.com',
    createdAt: Date.now(),
    friendsByIds: []
  };
  
  return new Promise((resolve, reject) => {
    const request = store.add(newAccount);
    
    request.onsuccess = () => {
      console.log('✅ Аккаунт создан:', newAccount.id);
      resolve(request.result);
    };
    
    request.onerror = () => {
      console.error('❌ Ошибка создания аккаунта:', request.error);
      reject(request.error);
    };
  });
});
```

#### Чтение записи

```typescript
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readonly');
  const store = transaction.objectStore('accounts');
  
  return new Promise((resolve, reject) => {
    const request = store.get('account_123');
    
    request.onsuccess = () => {
      const account = request.result;
      
      if (account) {
        console.log('📄 Аккаунт найден:', account);
        resolve(account);
      } else {
        console.log('❌ Аккаунт не найден');
        resolve(null);
      }
    };
    
    request.onerror = () => reject(request.error);
  });
});
```

#### Обновление записи

```typescript
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readwrite');
  const store = transaction.objectStore('accounts');
  
  return new Promise((resolve, reject) => {
    // Сначала получаем существующую запись
    const getRequest = store.get('account_123');
    
    getRequest.onsuccess = () => {
      const account = getRequest.result;
      
      if (!account) {
        reject(new Error('Аккаунт не найден'));
        return;
      }
      
      // Обновляем данные
      account.name = 'John Smith';
      account.updatedAt = Date.now();
      
      // Сохраняем обновленную запись
      const putRequest = store.put(account);
      
      putRequest.onsuccess = () => {
        console.log('✅ Аккаунт обновлен:', account.id);
        resolve(account);
      };
      
      putRequest.onerror = () => reject(putRequest.error);
    };
    
    getRequest.onerror = () => reject(getRequest.error);
  });
});
```

#### Удаление записи

```typescript
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readwrite');
  const store = transaction.objectStore('accounts');
  
  return new Promise((resolve, reject) => {
    const request = store.delete('account_123');
    
    request.onsuccess = () => {
      console.log('✅ Аккаунт удален');
      resolve(true);
    };
    
    request.onerror = () => {
      console.error('❌ Ошибка удаления:', request.error);
      reject(request.error);
    };
  });
});
```

#### Получение всех записей

```typescript
await indexdb_wrapper(async (db) => {
  const transaction = db.transaction(['accounts'], 'readonly');
  const store = transaction.objectStore('accounts');
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onsuccess = () => {
      const accounts = request.result;
      console.log(`📋 Найдено ${accounts.length} аккаунтов`);
      resolve(accounts);
    };
    
    request.onerror = () => reject(request.error);
  });
});
```

## Создание новой миграции

### Шаг 1: Создание файла миграции

```typescript
// src/indexdb/main_les_store_v1/migrations/combined/2_add_settings_store.ts

export const migrationInfo = {
  version: 2,
  name: 'add_settings_store',
  description: 'Добавление хранилища настроек пользователей',
  fileName: '2_add_settings_store.ts'
};

/**
 * Миграция схемы: создание нового хранилища settings
 */
export function migrationScheme(db: IDBDatabase): void {
  console.log('📦 Выполняем миграцию схемы 2: Создание хранилища settings');
  
  // Создаем новое хранилище для настроек
  if (!db.objectStoreNames.contains('settings')) {
    const settingsStore = db.createObjectStore('settings', { keyPath: 'id' });
    
    // Добавляем индексы для быстрого поиска
    settingsStore.createIndex('byAccountId', 'accountId', { unique: false });
    settingsStore.createIndex('byCategory', 'category', { unique: false });
    settingsStore.createIndex('byKey', ['accountId', 'key'], { unique: true });
    
    console.log('✅ Хранилище settings создано с индексами');
  }
  
  console.log('✅ Миграция схемы 2 завершена успешно');
}

/**
 * Миграция данных: создание настроек по умолчанию для существующих аккаунтов
 */
export async function migrationData(db: IDBDatabase): Promise<void> {
  console.log('🔄 Начинаем миграцию данных: создание настроек по умолчанию');
  
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(['accounts', 'settings'], 'readwrite');
      const accountsStore = transaction.objectStore('accounts');
      const settingsStore = transaction.objectStore('settings');
      
      // Получаем все существующие аккаунты
      const getAllRequest = accountsStore.getAll();
      
      getAllRequest.onsuccess = () => {
        const accounts = getAllRequest.result;
        console.log(`📋 Создаем настройки для ${accounts.length} аккаунтов`);
        
        // Создаем настройки по умолчанию для каждого аккаунта
        accounts.forEach(account => {
          const defaultSettings = [
            {
              id: `${account.id}_theme`,
              accountId: account.id,
              category: 'appearance',
              key: 'theme',
              value: 'light'
            },
            {
              id: `${account.id}_language`,
              accountId: account.id,
              category: 'localization',
              key: 'language',
              value: 'en'
            },
            {
              id: `${account.id}_notifications`,
              accountId: account.id,
              category: 'notifications',
              key: 'enabled',
              value: true
            }
          ];
          
          defaultSettings.forEach(setting => {
            settingsStore.add(setting);
          });
        });
        
        console.log('✅ Настройки по умолчанию созданы');
      };
      
      transaction.oncomplete = () => {
        console.log('✅ Миграция данных 2 завершена успешно');
        resolve();
      };
      
      transaction.onerror = () => {
        console.error('❌ Ошибка миграции данных:', transaction.error);
        reject(transaction.error);
      };
      
      getAllRequest.onerror = () => {
        console.error('❌ Ошибка получения аккаунтов:', getAllRequest.error);
        reject(getAllRequest.error);
      };
      
    } catch (error) {
      console.error('❌ Критическая ошибка в migrationData:', error);
      reject(error);
    }
  });
}
```

### Шаг 2: Регистрация миграции

```typescript
// src/indexdb/main_les_store_v1/migrations/migrations.ts

const MIGRATIONS_REGISTRY: Record<number, string> = {
  0: '0_initialization',
  1: '1_accounts_friends',
  2: '2_add_settings_store', // ← Добавляем новую миграцию
  // 3: '3_next_migration',  // ← Следующие миграции
};
```

## Работа с настройками пользователя

### Получение настроек аккаунта

```typescript
async function getUserSettings(accountId: string) {
  return await indexdb_wrapper(async (db) => {
    const transaction = db.transaction(['settings'], 'readonly');
    const store = transaction.objectStore('settings');
    const index = store.index('byAccountId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(accountId);
      
      request.onsuccess = () => {
        const settings = request.result;
        
        // Преобразуем в удобный объект
        const settingsObject = settings.reduce((acc, setting) => {
          if (!acc[setting.category]) {
            acc[setting.category] = {};
          }
          acc[setting.category][setting.key] = setting.value;
          return acc;
        }, {});
        
        console.log('📋 Настройки пользователя:', settingsObject);
        resolve(settingsObject);
      };
      
      request.onerror = () => reject(request.error);
    });
  });
}

// Использование
const settings = await getUserSettings('account_123');
console.log('Тема:', settings.appearance?.theme);
console.log('Язык:', settings.localization?.language);
```

### Обновление настройки

```typescript
async function updateUserSetting(accountId: string, category: string, key: string, value: any) {
  return await indexdb_wrapper(async (db) => {
    const transaction = db.transaction(['settings'], 'readwrite');
    const store = transaction.objectStore('settings');
    const index = store.index('byKey');
    
    return new Promise((resolve, reject) => {
      // Ищем существующую настройку
      const getRequest = index.get([accountId, key]);
      
      getRequest.onsuccess = () => {
        let setting = getRequest.result;
        
        if (setting) {
          // Обновляем существующую
          setting.value = value;
          setting.updatedAt = Date.now();
          
          const putRequest = store.put(setting);
          putRequest.onsuccess = () => {
            console.log(`✅ Настройка ${category}.${key} обновлена`);
            resolve(setting);
          };
          putRequest.onerror = () => reject(putRequest.error);
          
        } else {
          // Создаем новую
          setting = {
            id: `${accountId}_${key}`,
            accountId,
            category,
            key,
            value,
            createdAt: Date.now()
          };
          
          const addRequest = store.add(setting);
          addRequest.onsuccess = () => {
            console.log(`✅ Настройка ${category}.${key} создана`);
            resolve(setting);
          };
          addRequest.onerror = () => reject(addRequest.error);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  });
}

// Использование
await updateUserSetting('account_123', 'appearance', 'theme', 'dark');
```

## Управление состояниями БД

### Проверка статуса базы данных

```typescript
import { getDbState, getAllDbStates } from './db_state_manager_v1/db_state_manager';
import { DB_NAMES } from './constants';

// Проверка состояния основной БД
async function checkDatabaseStatus() {
  const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);
  
  if (!state) {
    console.log('🆕 База данных еще не инициализирована');
    return;
  }
  
  console.log(`📊 Состояние БД ${state.dbName}:`);
  console.log(`  Версия: ${state.version}`);
  console.log(`  Статус: ${state.status}`);
  console.log(`  Последнее обновление: ${new Date(state.lastUpdated)}`);
  
  if (state.targetVersion) {
    console.log(`  Целевая версия: ${state.targetVersion}`);
  }
  
  if (state.errorMessage) {
    console.log(`  Ошибка: ${state.errorMessage}`);
  }
  
  return state;
}

// Мониторинг всех баз данных
async function monitorAllDatabases() {
  const allStates = await getAllDbStates();
  
  console.log(`📊 Мониторинг ${allStates.length} баз данных:`);
  
  allStates.forEach(state => {
    const statusIcon = {
      'idle': '✅',
      'update_started': '🔄',
      'update_success': '✅',
      'update_failed': '❌',
      'corrupted': '💥'
    }[state.status] || '❓';
    
    console.log(`${statusIcon} ${state.dbName} (v${state.version}) - ${state.status}`);
  });
}
```

### Восстановление после ошибок

```typescript
import { setUpdateStatus, canStartUpdate } from './db_state_manager_v1/db_state_manager';
import { DB_UPDATE_STATUS, DB_NAMES } from './constants';

async function recoverFromErrors() {
  const dbName = DB_NAMES.MAIN_LES_STORE_V1;
  const state = await getDbState(dbName);
  
  if (!state) {
    console.log('🆕 База данных не инициализирована');
    return;
  }
  
  switch (state.status) {
    case DB_UPDATE_STATUS.UPDATE_FAILED:
      console.log('🔧 Восстановление после неудачного обновления...');
      
      // Сбрасываем статус для повторной попытки
      await setUpdateStatus(dbName, DB_UPDATE_STATUS.IDLE, state.version);
      console.log('✅ Статус сброшен, можно повторить обновление');
      break;
      
    case DB_UPDATE_STATUS.UPDATE_STARTED:
      const timeSinceUpdate = Date.now() - state.lastUpdated;
      const timeoutMinutes = 10;
      
      if (timeSinceUpdate > timeoutMinutes * 60 * 1000) {
        console.log('⏰ Обновление зависло, принудительный сброс...');
        await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_FAILED, state.version, undefined, 'Таймаут обновления');
      } else {
        console.log('🔄 Обновление все еще выполняется...');
      }
      break;
      
    case DB_UPDATE_STATUS.CORRUPTED:
      console.log('💥 База данных повреждена, требует полного пересоздания');
      
      // Удаляем поврежденную БД
      await new Promise((resolve, reject) => {
        const deleteRequest = indexedDB.deleteDatabase(dbName);
        deleteRequest.onsuccess = () => {
          console.log('✅ Поврежденная база удалена');
          resolve(true);
        };
        deleteRequest.onerror = () => reject(deleteRequest.error);
      });
      
      // Сбрасываем состояние
      await setUpdateStatus(dbName, DB_UPDATE_STATUS.IDLE, 0);
      console.log('✅ Состояние сброшено, база будет пересоздана при следующем обращении');
      break;
      
    case DB_UPDATE_STATUS.IDLE:
    case DB_UPDATE_STATUS.UPDATE_SUCCESS:
      console.log('✅ База данных в нормальном состоянии');
      break;
      
    default:
      console.log('❓ Неизвестный статус базы данных:', state.status);
  }
}
```

## Отладка и диагностика

### Детальная диагностика БД

```typescript
async function diagnoseDatabaseIssues() {
  console.log('🔍 Запуск диагностики базы данных...');
  
  try {
    // 1. Проверяем состояние в системе управления
    const state = await getDbState(DB_NAMES.MAIN_LES_STORE_V1);
    console.log('📊 Состояние в системе управления:', state);
    
    // 2. Проверяем фактическое состояние БД
    await indexdb_wrapper(async (db) => {
      console.log('📋 Фактическая информация о БД:');
      console.log(`  Название: ${db.name}`);
      console.log(`  Версия: ${db.version}`);
      console.log(`  Object Stores: [${Array.from(db.objectStoreNames).join(', ')}]`);
      
      // 3. Проверяем содержимое каждого store
      const transaction = db.transaction(Array.from(db.objectStoreNames), 'readonly');
      
      for (const storeName of db.objectStoreNames) {
        const store = transaction.objectStore(storeName);
        
        try {
          const count = await new Promise((resolve, reject) => {
            const countRequest = store.count();
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => reject(countRequest.error);
          });
          
          console.log(`  ${storeName}: ${count} записей`);
          
          // Показываем индексы
          const indexes = Array.from(store.indexNames);
          if (indexes.length > 0) {
            console.log(`    Индексы: [${indexes.join(', ')}]`);
          }
          
        } catch (error) {
          console.error(`❌ Ошибка проверки store ${storeName}:`, error);
        }
      }
    });
    
    // 4. Проверяем возможность обновления
    const canUpdate = await canStartUpdate(DB_NAMES.MAIN_LES_STORE_V1);
    console.log(`🔄 Можно начать обновление: ${canUpdate ? 'Да' : 'Нет'}`);
    
    console.log('✅ Диагностика завершена');
    
  } catch (error) {
    console.error('❌ Ошибка диагностики:', error);
  }
}
```

### Сброс базы данных для разработки

```typescript
// ⚠️ ТОЛЬКО ДЛЯ РАЗРАБОТКИ!
async function resetDatabaseForDevelopment() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Сброс БД запрещен в production!');
  }
  
  console.log('🚨 ВНИМАНИЕ: Сброс базы данных для разработки!');
  
  const dbName = DB_NAMES.MAIN_LES_STORE_V1;
  
  try {
    // 1. Помечаем как поврежденную
    await setUpdateStatus(dbName, DB_UPDATE_STATUS.CORRUPTED, 0, undefined, 'Принудительный сброс для разработки');
    
    // 2. Удаляем БД
    await new Promise((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(dbName);
      deleteRequest.onsuccess = () => {
        console.log('✅ База данных удалена');
        resolve(true);
      };
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
    
    // 3. Также удаляем состояние
    await new Promise((resolve, reject) => {
      const deleteStateRequest = indexedDB.deleteDatabase(DB_NAMES.DB_STATE_MANAGER_V1);
      deleteStateRequest.onsuccess = () => {
        console.log('✅ База состояний удалена');
        resolve(true);
      };
      deleteStateRequest.onerror = () => reject(deleteStateRequest.error);
    });
    
    console.log('✅ Полный сброс завершен. При следующем обращении база будет пересоздана.');
    
  } catch (error) {
    console.error('❌ Ошибка сброса БД:', error);
    throw error;
  }
}
```

## Практические сценарии

### Миграция пользовательских данных

```typescript
// Пример реальной миграции: добавление поля friendsByIds к аккаунтам
export async function migrationData(db: IDBDatabase): Promise<void> {
  console.log('🔄 Миграция: добавление поля friendsByIds к аккаунтам');
  
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(['accounts', 'friends'], 'readwrite');
      const accountsStore = transaction.objectStore('accounts');
      const friendsStore = transaction.objectStore('friends');
      
      // Получаем все аккаунты и связи дружбы
      const getAccountsRequest = accountsStore.getAll();
      const getFriendsRequest = friendsStore.getAll();
      
      Promise.all([
        new Promise(resolve => { getAccountsRequest.onsuccess = () => resolve(getAccountsRequest.result); }),
        new Promise(resolve => { getFriendsRequest.onsuccess = () => resolve(getFriendsRequest.result); })
      ]).then(([accounts, friendships]) => {
        
        console.log(`📋 Обновляем ${accounts.length} аккаунтов`);
        
        // Строим карту друзей для каждого аккаунта
        const friendsMap = friendships.reduce((map, friendship) => {
          if (!map[friendship.accountId]) {
            map[friendship.accountId] = [];
          }
          map[friendship.accountId].push(friendship.friendAccountId);
          return map;
        }, {});
        
        // Обновляем каждый аккаунт
        accounts.forEach(account => {
          if (!account.friendsByIds) {
            account.friendsByIds = friendsMap[account.id] || [];
            account.migratedAt = Date.now();
            
            accountsStore.put(account);
            console.log(`✅ Аккаунт ${account.id}: добавлено ${account.friendsByIds.length} друзей`);
          }
        });
        
        transaction.oncomplete = () => {
          console.log('✅ Миграция friendsByIds завершена');
          resolve();
        };
        
        transaction.onerror = () => reject(transaction.error);
      });
      
    } catch (error) {
      reject(error);
    }
  });
}
```

Эти примеры демонстрируют реальное использование системы IndexedDB в проекте, от базовых операций до сложных миграций и управления состояниями.
