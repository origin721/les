/**
 * Константы для IndexedDB
 */

/**
 * Названия баз данных
 */
export const DB_NAMES = {
  MAIN_LES_STORE: "main_les_store_v1",
  DB_STATE_MANAGER: "db_state_manager_v1"
} as const;

/**
 * Статусы обновления баз данных
 */
export const DB_UPDATE_STATUS = {
  IDLE: "idle",                    // База в обычном состоянии
  UPDATE_STARTED: "update_started", // Началось обновление
  UPDATE_SUCCESS: "update_success", // Обновление завершилось успешно
  UPDATE_FAILED: "update_failed",   // Обновление завершилось с ошибкой
  CORRUPTED: "corrupted"           // База повреждена
} as const;

/**
 * Типы статусов обновления
 */
export type DbUpdateStatus = typeof DB_UPDATE_STATUS[keyof typeof DB_UPDATE_STATUS];

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
