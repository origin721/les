// TODO: во время начало миграции нужно показывать экран что бы не обновляли страницу и вообще спрашивать готовы ли они сейчас начать обновляться!!!!!!
import { prodInfo, prodError, devMigration } from '../../../core/debug/logger';
import { MIGRATIONS_REGISTRY, MIN_CURRENT_VERSION } from './MIGRATIONS_REGISTRY';
import { 
  startMigrationTimer, 
  endMigrationTimer, 
  recordMigrationStep 
} from '../../db_state_manager_v1/db_state_manager';
import { VersionManager } from '../version_manager';
import { REQUIRED_STORES } from '../REQUIRED_STORES';

/**
 * Информация о миграции
 */
export interface MigrationInfo {
  version: number;
  name: string;
  description: string;
  fileName: string;
}

/**
 * Функции миграции из модуля
 */
export interface MigrationModule {
  migrationInfo: MigrationInfo;
  migrationScheme: (db: IDBDatabase) => void;
  migrationData: (db: IDBDatabase) => Promise<void>;
}

/**
 * Асинхронно загружает legacy реестр миграций
 * Загружается только при необходимости для оптимизации производительности
 */
async function loadLegacyRegistry(): Promise<Record<number, string>> {
  try {
    devMigration('🔄 Загружаем legacy реестр миграций...');
    
    // Динамический импорт legacy реестра
    const legacyModule = await import('./LEGASY_MIGRATIONS_REGISTRY');
    
    if (!legacyModule.LEGACY_MIGRATIONS_REGISTRY) {
      throw new Error('Legacy реестр не содержит LEGACY_MIGRATIONS_REGISTRY');
    }
    
    prodInfo('✅ Legacy реестр миграций загружен успешно');
    return legacyModule.LEGACY_MIGRATIONS_REGISTRY;
    
  } catch (error) {
    prodError('❌ Ошибка загрузки legacy реестра миграций:', error);
    throw error;
  }
}

/**
 * Получает объединенный реестр миграций для указанного диапазона версий
 * Автоматически определяет необходимость загрузки legacy миграций
 */
