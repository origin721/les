/**
 * Реестр legacy миграций (старые версии)
 * Загружается асинхронно только при необходимости
 * Имена файлов должны следовать схеме: {версия}_{название}.ts
 */
export const LEGACY_MIGRATIONS_REGISTRY: Record<number, string> = {
  0: '0_initialization',
  1: '1_accounts_friends',
  //2: '-1_tmp_test',
  // Здесь legacy миграции для старых версий:
  // 2: '2_old_feature',
  // 3: '3_deprecated_store',
  // 4: '4_legacy_indexes',
  // 5: '5_old_accounts_format',
  // 6: '6_legacy_rooms',
};
