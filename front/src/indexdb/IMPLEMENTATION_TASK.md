# 📋 ТЕХНИЧЕСКОЕ ЗАДАНИЕ: Завершение User-Centric Migration Architecture

## 🎯 ЦЕЛЬ ЗАДАЧИ
Завершить реализацию пользователь-центричной архитектуры миграций IndexDB для многопользовательского приложения с шифрованием. Работа выполнена на **70%**, требуется доработка **30%** функционала.

---

## 🔍 ПОЛНЫЙ КОНТЕКСТ ПРОЕКТА

### Исходная критическая проблема
**ПРОБЛЕМА:** Миграции IndexDB "зависали" и могли заблокировать базу данных навсегда, что приводило к полной неработоспособности приложения.

### Специфика приложения
1. **Многопользовательское приложение с шифрованием**
   - Все данные зашифрованы индивидуальными ключами пользователей
   - При `login(password)` расшифровывается несколько аккаунтов одновременно
   - Каждый пользователь имеет уникальный `Account.id`

2. **Особенности авторизации**
   - Один пароль может разблокировать несколько аккаунтов
   - Миграции выполняются ТОЛЬКО для авторизованных пользователей
   - Выполнение происходит в `accounts_service.onLogin()`

3. **Контекст безопасности**
   - Данные доступны только после авторизации
   - Миграции требуют контекст пользователя для дешифровки
   - Независимые миграции для каждого пользователя

---

## ✅ ВЫПОЛНЕННАЯ РАБОТА (70% готово)

### 1. Система отслеживания времени и статистики
**Файлы:** 
- `src/indexdb/db_state_manager_v1/constants.ts`
- `src/indexdb/db_state_manager_v1/db_state_manager.ts`

**Реализовано:**
- Интерфейс `DbStateRecord` с полями времени миграций
- Функции `startMigrationTimer()`, `endMigrationTimer()`
- Детальная статистика выполнения
- Массив выполненных миграций и обработанных таблиц

### 2. Менеджер восстановления после сбоев
**Файл:** `src/indexdb/main_les_store_v1/recovery_manager.ts`

**Реализовано:**
- `RecoveryManager.checkOnAppStart()` - проверка при запуске
- `recoverFromIncompleteUpdate()` - восстановление после сбоев
- Детекция зависших миграций (>10 минут)
- Принудительный сброс заблокированных состояний

### 3. Менеджер версионирования записей
**Файл:** `src/indexdb/main_les_store_v1/version_manager.ts`

**Реализовано:**
- `VersionManager.addVersionToAllRecords()` - добавление версий
- `validateRecordVersions()` - проверка консистентности
- Управление версиями данных в записях

### 4. Promise-based Connection Manager
**Файл:** `src/indexdb/main_les_store_v1/connection_manager.ts`

**Реализовано:**
- Независимая от lifecycle архитектура
- Интеграция с системой восстановления
- Отслеживание времени операций
- Promise-based подход для асинхронных операций

### 5. Упрощенный IndexDB Wrapper
**Файл:** `src/indexdb/main_les_store_v1/indexdb_wrapper.ts`

**Реализовано:**
- Сокращение с ~400 до ~85 строк кода
- Простой и понятный wrapper для legacy-кода
- Совместимость с существующими интерфейсами

### 6. 🔒 РЕШЕНА ОСНОВНАЯ ПРОБЛЕМА
- База данных больше НЕ МОЖЕТ "зависнуть" навсегда
- Автоматическое восстановление после сбоев
- Надежная система отслеживания состояний

---

## ❌ ТРЕБУЕМЫЕ ДОРАБОТКИ (30% осталось)

### Основная проблема
**Текущая архитектура НЕ УЧИТЫВАЕТ многопользовательскую специфику:**
- Миграции выполняются глобально, а не по пользователям
- Отсутствует интеграция с системой авторизации  
- Нет контекста пользователя в `migrationData` функциях
- Невозможно безопасно удалять таблицы (нужно дождаться ВСЕХ пользователей)

---

## 🛠️ ДЕТАЛЬНЫЙ ПЛАН РЕАЛИЗАЦИИ

### ЭТАП 1: Базовые компоненты (файлы и интерфейсы)

