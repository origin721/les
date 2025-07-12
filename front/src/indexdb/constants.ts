/**
 * Константы для IndexedDB
 */

/**
 * Названия баз данных
 */
export const DB_NAMES = {
  MAIN_LES_STORE_V1: "main_les_store_v1",
  DB_STATE_MANAGER_V1: "db_state_manager_v1",
  ENTITY_VERSIONS_V1: "entity_versions_v1",
} as const;

/**
 * Статусы обновления баз данных
 */
export const DB_UPDATE_STATUS = {
  IDLE: "idle", // База в обычном состоянии
  UPDATE_STARTED: "update_started", // Началось обновление
  UPDATE_SUCCESS: "update_success", // Обновление завершилось успешно
  UPDATE_FAILED: "update_failed", // Обновление завершилось с ошибкой
  CORRUPTED: "corrupted", // База повреждена
} as const;
