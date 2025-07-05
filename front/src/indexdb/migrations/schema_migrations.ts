import { prodInfo, prodError, devDB } from '../../core/debug/logger';
import { KEYS } from '../../core/local-storage/constants';

/**
 * Информация о миграции схемы
 */
interface SchemaMigrationInfo {
  version: number;
  name: string;
  description: string;
  fileName: string;
}

/**
 * Функция миграции схемы
 */
type SchemaMigrationFunction = (db: IDBDatabase) => Promise<void>;

/**
 * Загружаемый модуль миграции
 */
interface SchemaMigrationModule {
  [key: string]: SchemaMigrationFunction | SchemaMigrationInfo;
  migrationInfo: SchemaMigrationInfo;
}

/**
 * Реестр доступных миграций схемы
 * Имена файлов должны следовать схеме: {версия}_{название_на_английском}.ts
 */
const SCHEMA_MIGRATIONS_REGISTRY: Record<number, string> = {
  0: '0_initialization_clear',
  // Здесь можно добавлять новые миграции:
  // 1: '1_add_indexes',
  // 2: '2_add_settings_store',
};

/**
 * Асинхронно загружает модуль миграции по версии
 */
async function loadSchemaMigration(version: number): Promise<SchemaMigrationModule | null> {
  const migrationName = SCHEMA_MIGRATIONS_REGISTRY[version];
  
  if (!migrationName) {
    prodError(`Миграция для версии ${version} не найдена в реестре`);
    return null;
  }

  try {
    prodInfo(`🔄 Загружаем модуль миграции схемы: ${migrationName}`);
    
    // Динамический импорт модуля миграции
    const module = await import(`./schema_migrations/${migrationName}`);
    
    devDB(`✅ Модуль миграции ${migrationName} успешно загружен`);
    return module;
  } catch (error) {
    prodError(`Ошибка загрузки модуля миграции ${migrationName}:`, error);
    return null;
  }
}

/**
 * Выполняет миграции схемы IndexedDB для указанного диапазона версий
 */
export async function runSchemaMigrations(
  db: IDBDatabase, 
  oldVersion: number, 
  newVersion: number
): Promise<void> {
  prodInfo('🚀 Начинаем выполнение миграций схемы IndexedDB:', {
    oldVersion,
    newVersion,
    existingStores: Array.from(db.objectStoreNames)
  });

  try {
    // Выполняем миграции последовательно от oldVersion до newVersion
    for (let version = oldVersion; version < newVersion; version++) {
      const targetVersion = version + 1;
      
      prodInfo(`📋 Выполняем миграцию с версии ${version} до ${targetVersion}`);
      
      // Загружаем модуль миграции
      const migrationModule = await loadSchemaMigration(version);
      
      if (!migrationModule) {
        throw new Error(`Не удалось загрузить миграцию для версии ${version}`);
      }

      // Находим функцию миграции в модуле
      const migrationFunctionName = `migration_${version}_${migrationModule.migrationInfo.name}`;
      const migrationFunction = migrationModule[migrationFunctionName] as SchemaMigrationFunction;
      
      if (!migrationFunction || typeof migrationFunction !== 'function') {
        throw new Error(`Функция миграции ${migrationFunctionName} не найдена в модуле`);
      }

      // Выполняем миграцию
      const startTime = Date.now();
      await migrationFunction(db);
      const executionTime = Date.now() - startTime;
      
      prodInfo(`✅ Миграция ${migrationFunctionName} выполнена за ${executionTime}мс`);
    }

    prodInfo('🏁 Все миграции схемы IndexedDB выполнены успешно. Финальные хранилища:', 
      Array.from(db.objectStoreNames));
    
    // Сохраняем версию схемы в localStorage
    localStorage.setItem(KEYS.SCHEMA_VERSION, newVersion.toString());
    prodInfo('📝 Версия схемы обновлена в localStorage:', newVersion);
    
  } catch (error) {
    prodError('❌ Критическая ошибка во время выполнения миграций схемы IndexedDB:', error);
    throw error;
  }
}

/**
 * Получает список всех доступных миграций
 */
export function getAvailableSchemaMigrations(): Record<number, string> {
  return { ...SCHEMA_MIGRATIONS_REGISTRY };
}

/**
 * Проверяет, существует ли миграция для указанной версии
 */
export function hasSchemaMigration(version: number): boolean {
  return version in SCHEMA_MIGRATIONS_REGISTRY;
}