#### 1.1 Обновить constants.ts
**Файл:** `src/indexdb/db_state_manager_v1/constants.ts`

Добавить новые интерфейсы:

```typescript
/**
 * Контекст выполнения миграции для конкретного пользователя
 */
export interface MigrationContext {
  db: IDBDatabase;
  currentUser: {
    id: string;        // Account.id для фильтрации данных  
    pass: string;      // Пароль для дешифровки данных
  };
  oldVersion: number;
  newVersion: number;
}

/**
 * Состояние миграций конкретного пользователя
 */
export interface UserMigrationRecord {
  userId: string;                    // Account.id
  currentVersion: number;            // текущая версия БД для пользователя
  completedMigrations: number[];     // завершенные версии [1,2,3,4]
  migrationHistory: Array<{
    version: number;
    fileName: string;
    schemaDuration: number;
    dataDuration: number;
    startTime: number;
    endTime: number;
  }>;
  migrationStartTime?: number;
  migrationEndTime?: number;
  migrationDurationMs?: number;
  errorMessage?: string;
  migratedTables?: string[];
}

/**
 * Константы для пользователь-центричной системы
 */
export const USER_MIGRATION_CONSTANTS = {
  DB_NAME: 'DB_STATE_MANAGER_V2',     // Новая база состояний v2
  STORE_NAME: 'user_migration_states', // Store для пользователей
  VERSION: 1,
} as const;
```

#### 1.2 Создать UserStateManager
**Новый файл:** `src/indexdb/db_state_manager_v1/user_state_manager.ts`

```typescript
import { USER_MIGRATION_CONSTANTS, type UserMigrationRecord } from './constants';

/**
 * Менеджер состояний для пользователь-центричных миграций
 * База состояний версии 2 с поддержкой множественных пользователей
 */
export class UserStateManager {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Получить соединение с базой состояний v2
   */
  private static async getDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(USER_MIGRATION_CONSTANTS.DB_NAME, USER_MIGRATION_CONSTANTS.VERSION);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(USER_MIGRATION_CONSTANTS.STORE_NAME)) {
            const store = db.createObjectStore(USER_MIGRATION_CONSTANTS.STORE_NAME, { keyPath: 'userId' });
            store.createIndex('userId', 'userId', { unique: true });
            store.createIndex('currentVersion', 'currentVersion', { unique: false });
          }
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  /**
   * Получить состояние миграций пользователя
   */
  static async getUserState(userId: string): Promise<UserMigrationRecord | null> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Обновить состояние миграций пользователя
   */
  static async updateUserState(userId: string, record: Partial<UserMigrationRecord>): Promise<void> {
    const db = await this.getDatabase();
    const existingRecord = await this.getUserState(userId) || {
      userId,
      currentVersion: 0,
      completedMigrations: [],
      migrationHistory: []
    };

    const updatedRecord: UserMigrationRecord = { ...existingRecord, ...record };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.put(updatedRecord);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить список пользователей, завершивших определенную версию
   */
  static async getUsersCompletedVersion(version: number): Promise<string[]> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const records: UserMigrationRecord[] = request.result;
        const completedUsers = records
          .filter(record => record.completedMigrations.includes(version))
          .map(record => record.userId);
        resolve(completedUsers);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить всех пользователей в системе состояний
   */
  static async getAllSystemUserIds(): Promise<string[]> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.getAllKeys();
      
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }
}
```

### ЭТАП 2: Основная логика

#### 2.1 Создать UserMigrationManager
**Новый файл:** `src/indexdb/main_les_store_v1/user_migration_manager.ts`

