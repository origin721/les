/**
 * Типы для системы версионирования сущностей
 * Отдельная база данных для отслеживания версий сущностей по пользователям
 */

/** Типы сущностей в системе */
export type EntityType = 'accounts' | 'rooms' | 'friends';

/** Прогресс миграции сущности */
export interface EntityMigrationProgress {
  /** Завершенные версии миграций [1, 2, 3] */
  completed: number[];
  /** Неудачные попытки миграций [4] */
  failed: number[];
  /** Текущая выполняющаяся миграция (если есть) */
  inProgress?: number;
  /** Timestamp начала текущей миграции */
  migrationStartTime?: number;
}

/** Запись о версии сущности для конкретного пользователя */
export interface EntityVersionRecord {
  /** Составной ключ: userId + entityType */
  id: string; // например: "user123_accounts"
  /** ID пользователя (Account.id) */
  userId: string;
  /** Тип сущности */
  entityType: EntityType;
  /** Последняя актуальная версия сущности */
  lastVersion: number;
  /** Прогресс миграций */
  migrationProgress: EntityMigrationProgress;
  /** Timestamp последнего обновления */
  lastUpdated: number;
  /** Дополнительная информация для отладки */
  debugInfo?: {
    totalRecords?: number;
    lastMigrationDuration?: number;
    errorMessage?: string;
  };
}

/** Статус миграции сущности */
export enum EntityMigrationStatus {
  IDLE = 'IDLE',                     // обычное состояние
  MIGRATION_STARTED = 'MIGRATION_STARTED',  // миграция началась
  MIGRATION_SUCCESS = 'MIGRATION_SUCCESS',  // миграция успешна
  MIGRATION_FAILED = 'MIGRATION_FAILED',    // миграция провалилась
  CORRUPTED = 'CORRUPTED'            // данные повреждены
}

/** Константы для базы версий сущностей */
export const ENTITY_VERSIONS_CONSTANTS = {
  DB_NAME: 'ENTITY_VERSIONS_V1',
  VERSION: 1,
  STORES: {
    ENTITY_VERSIONS: 'entity_versions'
  }
} as const;

/** Утилита для создания составного ключа */
export function createEntityVersionId(userId: string, entityType: EntityType): string {
  return `${userId}_${entityType}`;
}

/** Текущие версии сущностей (должны обновляться при добавлении новых миграций) */
export const CURRENT_ENTITY_VERSIONS = {
  accounts: 1,
  rooms: 1,
  friends: 1
} as const;
