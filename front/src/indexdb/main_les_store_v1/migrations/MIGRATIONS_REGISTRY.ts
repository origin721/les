/**
 * Реестр доступных миграций
 * Имена файлов должны следовать схеме: {версия}_{название}.ts
 */
export const MIGRATIONS_REGISTRY: Record<number, string> = {
  0: '0_initialization',
  1: '1_accounts_friends',
  //2: '-1_tmp_test',
  // Здесь можно добавлять новые миграции:
  // 3: '3_add_settings_store',
  // 4: '4_optimize_indexes',
};