```typescript
import { UserStateManager } from '../db_state_manager_v1/user_state_manager';
import { getAllMigrations } from './migrations/MIGRATIONS_REGISTRY';
import type { MigrationContext, UserMigrationRecord } from '../db_state_manager_v1/constants';

/**
 * Менеджер миграций для конкретных пользователей
 * Основная логика пользователь-центричной архитектуры
 */
export class UserMigrationManager {
  /**
   * Проверить какие миграции нужно выполнить для пользователя
   */
  static async checkUserMigrations(userId: string): Promise<number[]> {
    const userState = await UserStateManager.getUserState(userId);
    const currentVersion = userState?.currentVersion || 0;
    
    const allMigrations = await getAllMigrations();
    const maxVersion = Math.max(...allMigrations.map(m => m.version));
    
    const neededMigrations: number[] = [];
    for (let version = currentVersion + 1; version <= maxVersion; version++) {
      if (!userState?.completedMigrations?.includes(version)) {
        neededMigrations.push(version);
      }
    }
    
    return neededMigrations;
  }

  /**
   * Выполнить миграции для конкретного пользователя
   */
  static async migrateUser(context: MigrationContext): Promise<void> {
    const { currentUser, db, oldVersion, newVersion } = context;
    const userId = currentUser.id;
    
    console.log(`🔄 Начинаем миграцию пользователя ${userId} с версии ${oldVersion} до ${newVersion}`);
    
    // Отметить начало миграции
    await UserStateManager.updateUserState(userId, {
      migrationStartTime: Date.now(),
      currentVersion: oldVersion
    });

    try {
      const neededMigrations = await this.checkUserMigrations(userId);
      
      for (const version of neededMigrations) {
        if (version > newVersion) break;
        
        await this.executeUserMigration(context, version);
        
        // Отметить завершение конкретной версии
        const userState = await UserStateManager.getUserState(userId) || {
          userId,
          currentVersion: oldVersion,
          completedMigrations: [],
          migrationHistory: []
        };
        
        await UserStateManager.updateUserState(userId, {
          currentVersion: version,
          completedMigrations: [...userState.completedMigrations, version]
        });
      }

      // Отметить завершение всей миграции
      await UserStateManager.updateUserState(userId, {
        migrationEndTime: Date.now(),
        currentVersion: newVersion
      });

      console.log(`✅ Миграция пользователя ${userId} завершена успешно`);
      
    } catch (error) {
      console.error(`❌ Ошибка миграции пользователя ${userId}:`, error);
      
      await UserStateManager.updateUserState(userId, {
        migrationEndTime: Date.now(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Выполнить конкретную миграцию для пользователя
   */
  private static async executeUserMigration(context: MigrationContext, version: number): Promise<void> {
    const { currentUser } = context;
    
    console.log(`📦 Выполняем миграцию версии ${version} для пользователя ${currentUser.id}`);
    
    const startTime = Date.now();
    
    // Загрузить миграцию динамически
    const allMigrations = await getAllMigrations();
    const migration = allMigrations.find(m => m.version === version);
    
    if (!migration) {
      throw new Error(`Миграция версии ${version} не найдена`);
    }

    // Выполнить migrationData с контекстом пользователя
    if (migration.migrationData) {
      await migration.migrationData(context);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Миграция версии ${version} для пользователя ${currentUser.id} завершена за ${duration}мс`);
    
    // Записать в историю
    const userState = await UserStateManager.getUserState(currentUser.id);
    if (userState) {
      const historyEntry = {
        version,
        fileName: migration.fileName || `migration_${version}`,
        schemaDuration: 0, // Schema уже выполнена глобально
        dataDuration: duration,
        startTime,
        endTime
      };
      
      await UserStateManager.updateUserState(currentUser.id, {
        migrationHistory: [...userState.migrationHistory, historyEntry]
      });
    }
  }

  /**
   * Проверить что ВСЕ пользователи прошли определенную версию (для удаления таблиц)
   */
  static async allUsersCompletedVersion(version: number): Promise<boolean> {
    // Получить всех пользователей из accounts таблицы
    const allSystemUserIds = await this.scanAllUserIds();
    
    // Получить пользователей, завершивших версию
    const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
    
    // Проверить что размеры равны И все элементы совпадают
    return allSystemUserIds.size === completedUserIds.size && 
           [...allSystemUserIds].every(id => completedUserIds.has(id));
  }

  /**
   * Сканировать accounts таблицу для получения всех ID пользователей
   */
  private static async scanAllUserIds(): Promise<Set<string>> {
    // TODO: Реализовать сканирование accounts таблицы
    // Это будет зависеть от структуры вашей accounts таблицы
    throw new Error('scanAllUserIds() требует реализации под конкретную структуру accounts');
  }

  /**
   * Получить статистику миграций пользователя
   */
  static async getUserMigrationStats(userId: string): Promise<UserMigrationRecord | null> {
    return await UserStateManager.getUserState(userId);
  }
}
```

#### 2.2 Создать AllUsersChecker
**Новый файл:** `src/indexdb/main_les_store_v1/all_users_checker.ts`

```typescript
import { UserStateManager } from '../db_state_manager_v1/user_state_manager';