async function getCombinedRegistry(
  oldVersion: number, 
  newVersion: number
): Promise<Record<number, string>> {
  const needsLegacy = oldVersion < MIN_CURRENT_VERSION;
  
  if (!needsLegacy) {
    prodInfo('🚀 Используем только основной реестр миграций (legacy не требуется)');
    return { ...MIGRATIONS_REGISTRY };
  }
  
  prodInfo('📦 Требуются legacy миграции, загружаем объединенный реестр:', {
    oldVersion,
    newVersion,
    minCurrentVersion: MIN_CURRENT_VERSION
  });
  
  // Загружаем legacy реестр асинхронно
  const legacyRegistry = await loadLegacyRegistry();
  
  // Объединяем реестры: legacy + current
  const combinedRegistry = {
    ...legacyRegistry,
    ...MIGRATIONS_REGISTRY
  };
  
  prodInfo('✅ Объединенный реестр создан:', {
    legacyCount: Object.keys(legacyRegistry).length,
    currentCount: Object.keys(MIGRATIONS_REGISTRY).length,
    totalCount: Object.keys(combinedRegistry).length
  });
  
  return combinedRegistry;
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

/**
 * Асинхронно загружает модуль миграции из объединенного реестра
 */
async function loadMigrationModule(
  version: number, 
  combinedRegistry: Record<number, string>
): Promise<MigrationModule> {
  const fileName = combinedRegistry[version];
  
  if (!fileName) {
    throw new Error(`Миграция для версии ${version} не найдена в объединенном реестре`);
  }

  try {
    devMigration(`🔄 Загружаем модуль миграции: ${fileName}`);
    
    // Динамический импорт модуля миграции
    const module = await import(`./combined/${fileName}.ts`);
    
    if (!module.migrationInfo || !module.migrationScheme || !module.migrationData) {
      throw new Error(`Модуль миграции ${fileName} не содержит необходимые экспорты (migrationInfo, migrationScheme, migrationData)`);
    }
    
    prodInfo(`✅ Модуль миграции ${fileName} загружен успешно`);
    return module as MigrationModule;
    
  } catch (error) {
    prodError(`❌ Ошибка загрузки модуля миграции ${fileName}:`, error);
    throw error;
  }
}

/**
 * Предварительно загружает модули миграций для указанного диапазона версий
 * Использует объединенный реестр с поддержкой legacy миграций
 */
export async function preloadMigrations(
  oldVersion: number, 
  newVersion: number
): Promise<Map<number, MigrationModule>> {
  const loadedMigrations = new Map<number, MigrationModule>();
  
  prodInfo('🔄 Предварительная загрузка модулей миграций:', {
    oldVersion,
    newVersion
  });

  try {
    // Получаем объединенный реестр (с legacy если нужно)
    const combinedRegistry = await getCombinedRegistry(oldVersion, newVersion);
    
    // Загружаем только необходимые миграции
    for (let version = oldVersion; version < newVersion; version++) {
      const migrationModule = await loadMigrationModule(version, combinedRegistry);
      loadedMigrations.set(version, migrationModule);
    }
    
    prodInfo(`✅ Предварительно загружено ${loadedMigrations.size} модулей миграций`);
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
export function runSchemaMigrations(
  db: IDBDatabase, 
  oldVersion: number, 
  newVersion: number,
  preloadedMigrations: Map<number, MigrationModule>
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
      
      prodInfo(`📋 Выполняем миграцию схемы с версии ${version} до ${targetVersion}`);
      
      // Получаем предварительно загруженный модуль миграции
      const migrationModule = preloadedMigrations.get(version);
      
      if (!migrationModule) {
        throw new Error(`Предварительно загруженная миграция для версии ${version} не найдена`);
      }

      // Выполняем миграцию схемы синхронно
      const startTime = Date.now();
      migrationModule.migrationScheme(db);
      const executionTime = Date.now() - startTime;
      
      prodInfo(`✅ Миграция схемы ${migrationModule.migrationInfo.fileName} выполнена за ${executionTime}мс`);
    }

    prodInfo('🏁 Все миграции схемы IndexedDB выполнены успешно. Финальные хранилища:', 
      Array.from(db.objectStoreNames));
    
  } catch (error) {
    prodError('❌ Критическая ошибка во время выполнения миграций схемы IndexedDB:', error);
    throw error;
  }
}

/**
 * Выполняет миграции данных с предварительно загруженными модулями
 * Включает отслеживание времени и добавление версий к записям
 */
export async function runDataMigrations(
  db: IDBDatabase, 
  oldVersion: number, 
  newVersion: number,
  preloadedMigrations: Map<number, MigrationModule>,
  dbName: string
): Promise<void> {
  prodInfo('🚀 Начинаем выполнение миграций данных IndexedDB:', {
    oldVersion,
    newVersion
  });

  try {
    const migratedTables: string[] = [];

    // Выполняем миграции данных последовательно от oldVersion до newVersion
    for (let version = oldVersion; version < newVersion; version++) {
      const targetVersion = version + 1;
      
      prodInfo(`📋 Выполняем миграцию данных с версии ${version} до ${targetVersion}`);
      
      // Получаем предварительно загруженный модуль миграции
      const migrationModule = preloadedMigrations.get(version);
      
      if (!migrationModule) {
        throw new Error(`Предварительно загруженная миграция для версии ${version} не найдена`);
      }

      // Выполняем миграцию данных асинхронно
      const startTime = Date.now();
      await migrationModule.migrationData(db);
      const dataDuration = Date.now() - startTime;
      
      prodInfo(`✅ Миграция данных ${migrationModule.migrationInfo.fileName} выполнена за ${dataDuration}мс`);
      
      // Записываем детальную информацию о выполненной миграции
      await recordMigrationStep(dbName, {
        version: targetVersion,
        fileName: migrationModule.migrationInfo.fileName,
        schemaDuration: (migrationModule as any)._schemaDuration || 0,
        dataDuration
      });

      migratedTables.push(migrationModule.migrationInfo.fileName);
    }

    // ДОБАВЛЯЕМ ВЕРСИИ КО ВСЕМ ЗАПИСЯМ после успешных миграций
    prodInfo('🔖 Добавляем поле version ко всем записям...');
    for (const storeName of Array.from(db.objectStoreNames)) {
      if (REQUIRED_STORES.includes(storeName)) {
        await VersionManager.addVersionToAllRecords(db, storeName, newVersion);
        prodInfo(`✅ Добавлена версия ${newVersion} ко всем записям в ${storeName}`);
      }
    }

    prodInfo('🏁 Все миграции данных IndexedDB выполнены успешно');
    
  } catch (error) {
    prodError('❌ Критическая ошибка во время выполнения миграций данных IndexedDB:', error);
    throw error;
  }
}

/**
 * Получает максимальную версию схемы из реестра миграций
 * Учитывает только основной реестр (новые версии)
 */
export function getMaxVersion(): number {
  const versions = Object.keys(MIGRATIONS_REGISTRY).map(Number);
  return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

/**
 * Получает список всех доступных миграций (только основной реестр)
 * Для получения legacy миграций используйте getCombinedAvailableMigrations
 */
export function getAvailableMigrations(): Record<number, string> {
  return { ...MIGRATIONS_REGISTRY };
}

/**
 * Получает список всех доступных миграций включая legacy
 * Асинхронная функция для полного списка миграций
 */
export async function getCombinedAvailableMigrations(): Promise<Record<number, string>> {
  try {
    const legacyRegistry = await loadLegacyRegistry();
    return {
      ...legacyRegistry,
      ...MIGRATIONS_REGISTRY
    };
  } catch (error) {
    prodError('❌ Ошибка получения объединенного списка миграций:', error);
    // Fallback на основной реестр
    return { ...MIGRATIONS_REGISTRY };
  }
}

/**
 * Проверяет, существует ли миграция для указанной версии (только основной реестр)
 * Для проверки включая legacy используйте hasCombinedMigration
 */
export function hasMigration(version: number): boolean {
  return version in MIGRATIONS_REGISTRY;
}

/**
 * Проверяет, существует ли миграция для указанной версии включая legacy
 * Асинхронная функция для полной проверки
 */
export async function hasCombinedMigration(version: number): Promise<boolean> {
  // Сначала проверяем основной реестр (быстро)
  if (version in MIGRATIONS_REGISTRY) {
    return true;
  }
  
  // Если версия меньше минимальной в основном реестре, проверяем legacy
  if (version < MIN_CURRENT_VERSION) {
    try {
      const legacyRegistry = await loadLegacyRegistry();
      return version in legacyRegistry;
    } catch (error) {
      prodError('❌ Ошибка проверки legacy миграции:', error);
      return false;
    }
  }
  
  return false;
}
