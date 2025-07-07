# Архитектура пользователь-центричных миграций IndexedDB

## СТАТУС ПРОЕКТА

### ✅ ЧТО УЖЕ СДЕЛАНО (70% готово)

#### 1. Система отслеживания времени и статистики
- **Файл**: `src/indexdb/db_state_manager_v1/constants.ts`
- **Готово**: Поля для времени миграций, детальная статистика, массив выполненных миграций
- **Интерфейс**: `DbStateRecord` с полями `migrationStartTime`, `migrationEndTime`, `executedMigrations[]`, `migratedTables[]`

#### 2. Менеджер состояний БД  
- **Файл**: `src/indexdb/db_state_manager_v1/db_state_manager.ts`
- **Готово**: Функции `startMigrationTimer()`, `endMigrationTimer()`, `recordMigrationStep()`, `detectStuckMigrations()`, `resetStuckMigration()`
- **Основная проблема РЕШЕНА**: база не может "зависнуть" навсегда

#### 3. Менеджер восстановления
- **Файл**: `src/indexdb/main_les_store_v1/recovery_manager.ts`
- **Готово**: `RecoveryManager.checkOnAppStart()`, `recoverFromIncompleteUpdate()`

#### 4. Менеджер версионирования
- **Файл**: `src/indexdb/main_les_store_v1/version_manager.ts`  
- **Готово**: `VersionManager.addVersionToAllRecords()`, `validateRecordVersions()`

#### 5. Promise-based Connection Manager
- **Файл**: `src/indexdb/main_les_store_v1/connection_manager.ts`
- **Готово**: Независимая от lifecycle архитектура, интеграция восстановления, отслеживание времени

#### 6. Упрощенный IndexDB Wrapper
- **Файл**: `src/indexdb/main_les_store_v1/indexdb_wrapper.ts`
- **Готово**: Сокращен с ~400 до ~85 строк, простой wrapper

### ❌ ЧТО НУЖНО ДОРАБОТАТЬ (30% осталось)

Основная проблема: **текущая архитектура не учитывает многопользовательскую специфику**

## ТРЕБОВАНИЯ К НОВОЙ АРХИТЕКТУРЕ

### Ключевая специфика приложения:
1. **Миграции только для авторизованных пользователей** - все данные зашифрованы
2. **Несколько пользователей одновременно** - при `login(pass)` расшифровывается несколько аккаунтов
3. **Миграции привязаны к авторизации** - выполняются в `accounts_service.onLogin()`
4. **Контекст пользователя в migrationData** - для работы с данными конкретного пользователя

## ПЛАН ДОРАБОТКИ

### 1. Новые интерфейсы и типы

#### MigrationContext - контекст выполнения миграции
```typescript
interface MigrationContext {
  db: IDBDatabase;
  currentUser: {
    id: string;        // Account.id для фильтрации данных
    pass: string;      // Пароль для дешифровки
  };
  oldVersion: number;
  newVersion: number;
}
```

#### UserMigrationRecord - состояние миграций пользователя
```typescript
interface UserMigrationRecord {
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
```

### 2. Создать UserMigrationManager
**Новый файл**: `src/indexdb/main_les_store_v1/user_migration_manager.ts`

```typescript
export class UserMigrationManager {
  /**
   * Проверить какие миграции нужны пользователю
   */
  static async checkUserMigrations(userId: string): Promise<number[]>

  /**
   * Выполнить миграции для конкретного пользователя
   */
  static async migrateUser(context: MigrationContext): Promise<void>

  /**
   * Проверить что ВСЕ пользователи прошли версию (для удаления таблиц)
   */
  static async allUsersCompletedVersion(version: number): Promise<boolean>

  /**
   * Получить статистику миграций пользователя
   */
  static async getUserMigrationStats(userId: string): Promise<UserMigrationRecord>
}
```

### 3. Создать UserStateManager  
**Новый файл**: `src/indexdb/db_state_manager_v1/user_state_manager.ts`

База состояний версии 2 с поддержкой пользователей:
- **База**: `DB_STATE_MANAGER_V2`
- **Store**: `user_migration_states` с ключом `${dbName}_${userId}`
- **Индексы**: по `userId` и `dbName`

```typescript
export class UserStateManager {
  static async getUserState(userId: string): Promise<UserMigrationRecord | null>
  static async updateUserState(userId: string, record: UserMigrationRecord): Promise<void>
  static async getUsersCompletedVersion(version: number): Promise<string[]>
  static async getAllSystemUserIds(): Promise<string[]>
}
```

### 4. Создать AllUsersChecker
**Новый файл**: `src/indexdb/main_les_store_v1/all_users_checker.ts`

Для безопасного удаления таблиц:
```typescript
export class AllUsersChecker {
  /**
   * Сканировать accounts таблицу, получить все ID пользователей
   */
  static async scanAllUserIds(db: IDBDatabase): Promise<Set<string>>

  /**
   * Проверить готовность всех пользователей для удаления таблицы
   */
  static async allUsersReady(version: number): Promise<boolean>
}
```