/**
 * Проверка готовности всех пользователей для безопасного удаления таблиц
 */
export class AllUsersChecker {
  /**
   * Сканировать accounts таблицу, получить все ID пользователей в системе
   */
  static async scanAllUserIds(db: IDBDatabase): Promise<Set<string>> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['accounts'], 'readonly');
      const store = transaction.objectStore('accounts');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const accounts = request.result;
        const userIds = new Set(accounts.map((account: any) => account.id));
        resolve(userIds);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Проверить готовность всех пользователей для удаления таблицы
   */
  static async allUsersReady(db: IDBDatabase, version: number): Promise<boolean> {
    try {
      // 1. Получить всех пользователей из accounts таблицы
      const allSystemUserIds = await this.scanAllUserIds(db);
      
      // 2. Получить пользователей, завершивших миграцию
      const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
      
      // 3. Проверить что размеры равны И все элементы совпадают
      const result = allSystemUserIds.size === completedUserIds.size && 
                     [...allSystemUserIds].every(id => completedUserIds.has(id));
      
      console.log(`🔍 Проверка готовности всех пользователей для версии ${version}:`);
      console.log(`   - Всего пользователей в системе: ${allSystemUserIds.size}`);
      console.log(`   - Завершивших миграцию: ${completedUserIds.size}`);
      console.log(`   - Результат: ${result ? '✅ Все готовы' : '⏳ Ожидание'}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка при проверке готовности пользователей:', error);
      return false;
    }
  }

  /**
   * Получить список пользователей, которые ещё не завершили миграцию
   */
  static async getPendingUsers(db: IDBDatabase, version: number): Promise<string[]> {
    const allSystemUserIds = await this.scanAllUserIds(db);
    const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
    
    return [...allSystemUserIds].filter(id => !completedUserIds.has(id));
  }
}
```

### ЭТАП 3: Обновление типов и интерфейсов

#### 3.1 Обновить types.ts
**Файл:** `src/indexdb/main_les_store_v1/migrations/types.ts`

```typescript
// Импортировать новый контекст
import type { MigrationContext } from '../../db_state_manager_v1/constants';

// СТАРЫЕ типы (УБРАТЬ):
// export type MigrationFunction = (db: IDBDatabase) => void | Promise<void>;

// НОВЫЕ типы:
export type MigrationFunction = (context: MigrationContext) => void | Promise<void>;
export type AsyncMigrationFunction = (context: MigrationContext) => Promise<void>;

// Для обратной совместимости schema migrations (они остаются глобальными)
export type SchemaMigrationFunction = (db: IDBDatabase) => void | Promise<void>;

export interface MigrationInfo {
  version: number;
  fileName?: string;
  description: string;
}

export interface Migration {
  migrationInfo: MigrationInfo;
  migrationScheme?: SchemaMigrationFunction;  // Глобальная schema
  migrationData?: MigrationFunction;          // Пользователь-центричная data
  version: number;
  fileName?: string;
}
```

### ЭТАП 4: Обновление существующих миграций

#### 4.1 Обновить ВСЕ migrationData функции
**Затронутые файлы:** Все файлы в `src/indexdb/main_les_store_v1/migrations/combined/`

**Пример обновления** (`src/indexdb/main_les_store_v1/migrations/combined/1_accounts_friends.ts`):

```typescript
// БЫЛО:
async function migrationData(db: IDBDatabase) {
  // Работа со всеми данными без контекста пользователя
  const transaction = db.transaction(['accounts'], 'readwrite');
  const store = transaction.objectStore('accounts');
  // ...
}

// СТАЛО:
async function migrationData(context: MigrationContext) {
  const { db, currentUser } = context;
  
  console.log(`🔄 Выполняем миграцию данных для пользователя: ${currentUser.id}`);
  
  const transaction = db.transaction(['accounts'], 'readwrite');
  const store = transaction.objectStore('accounts');
  
  // Получить только записи конкретного пользователя
  const userAccounts = await new Promise<any[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const allAccounts = request.result;
      // Фильтрация по currentUser.id
      const filtered = allAccounts.filter(account => account.id === currentUser.id);
      resolve(filtered);
    };
    request.onerror = () => reject(request.error);
  });
  
  // Обработать данные конкретного пользователя
  for (const account of userAccounts) {
    // Дешифровать с currentUser.pass
    // Мигрировать данные
    // Сохранить изменения
  }
  
  console.log(`✅ Миграция данных для пользователя ${currentUser.id} завершена`);
}
```

**ВАЖНО:** Нужно обновить ВСЕ файлы в директории `combined/`:
- `0_initialization.ts`
- `1_accounts_friends.ts` 
- И все остальные existing миграции

### ЭТАП 5: Интеграция с системой авторизации

#### 5.1 Интегрировать в accounts_service
**Файл:** `src/local_back/modules/accounts_service.ts` (или аналогичный)

```typescript
import { UserMigrationManager } from '../../../indexdb/main_les_store_v1/user_migration_manager';
import { ConnectionManager } from '../../../indexdb/main_les_store_v1/connection_manager';
import { getMaxVersion } from '../../../indexdb/main_les_store_v1/migrations/MIGRATIONS_REGISTRY';

// В функции onLogin():
async function onLogin(props: { body: { pass: string } }) {
  const password = props.body.pass;
  
  // 1. Получить все аккаунты по паролю (существующая логика)
  const accounts = await login(password);
  
  // 2. НОВОЕ: Для КАЖДОГО аккаунта выполнить миграции
  console.log(`🔑 Выполняем миграции для ${accounts.length} аккаунтов`);
  
  for (const account of accounts) {
    try {
      // Получить соединение с БД
      const db = await ConnectionManager.getConnection();
      
      // Подготовить контекст пользователя
      const currentUserVersion = await UserMigrationManager.getUserMigrationStats(account.id);
      const oldVersion = currentUserVersion?.currentVersion || 0;
      const newVersion = await getMaxVersion();
      
      // Выполнить миграции для конкретного пользователя
      if (oldVersion < newVersion) {
        await UserMigrationManager.migrateUser({
          db,
          currentUser: { 
            id: account.id, 
            pass: password 
          },
          oldVersion,
          newVersion
        });
        
        console.log(`✅ Миграции для пользователя ${account.id} завершены`);
      } else {
        console.log(`✅ Пользователь ${account.id} уже актуален (версия ${oldVersion})`);
      }
      
    } catch (error) {
      console.error(`❌ Ошибка миграции для пользователя ${account.id}:`, error);
      // ВАЖНО: Решить что делать при ошибке миграции одного пользователя
      // Варианты: 1) Прервать весь login, 2) Исключить пользователя, 3) Retry
      throw error; // Пока прерываем весь процесс
    }
  }
  
  // 3. Только после успешных миграций ВСЕХ пользователей - дать доступ
  console.log(`🎉 Все миграции завершены, разрешаем доступ к ${accounts.length} аккаунтам`);
  return accounts;
}
```

### ЭТАП 6: Обновление ConnectionManager

#### 6.1 Интегрировать UserMigrationManager
**Файл:** `src/indexdb/main_les_store_v1/connection_manager.ts`

Добавить поддержку пользователь-центричных проверок:

```typescript
import { UserMigrationManager } from './user_migration_manager';
import { AllUsersChecker } from './all_users_checker';

export class ConnectionManager {
  // Существующие методы остаются...
  
  /**
   * НОВЫЙ МЕТОД: Проверить готовность системы для миграций
   */
  static async checkMigrationReadiness(): Promise<{
    isReady: boolean;
    pendingUsers: string[];
    systemStatus: 'ready' | 'partial' | 'blocked';
  }> {
    try {
      const db = await this.getConnection();
      const maxVersion = await getMaxVersion();
      
      const isReady = await AllUsersChecker.allUsersReady(db, maxVersion);
      const pendingUsers = await AllUsersChecker.getPendingUsers(db, maxVersion);
      
      return {
        isReady,
        pendingUsers,
        systemStatus: isReady ? 'ready' : (pendingUsers.length > 0 ? 'partial' : 'blocked')
      };
      
    } catch (error) {
      console.error('❌ Ошибка проверки готовности миграций:', error);
      return {
        isReady: false,
        pendingUsers: [],
        systemStatus: 'blocked'
      };
    }
  }
  
  /**
   * НОВЫЙ МЕТОД: Получить статистику пользователей
   */
  static async getUsersMigrationSummary(): Promise<{
    totalUsers: number;
    migratedUsers: number;
    pendingUsers: string[];
    completionPercentage: number;
  }> {
    try {
      const db = await this.getConnection();
      const maxVersion = await getMaxVersion();
      
      const allSystemUserIds = await AllUsersChecker.scanAllUserIds(db);
      const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(maxVersion));
      const pendingUsers = [...allSystemUserIds].filter(id => !completedUserIds.has(id));
      
      return {
        totalUsers: allSystemUserIds.size,
        migratedUsers: completedUserIds.size,
        pendingUsers,
        completionPercentage: allSystemUserIds.size > 0 ? 
          Math.round((completedUserIds.size / allSystemUserIds.size) * 100) : 100
      };
      
    } catch (error) {
      console.error('❌ Ошибка получения статистики пользователей:', error);
      return {
        totalUsers: 0,
        migratedUsers: 0,
        pendingUsers: [],
        completionPercentage: 0
      };
    }
  }
}
```

### ЭТАП 7: Удаление устаревшего кода

#### 7.1 Удалить indexdb_order
**Файл:** `src/indexdb/main_les_store_v1/indexdb_order.ts` - **УДАЛИТЬ ПОЛНОСТЬЮ**

**Обоснование:**
- Система `create_promise_order` и `indexdb_order` заменяется на UserMigrationManager
- Миграции теперь блокируют только конкретного пользователя, не всю систему
- Promise-based архитектура обеспечивает независимые миграции

#### 7.2 Обновить импорты
Во всех файлах, где импортируется `indexdb_order`, заменить на новую архитектуру.

---

## 🔧 КРИТИЧЕСКИЕ ДЕТАЛИ РЕАЛИЗАЦИИ

### 1. Алгоритм безопасного удаления таблиц
```typescript
async function canSafelyDropTable(version: number): Promise<boolean> {
  // 1. Сканировать accounts таблицу → все ID пользователей
  const allSystemUserIds = await AllUsersChecker.scanAllUserIds(db);
  
  // 2. Получить пользователей, завершивших миграцию  
  const completedUserIds = await UserStateManager.getUsersCompletedVersion(version);
  
  // 3. Проверить: размеры равны И все элементы совпадают
  return allSystemUserIds.size === completedUserIds.size && 
         [...allSystemUserIds].every(id => completedUserIds.has(id));
}
```

### 2. Последовательность авторизации
```
login(pass) → найти аккаунты → мигрировать КАЖДОГО → дать доступ к данным
```
**ВАЖНО:** Если хотя бы один аккаунт не удалось мигрировать → доступ запрещен

### 3. Принципы блокировки
- **Schema migrations**: глобальная блокировка БД (как раньше)
- **Data migrations**: блокировка только конкретного пользователя  
- **Параллельность**: разные пользователи мигрируют независимо

### 4. Обработка ошибок
- При ошибке миграции пользователя - записать в `errorMessage`
- Решить политику: прервать весь login или исключить пользователя
- Предусмотреть механизм retry для проблемных миграций

---

## 📝 ПОСЛЕДОВАТЕЛЬНОСТЬ ВЫПОЛНЕНИЯ

### Фаза 1: Подготовка (критическая)
1. ✅ Обновить `src/indexdb/db_state_manager_v1/constants.ts` с новыми интерфейсами
2. ✅ Создать `src/indexdb/db_state_manager_v1/user_state_manager.ts`  
3. ✅ Создать базу `DB_STATE_MANAGER_V2` с таблицей пользователей

### Фаза 2: Основные менеджеры
4. ✅ Создать `src/indexdb/main_les_store_v1/user_migration_manager.ts`
5. ✅ Создать `src/indexdb/main_les_store_v1/all_users_checker.ts`
6. ✅ Обновить `src/indexdb/main_les_store_v1/migrations/types.ts`

### Фаза 3: Обновление миграций (массовая)
7. ⚠️ **КРИТИЧНО:** Обновить ВСЕ функции `migrationData` в `combined/`
   - Заменить `(db: IDBDatabase)` на `(context: MigrationContext)`
   - Добавить фильтрацию по `currentUser.id`
   - Добавить дешифровку с `currentUser.pass`

### Фаза 4: Интеграция (деликатная)
8. ⚠️ Интегрировать в `src/local_back/modules/accounts_service.ts`
9. ⚠️ Обновить `src/indexdb/main_les_store_v1/connection_manager.ts`
10. ✅ Удалить `src/indexdb/main_les_store_v1/indexdb_order.ts`

### Фаза 5: Финализация
11. ✅ Обновить документацию в `docs/indexdb/`
12. ✅ Протестировать многопользовательские сценарии
13. ✅ Проверить производительность на реальных данных

---

## 🚨 КРИТИЧЕСКИЕ МОМЕНТЫ

### 1. **Фильтрация данных по пользователям**
```typescript
// В каждой migrationData функции:
const userRecords = allRecords.filter(record => record.userId === currentUser.id);
```

### 2. **Дешифровка с паролем пользователя**
```typescript
// Использовать currentUser.pass для дешифровки:
const decryptedData = await decrypt(encryptedData, currentUser.pass);
```

### 3. **Безопасность миграций**
- НЕ давать доступ к данным до завершения всех миграций
- Проверять контекст пользователя в каждой операции
- Логировать все действия для аудита

### 4. **Целостность данных**
- При ошибке миграции одного пользователя - не ломать других
- Сохранять состояние после каждой успешной версии
- Возможность повторного запуска прерванных миграций

---

## 📊 ОЖИДАЕМЫЕ РЕЗУЛЬТАТЫ

### После завершения работы:
1. ✅ **100% многопользовательская совместимость**
2. ✅ **Безопасная работа с шифрованием**  
3. ✅ **Независимые миграции пользователей**
4. ✅ **Интеграция с системой авторизации**
5. ✅ **Безопасное удаление таблиц**
6. ✅ **Детальная статистика по пользователям**
7. ✅ **Надежное восстановление после сбоев**

### Производительность:
- Параллельная обработка разных пользователей
- Минимальная блокировка (только data migrations конкретного пользователя)
- Быстрые проверки готовности системы

### Безопасность:
- Контекст пользователя во всех операциях
- Контролируемый доступ к зашифрованным данным
- Полная история операций для аудита

---

## 🔗 ОБНОВЛЕНИЕ ДОКУМЕНТАЦИИ

### Файлы, требующие обновления:
1. **`docs/indexdb/README.md`** - добавить информацию о новой архитектуре
2. **`docs/indexdb/migrations.md`** - обновить примеры с MigrationContext
3. **`docs/indexdb/state-management.md`** - описать UserStateManager
4. **`docs/indexdb/examples.md`** - добавить примеры пользователь-центричных операций

### Новые разделы документации:
1. **Многопользовательская архитектура** - принципы работы
2. **Интеграция с авторизацией** - последовательность операций
3. **Безопасность миграций** - работа с шифрованием
4. **Диагностика пользователей** - отладка проблем

---

## 🎯 ЗАКЛЮЧЕНИЕ

Техническое задание представляет собой **финальные 30%** работы по созданию пользователь-центричной архитектуры IndexDB миграций. **Основа уже заложена (70%)**, требуется архитектурная доработка под многопользовательскую систему с шифрованием.

### Ключевые принципы:
1. **Пользователь-центричность** - каждый пользователь мигрирует независимо
2. **Безопасность** - контекст пользователя во всех операциях  
3. **Надежность** - детальное отслеживание состояний
4. **Производительность** - минимальные блокировки

### Критический путь:
`UserStateManager` → `UserMigrationManager` → Обновление `migrationData` → Интеграция с авторизацией

**Время реализации:** 3-5 дней (при условии параллельной работы над компонентами)

---

*Техзадание создано: 6 января 2025*  
*Статус проекта: 70% готово, 30% требует доработки*  
*Приоритет: ВЫСОКИЙ (критическая функциональность)*
