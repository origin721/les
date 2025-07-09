/**
 * Реестр актуальных миграций (новые версии)
 * Legacy миграции хранятся в отдельном файле и загружаются асинхронно
 * Имена файлов должны следовать схеме: {версия}_{название}.ts
 */
export const MIGRATIONS_REGISTRY: Record<number, string> = {
  // Актуальные миграции (загружаются всегда):
  // 7: '7_new_feature',
  // 8: '8_optimize_performance',
  // 9: '9_add_settings_store',
  // 10: '10_modern_indexes',

  // Временно оставляем базовые миграции для разработки
  0: "0_initialization",
  1: "1_accounts_friends",
  2: "2_accounts_versioning",
  3: "3_rooms_versioning",
  4: "4_accounts_room_ids",
};

/**
 * Минимальная версия в основном реестре
 * Все версии ниже этой считаются legacy и загружаются отдельно
 */
export const MIN_CURRENT_VERSION = 0; // В будущем можно изменить на 7
