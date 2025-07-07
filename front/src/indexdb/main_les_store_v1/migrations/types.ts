/**
 * Типы для системы миграций IndexedDB
 */

// Импортируем новый контекст
import type { MigrationContext } from '../../db_state_manager_v1/constants';

// НОВЫЕ типы для пользователь-центричной архитектуры:
export type MigrationFunction = (context: MigrationContext) => void | Promise<void>;
export type AsyncMigrationFunction = (context: MigrationContext) => Promise<void>;

// Для обратной совместимости schema migrations (они остаются глобальными)
export type SchemaMigrationFunction = (db: IDBDatabase) => void | Promise<void>;

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
 * Полная структура миграции
 */
export interface Migration {
  migrationInfo: MigrationInfo;
  migrationScheme?: SchemaMigrationFunction;  // Глобальная schema
  migrationData?: MigrationFunction;          // Пользователь-центричная data
  version: number;
  fileName?: string;
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