### 5. Обновить types.ts
**Файл**: `src/indexdb/main_les_store_v1/migrations/types.ts`

```typescript
// СТАРОЕ:
export type MigrationFunction = (db: IDBDatabase) => void | Promise<void>;

// НОВОЕ:
export type MigrationFunction = (context: MigrationContext) => void | Promise<void>;
export type AsyncMigrationFunction = (context: MigrationContext) => Promise<void>;
```

### 6. Обновить ВСЕ migrationData функции
**Затронутые файлы**: Все файлы в `src/indexdb/main_les_store_v1/migrations/combined/`

```typescript
// БЫЛО:
async function migrationData(db: IDBDatabase) {
  // работа со всеми данными
}

// СТАЛО:  
async function migrationData(context: MigrationContext) {
  const { db, currentUser } = context;
  
  // Теперь можно:
  // - Фильтровать данные по currentUser.id
  // - Дешифровывать с currentUser.pass
  // - Мигрировать только данные конкретного пользователя
}
```

### 7. Интегрировать в accounts_service
**Файл**: `src/local_back/modules/accounts_service.ts`

```typescript
// В функции onLogin():
async function onLogin(props: { body: { pass: string } }) {
  // 1. Получить все аккаунты по паролю
  const accounts = await login(props.body.pass);

  // 2. Для КАЖДОГО аккаунта выполнить миграции
  for (const account of accounts) {
    await UserMigrationManager.migrateUser({
      db: await ConnectionManager.getConnection(),
      currentUser: { id: account.id, pass: props.body.pass },
      oldVersion: await UserStateManager.getCurrentUserVersion(account.id),
      newVersion: getMaxVersion()
    });
  }

  // 3. Только после миграций всех - дать доступ
  return accounts;
}
```

### 8. Убрать indexdb_order
**Файл**: `src/indexdb/main_les_store_v1/indexdb_order.ts` - УДАЛИТЬ

- Удалить `create_promise_order` и `indexdb_order`
- Заменить на прямые вызовы UserMigrationManager
- Миграции блокируют только конкретного пользователя

### 9. Обновить ConnectionManager
**Файл**: `src/indexdb/main_les_store_v1/connection_manager.ts`

- Интегрировать UserMigrationManager вместо старой системы
- Добавить проверки пользователь-центричных состояний
- Поддержка независимых миграций пользователей

## КРИТИЧЕСКАЯ ЛОГИКА

### Алгоритм безопасного удаления таблиц
```typescript
async function canSafelyDropTable(version: number): Promise<boolean> {
  // 1. Сканировать accounts таблицу → все ID пользователей
  const allSystemUserIds = await AllUsersChecker.scanAllUserIds(db);
  
  // 2. Получить пользователей, завершивших миграцию
  const completedUserIds = await AllUsersChecker.getCompletedUserIds(version);
  
  // 3. Проверить: размеры равны И все элементы совпадают
  return allSystemUserIds.size === completedUserIds.size && 
         [...allSystemUserIds].every(id => completedUserIds.has(id));
}
```

### Последовательность авторизации
```
login(pass) → найти аккаунты → мигрировать ВСЕХ → дать доступ к данным
```

**ВАЖНО**: Если хотя бы один аккаунт не мигрирован → доступ запрещен

### Принципы блокировки
- **Schema migrations**: глобальная блокировка БД
- **Data migrations**: блокировка только конкретного пользователя  
- **Параллельность**: разные пользователи мигрируют независимо

## ПОСЛЕДОВАТЕЛЬНОСТЬ РЕАЛИЗАЦИИ

### Этап 1: Базовые компоненты
1. Обновить `constants.ts` с новыми интерфейсами
2. Создать `UserStateManager` 
3. Создать базу `DB_STATE_MANAGER_V2`

### Этап 2: Основная логика  
4. Создать `UserMigrationManager`
5. Создать `AllUsersChecker`
6. Обновить `types.ts`

### Этап 3: Миграции
7. Обновить ВСЕ функции `migrationData` (прием `MigrationContext`)
8. Обновить систему выполнения миграций

### Этап 4: Интеграция
9. Интегрировать в `accounts_service.onLogin()`  
10. Обновить `ConnectionManager`
11. Удалить `indexdb_order`

### Этап 5: Финализация
12. Обновить документацию
13. Протестировать многопользовательские сценарии

## ПРЕИМУЩЕСТВА НОВОЙ АРХИТЕКТУРЫ

1. **Масштабируемость**: каждый пользователь независим
2. **Безопасность**: миграции только авторизованных пользователей  
3. **Надежность**: детальное отслеживание по пользователям
4. **Гибкость**: индивидуальные миграции
5. **Консистентность**: безопасное удаление таблиц

## ТЕКУЩИЙ ПРОГРЕСС: 70% ВЫПОЛНЕНО

Основа заложена, требует архитектурной доработки под многопользовательскую систему с шифрованием.
