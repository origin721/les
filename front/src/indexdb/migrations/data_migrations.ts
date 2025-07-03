/**
 * Система асинхронных миграций для данных (не схемы базы)
 * Используется для миграции существующих данных после создания/обновления схемы
 */

import { prodError, prodInfo, devMigration } from '../../core/debug/logger';
import type { MigrationInfo } from './types';

/**
 * Реестр миграций данных
 * Эти миграции выполняются асинхронно после создания схемы БД
 */
export const DATA_MIGRATION_REGISTRY: MigrationInfo[] = [
  {
    fromVersion: 0,
    toVersion: 1,
    description: 'Миграция accounts для добавления поля friendsByIds',
    fileName: 'data_migration_accounts_friends'
  },
  // Здесь будут другие миграции данных
];

// Используем Vite Glob Imports для автоматического обнаружения миграций
// Vite автоматически создает чанки для каждой миграции при бандлинге
const migrationModules = import.meta.glob('./data_migrations/*.ts', { 
  import: 'default',
  eager: false // Ленивая загрузка - миграции загружаются только при необходимости
});

/**
 * Проверяет и выполняет необходимые миграции данных
 * @param currentDataVersion - текущая версия данных (хранится в localStorage)
 * @param targetDataVersion - целевая версия данных
 */
export async function runDataMigrations(
  currentDataVersion: number,
  targetDataVersion: number
): Promise<void> {
  prodInfo(
    `🔄 Проверяем необходимость миграции данных: ${currentDataVersion} -> ${targetDataVersion}`
  );

  if (currentDataVersion >= targetDataVersion) {
    prodInfo('✅ Миграции данных не требуются');
    return;
  }

  const migrationsToRun = DATA_MIGRATION_REGISTRY.filter(
    migration => migration.fromVersion >= currentDataVersion && migration.toVersion <= targetDataVersion
  );

  if (migrationsToRun.length === 0) {
    prodInfo('✅ Подходящих миграций данных не найдено');
    return;
  }

  prodInfo(`🚀 Найдено ${migrationsToRun.length} миграций данных для выполнения`);

  for (const migration of migrationsToRun) {
    try {
      devMigration(`🔄 Загружаем миграцию данных: ${migration.fileName}`);
      
      // Используем Vite Glob Imports для загрузки миграции
      const migrationPath = `./data_migrations/${migration.fileName}.ts`;
      const migrationLoader = migrationModules[migrationPath];
      
      if (!migrationLoader) {
        throw new Error(`Файл миграции не найден: ${migrationPath}`);
      }
      
      const migrationFunction = await migrationLoader();
      
      if (typeof migrationFunction !== 'function') {
        throw new Error(`Миграция ${migration.fileName} не экспортирует функцию по умолчанию`);
      }
      
      prodInfo(`⚡ Выполняем миграцию данных: ${migration.description}`);
      await migrationFunction();
      
      prodInfo(`✅ Миграция данных ${migration.fileName} выполнена успешно`);
      
    } catch (error) {
      prodError(`❌ Ошибка выполнения миграции данных ${migration.fileName}:`, error);
      throw error;
    }
  }

  // Обновляем версию данных в localStorage
  localStorage.setItem('data_migration_version', targetDataVersion.toString());
  prodInfo(`✅ Все миграции данных выполнены. Версия данных обновлена до ${targetDataVersion}`);
}

/**
 * Получает текущую версию данных из localStorage
 */
export function getCurrentDataVersion(): number {
  const version = localStorage.getItem('data_migration_version');
  return version ? parseInt(version, 10) : 0;
}

/**
 * Автоматически проверяет и выполняет миграции данных при инициализации
 */
export async function autoRunDataMigrations(): Promise<void> {
  const currentVersion = getCurrentDataVersion();
  const targetVersion = Math.max(...DATA_MIGRATION_REGISTRY.map(m => m.toVersion), 0);
  
  if (currentVersion < targetVersion) {
    await runDataMigrations(currentVersion, targetVersion);
  }
}
