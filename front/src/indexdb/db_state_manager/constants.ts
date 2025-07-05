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
}

/**
 * Типы статусов обновления
 */
export type DbUpdateStatus = typeof DB_UPDATE_STATUS[keyof typeof DB_UPDATE_STATUS];
