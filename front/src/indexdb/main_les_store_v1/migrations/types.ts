/**
 * Типы для системы миграций IndexedDB
 */

/**
 * Функция миграции
 * @param db - объект базы данных IndexedDB
 */
export type MigrationFunction = (db: IDBDatabase) => void | Promise<void>;

/**
 * Асинхронная функция миграции (для импорта)
 * @param db - объект базы данных IndexedDB
 */
export type AsyncMigrationFunction = (db: IDBDatabase) => Promise<void>;

/**
 * Описание миграции
 */
export interface MigrationInfo {
  version: number;
  name: string;
  description: string;
  fileName: string;
}

/**
 * Результат выполнения миграции
 */
export interface MigrationResult {
  fromVersion: number;
  toVersion: number;
  success: boolean;
  error?: Error;
  executionTime: number;
}
