import type { MigrationInfo, MigrationResult, AsyncMigrationFunction } from './types';
import { prodError, prodInfo, devMigration } from '../../core/debug/logger';

/**
 * Реестр всех доступных миграций
 * Каждая запись описывает переход от одной версии к другой
 */
export const MIGRATION_REGISTRY: MigrationInfo[] = [
  {
    fromVersion: 0,
    toVersion: 1,
    description: 'Создание базовых object stores: accounts и friends',
    fileName: 'migration_v0_to_v1'
  },
  // Здесь будут добавляться новые миграции в будущем
  // {
  //   fromVersion: 1,
  //   toVersion: 2,
  //   description: 'Добавление индексов для производительности',
  //   fileName: 'migration_v1_to_v2'
  // },
];

/**
 * Получить список миграций, которые нужно выполнить
 * @param fromVersion - текущая версия базы данных
 * @param toVersion - целевая версия базы данных
 * @returns массив миграций для выполнения
 */
export function getMigrationsToRun(fromVersion: number, toVersion: number): MigrationInfo[] {
  const migrationsToRun: MigrationInfo[] = [];
  
  for (let version = fromVersion; version < toVersion; version++) {
    const migration = MIGRATION_REGISTRY.find(
      m => m.fromVersion === version && m.toVersion === version + 1
    );
    
    if (migration) {
      migrationsToRun.push(migration);
    } else {
      throw new Error(
        `Миграция с версии ${version} на ${version + 1} не найдена в реестре`
      );
    }
  }
  
  return migrationsToRun;
}

/**
 * Динамически загружает и выполняет миграцию
 * @param migration - информация о миграции
 * @param db - объект базы данных IndexedDB
 * @returns результат выполнения миграции
 */
export async function executeMigration(
  migration: MigrationInfo,
  db: IDBDatabase
): Promise<MigrationResult> {
  const startTime = performance.now();
  
  try {
    devMigration(
      `🔄 Загружаем миграцию ${migration.fileName} (v${migration.fromVersion} -> v${migration.toVersion})`
    );
    
    // Динамический импорт миграции
    const migrationModule = await import(`./${migration.fileName}.js`);
    const migrationFunction: AsyncMigrationFunction = migrationModule.default;
    
    // Выполняем миграцию
    await migrationFunction(db);
    
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    prodInfo(
      `✅ Миграция ${migration.fileName} выполнена за ${executionTime.toFixed(2)}ms`
    );
    
    return {
      fromVersion: migration.fromVersion,
      toVersion: migration.toVersion,
      success: true,
      executionTime
    };
    
  } catch (error) {
    const endTime = performance.now();
    const executionTime = endTime - startTime;
    
    prodError(
      `❌ Ошибка выполнения миграции ${migration.fileName}:`,
      error
    );
    
    return {
      fromVersion: migration.fromVersion,
      toVersion: migration.toVersion,
      success: false,
      error: error as Error,
      executionTime
    };
  }
}

/**
 * Выполняет все необходимые миграции последовательно
 * @param fromVersion - текущая версия базы данных
 * @param toVersion - целевая версия базы данных
 * @param db - объект базы данных IndexedDB
 * @returns массив результатов выполнения миграций
 */
export async function runMigrations(
  fromVersion: number,
  toVersion: number,
  db: IDBDatabase
): Promise<MigrationResult[]> {
  prodInfo(
    `🚀 Начинаем процесс миграций с версии ${fromVersion} до ${toVersion}`
  );
  
  const migrationsToRun = getMigrationsToRun(fromVersion, toVersion);
  const results: MigrationResult[] = [];
  
  for (const migration of migrationsToRun) {
    const result = await executeMigration(migration, db);
    results.push(result);
    
    // Если миграция не удалась, прерываем процесс
    if (!result.success) {
      throw new Error(
        `Миграция ${migration.fileName} завершилась с ошибкой: ${result.error?.message}`
      );
    }
  }
  
  const totalTime = results.reduce((sum, result) => sum + result.executionTime, 0);
  prodInfo(
    `✅ Все миграции выполнены успешно. Общее время: ${totalTime.toFixed(2)}ms`
  );
  
  return results;
}
