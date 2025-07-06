// TODO: во время начало миграции нужно показывать экран что бы не обновляли страницу и вообще спрашивать готовы ли они сейчас начать обновляться!!!!!!
import { prodInfo, prodError, devMigration } from '../../../core/debug/logger';
import { MIGRATIONS_REGISTRY } from './MIGRATIONS_REGISTRY';

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
 * Асинхронно загружает модуль миграции
 */
async function loadMigrationModule(version: number): Promise<MigrationModule> {
  const fileName = MIGRATIONS_REGISTRY[version];
  
  if (!fileName) {
    throw new Error(`Миграция для версии ${version} не найдена в реестре`);
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
    // Загружаем только необходимые миграции
    for (let version = oldVersion; version < newVersion; version++) {
      const migrationModule = await loadMigrationModule(version);
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
 */
export async function runDataMigrations(
  db: IDBDatabase, 
  oldVersion: number, 
  newVersion: number,
  preloadedMigrations: Map<number, MigrationModule>
): Promise<void> {
  prodInfo('🚀 Начинаем выполнение миграций данных IndexedDB:', {
    oldVersion,
    newVersion
  });

  try {
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
      const executionTime = Date.now() - startTime;
      
      prodInfo(`✅ Миграция данных ${migrationModule.migrationInfo.fileName} выполнена за ${executionTime}мс`);
    }

    prodInfo('🏁 Все миграции данных IndexedDB выполнены успешно');
    
  } catch (error) {
    prodError('❌ Критическая ошибка во время выполнения миграций данных IndexedDB:', error);
    throw error;
  }
}

/**
 * Получает максимальную версию схемы из реестра миграций
 */
export function getMaxVersion(): number {
  const versions = Object.keys(MIGRATIONS_REGISTRY).map(Number);
  return versions.length > 0 ? Math.max(...versions) + 1 : 1;
}

/**
 * Получает список всех доступных миграций
 */
export function getAvailableMigrations(): Record<number, string> {
  return { ...MIGRATIONS_REGISTRY };
}

/**
 * Проверяет, существует ли миграция для указанной версии
 */
export function hasMigration(version: number): boolean {
  return version in MIGRATIONS_REGISTRY;
}
