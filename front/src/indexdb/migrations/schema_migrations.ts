import { prodInfo, prodError, devDB } from '../../core/debug/logger';

// Статические импорты всех миграций
import * as migration_0_initialization_clear from './schema_migrations/0_initialization_clear';

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
type SchemaMigrationFunction = (db: IDBDatabase) => void;

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
 * Объект со статически загруженными модулями миграций
 */
const MIGRATION_MODULES: Record<number, SchemaMigrationModule> = {
  0: migration_0_initialization_clear as SchemaMigrationModule,
  // Добавлять новые миграции:
  // 1: migration_1_add_indexes as SchemaMigrationModule,
  // 2: migration_2_add_settings_store as SchemaMigrationModule,
};

/**
 * Синхронно получает модуль миграции по версии
 */
function getSchemaMigration(version: number): SchemaMigrationModule | null {
  const migrationModule = MIGRATION_MODULES[version];
  
  if (!migrationModule) {
    prodError(`Миграция для версии ${version} не найдена в модулях`);
    return null;
  }

  prodInfo(`🔄 Используем модуль миграции схемы для версии: ${version}`);
  devDB(`✅ Модуль миграции версии ${version} загружен`);
  return migrationModule;
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
      
      // Получаем модуль миграции
      const migrationModule = getSchemaMigration(version);
      
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
      migrationFunction(db);
      const executionTime = Date.now() - startTime;
      
      prodInfo(`✅ Миграция ${migrationFunctionName} выполнена за ${executionTime}мс`);
    }

    prodInfo('🏁 Все миграции схемы IndexedDB выполнены успешно. Финальные хранилища:', 
      Array.from(db.objectStoreNames));
    
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

/**
 * Получает максимальную версию схемы из реестра миграций
 */
export function getMaxSchemaVersion(): number {
  const versions = Object.keys(SCHEMA_MIGRATIONS_REGISTRY).map(Number);
  return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

/**
 * Предварительно загружает только необходимые модули миграций
 */
export async function preloadSchemaMigrations(
  oldVersion: number, 
  newVersion: number
): Promise<Map<number, SchemaMigrationModule>> {
  const loadedMigrations = new Map<number, SchemaMigrationModule>();
  
  prodInfo('🔄 Предварительная загрузка миграций схемы:', {
    oldVersion,
    newVersion
  });

  try {
    // Получаем только необходимые миграции
    for (let version = oldVersion; version < newVersion; version++) {
      const migrationModule = getSchemaMigration(version);
      
      if (!migrationModule) {
        throw new Error(`Не удалось получить миграцию для версии ${version}`);
      }
      
      loadedMigrations.set(version, migrationModule);
    }
    
    prodInfo('✅ Необходимые модули миграций предварительно загружены');
    return loadedMigrations;
    
  } catch (error) {
    prodError('❌ Ошибка предварительной загрузки миграций:', error);
    throw error;
  }
}

/**
 * Выполняет миграции схемы IndexedDB с предварительно загруженными модулями
 * ВАЖНО: Эта функция должна выполняться синхронно в контексте version change transaction
 */
export function runSchemaMigrationsSync(
  db: IDBDatabase, 
  oldVersion: number, 
  newVersion: number,
  preloadedMigrations: Map<number, SchemaMigrationModule>
): void {
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
      
      // Получаем предварительно загруженный модуль миграции
      const migrationModule = preloadedMigrations.get(version);
      
      if (!migrationModule) {
        throw new Error(`Предварительно загруженная миграция для версии ${version} не найдена`);
      }

      // Находим функцию миграции в модуле
      const migrationFunctionName = `migration_${version}_${migrationModule.migrationInfo.name}`;
      const migrationFunction = migrationModule[migrationFunctionName] as SchemaMigrationFunction;
      
      if (!migrationFunction || typeof migrationFunction !== 'function') {
        throw new Error(`Функция миграции ${migrationFunctionName} не найдена в модуле`);
      }

      // Выполняем миграцию синхронно
      const startTime = Date.now();
      migrationFunction(db);
      const executionTime = Date.now() - startTime;
      
      prodInfo(`✅ Миграция ${migrationFunctionName} выполнена за ${executionTime}мс`);
    }

    prodInfo('🏁 Все миграции схемы IndexedDB выполнены успешно. Финальные хранилища:', 
      Array.from(db.objectStoreNames));
    
  } catch (error) {
    prodError('❌ Критическая ошибка во время выполнения миграций схемы IndexedDB:', error);
    throw error;
  }
}

/**
 * Получает текущую версию базы данных без её обновления
 */
export async function getCurrentDbVersion(dbName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    try {
      // Открываем БД без указания версии для проверки текущей версии
      const checkRequest = indexedDB.open(dbName);
      
      checkRequest.onsuccess = () => {
        const currentVersion = checkRequest.result.version;
        checkRequest.result.close(); // Сразу закрываем соединение
        resolve(currentVersion);
      };
      
      checkRequest.onerror = () => {
        reject(checkRequest.error);
      };
      
      // Если БД не существует, onupgradeneeded не вызовется и мы получим версию 1
      checkRequest.onupgradeneeded = () => {
        checkRequest.result.close();
        resolve(0); // БД не существует
      };
      
    } catch (error) {
      reject(error);
    }
  });
}
