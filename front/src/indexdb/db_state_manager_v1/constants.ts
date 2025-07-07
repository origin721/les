import type { DB_UPDATE_STATUS } from "../constants";

/**
 * Интерфейс записи состояния базы данных
 */
export interface DbStateRecord {
  id: string;           // название базы (ключ)
  dbName: string;       // дублируем для удобства
  version: number;      // текущая версия базы
  status: DbUpdateStatus; // статус обновления
  lastUpdated: number;  // timestamp последнего обновления
  targetVersion?: number; // целевая версия (во время обновления)
  errorMessage?: string;  // сообщение об ошибке (если есть)
  
  // ВРЕМЕННЫЕ МЕТКИ
  migrationStartTime?: number;        // Date.now() начала миграции
  migrationEndTime?: number;          // Date.now() окончания миграции  
  migrationDurationMs?: number;       // Общее время выполнения в мс
  
  // ДЕТАЛЬНОЕ ВРЕМЯ ПО ЭТАПАМ
  schemaMigrationDuration?: number;   // Время выполнения схемы в мс
  dataMigrationDuration?: number;     // Время выполнения данных в мс
  preloadDuration?: number;           // Время предзагрузки модулей в мс
  
  // ИНФОРМАЦИЯ О ВЫПОЛНЕННЫХ МИГРАЦИЯХ
  executedMigrations?: Array<{
    version: number;
    fileName: string;
    schemaDuration: number;    // мс
    dataDuration: number;      // мс
    startTime: number;         // Date.now()
    endTime: number;           // Date.now()
  }>;
  
  // ИНФОРМАЦИЯ О МИГРИРОВАННЫХ ТАБЛИЦАХ
  migratedTables?: string[];          // Список обновленных таблиц
}

/**
 * Типы статусов обновления
 */
export type DbUpdateStatus = typeof DB_UPDATE_STATUS[keyof typeof DB_UPDATE_STATUS];

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
