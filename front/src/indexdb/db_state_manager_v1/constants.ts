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
