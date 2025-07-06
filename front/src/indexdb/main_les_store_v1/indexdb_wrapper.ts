import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../../core/debug/logger';
import { 
  getCurrentDbVersion, 
  preloadMigrations, 
  runSchemaMigrations, 
  runDataMigrations,
  getMaxVersion
} from './migrations/migrations';
import { runEmergencyMigrations } from './migrations/emergency_migrations';
import { DB_NAMES, DB_UPDATE_STATUS } from '../constants';
import { 
  getPreviousDbVersion, 
  setUpdateStatus, 
  canStartUpdate 
} from '../db_state_manager_v1/db_state_manager';

const counterInfo = {
  open: 0,
  close: 0,
  success: 0,
  error: 0,
}

const isDebugMode = false;

// Состояние для кеширования соединения
let cachedConnection: IDBDatabase | null = null;
let connectionPromise: Promise<IDBDatabase> | null = null;
let closeTimer: NodeJS.Timeout | null = null;
let isClosing = false;

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 минут

// Функция для сброса таймера закрытия
function resetCloseTimer() {
  if (closeTimer) {
    clearTimeout(closeTimer);
  }
  
  closeTimer = setTimeout(() => {
    if (cachedConnection && !isClosing) {
      prodInfo('🔒 Закрытие соединения IndexDB по таймауту (5 минут бездействия)');
      isClosing = true;
      cachedConnection.close();
      cachedConnection = null;
      connectionPromise = null;
      closeTimer = null;
      isClosing = false;
    }
  }, IDLE_TIMEOUT);
}

// Функция для получения или создания соединения
async function getOrCreateConnection(): Promise<IDBDatabase> {
  // Если соединение уже существует и активно
  if (cachedConnection && !isClosing) {
    resetCloseTimer();
    return cachedConnection;
  }

  // Если уже идет процесс создания соединения
  if (connectionPromise) {
    return connectionPromise;
  }

  // Создаем новое соединение
  connectionPromise = createNewConnection();
  
  try {
    const db = await connectionPromise;
    cachedConnection = db;
    resetCloseTimer();
    
    // Обработчик для принудительного закрытия извне
    db.onversionchange = function () {
      prodInfo('🔄 Принудительное закрытие соединения IndexDB (version change)');
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      isClosing = true;
      db.close();
      cachedConnection = null;
      connectionPromise = null;
      isClosing = false;
    };

    db.onclose = function () {
      prodInfo('🔒 Соединение IndexDB закрыто');
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      cachedConnection = null;
      connectionPromise = null;
      isClosing = false;
    };

    return db;
  } catch (error) {
    connectionPromise = null;
    throw error;
  }
}

// Создание нового соединения (вся оригинальная логика)
async function createNewConnection(): Promise<IDBDatabase> {
  return new Promise(async (resolve, reject) => {
    try {
      const dbName = DB_NAMES.MAIN_LES_STORE_V1;

      // 0. Проверяем, можно ли начать обновление
      const canStart = await canStartUpdate(dbName);
      if (!canStart) {
        throw new Error('База данных уже обновляется. Дождитесь завершения текущего обновления.');
      }

      // 1. Получаем версии базы данных из разных источников
      const currentVersion = await getCurrentDbVersion(dbName);
      const previousStateVersion = await getPreviousDbVersion(dbName);
      const targetVersion = getMaxVersion();
      
      prodInfo('📊 Информация о версиях БД:', {
        currentVersion,
        previousStateVersion,
        targetVersion,
        needsMigration: currentVersion < targetVersion
      });

      // Используем более надежную версию для предзагрузки миграций
      const reliableOldVersion = Math.max(currentVersion, previousStateVersion);
      
      // 2. Устанавливаем статус начала обновления
      if (reliableOldVersion < targetVersion) {
        await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_STARTED, reliableOldVersion, targetVersion);
      }

      // Переменная для хранения предварительно загруженных миграций
      let preloadedMigrations = new Map();

      // 3. Если нужны миграции, предварительно загружаем модули используя надежную версию
      if (reliableOldVersion < targetVersion) {
        prodInfo('🔄 Предварительная загрузка модулей миграций c версии:', reliableOldVersion);
        preloadedMigrations = await preloadMigrations(reliableOldVersion, targetVersion);
      }

      // 3. Открываем базу данных с целевой версией
      let openRequest = indexedDB.open(dbName, targetVersion);
      
      // Переменная для хранения реальной версии из onupgradeneeded
      let actualOldVersion = currentVersion;

      openRequest.onupgradeneeded = function (event) {
        const db = openRequest.result;
        const realOldVersion = event.oldVersion ?? 0;
        const newVersion = event.newVersion ?? targetVersion;
        
        // Сохраняем реальную версию для использования в onsuccess
        actualOldVersion = realOldVersion;
        
        prodInfo('🔄 IndexDB onupgradeneeded:', {
          oldVersion: realOldVersion,
          newVersion,
          existingStores: Array.from(db.objectStoreNames),
          detectedCurrentVersion: currentVersion,
          usingRealOldVersion: realOldVersion
        });
        
        // Перезагружаем миграции для реальной версии, если она отличается от обнаруженной
        if (realOldVersion !== currentVersion) {
          prodInfo('⚠️ Обнаружено рассинхронизация версий, сбрасываем предзагруженные миграции:', {
            detectedVersion: currentVersion,
            realVersion: realOldVersion
          });
          
          // Сбрасываем предзагруженные миграции, так как они для неправильной версии
          preloadedMigrations = new Map();
        }
        
        // 4. Выполняем миграции схемы синхронно с предварительно загруженными модулями
        if (realOldVersion < newVersion) {
          try {
            // Если миграции не загружены, используем встроенную логику для критических случаев
            if (preloadedMigrations.size === 0) {
              runEmergencyMigrations({ db, realOldVersion, newVersion });
            } else {
              // Используем реальную версию из события
              runSchemaMigrations(db, realOldVersion, newVersion, preloadedMigrations);
            }
          } catch (error) {
            prodError('Критическая ошибка во время миграции схемы IndexedDB:', error);
            throw error;
          }
        }
      };

      openRequest.onerror = async function () {
        prodError("IndexDB openRequest error:", openRequest.error);
        await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_FAILED, undefined, undefined, openRequest.error?.message);
        reject(openRequest.error);
      };

      openRequest.onsuccess = async function () {
        let db = openRequest.result;

        prodInfo('✅ IndexDB соединение установлено, версия БД:', db.version);

        try {
          // Проверяем существование критичных object stores
          const requiredStores = ['accounts', 'friends', 'rooms'];
          const missingStores = requiredStores.filter(storeName => !db.objectStoreNames.contains(storeName));
          
          if (missingStores.length > 0) {
            prodError('🚨 Обнаружены отсутствующие object stores:', missingStores);
            prodInfo('🔄 Принудительное пересоздание базы данных...');
            
            // Закрываем текущее соединение
            db.close();
            
            // Удаляем поврежденную базу
            const deleteRequest = indexedDB.deleteDatabase(dbName);
            deleteRequest.onsuccess = () => {
              prodInfo('✅ Поврежденная база удалена');
              
              // Рекурсивно перезапускаем процесс создания базы
              setTimeout(() => {
                prodInfo('🔄 Перезапуск создания базы...');
                // Перезапускаем весь процесс
                createNewConnection().then(resolve).catch(reject);
              }, 100);
            };
            
            deleteRequest.onerror = () => {
              prodError('❌ Ошибка удаления поврежденной базы:', deleteRequest.error);
              reject(deleteRequest.error);
            };
            
            return; // Выходим из текущего процесса
          }

          // Если была рассинхронизация версий, перезагружаем миграции для данных
          if (actualOldVersion !== currentVersion || preloadedMigrations.size === 0) {
            prodInfo('🔄 Перезагрузка миграций для данных с реальной версии:', actualOldVersion);
            preloadedMigrations = await preloadMigrations(actualOldVersion, targetVersion);
          }

          // 5. Выполняем миграции данных асинхронно с предварительно загруженными модулями
          if (actualOldVersion < targetVersion && preloadedMigrations.size > 0) {
            await runDataMigrations(db, actualOldVersion, targetVersion, preloadedMigrations);
          }

          prodInfo('✅ Все миграции выполнены, БД готова к использованию');
          
          // 6. Обновляем статус успешного завершения
          await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_SUCCESS, db.version);
          
          resolve(db);
          
        } catch (error) {
          prodError('Ошибка при выполнении миграций данных:', error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_FAILED, undefined, undefined, errorMessage);
          db.close();
          reject(error);
        }
      };

      openRequest.onblocked = function () {
        debugLog('Database connection blocked');
        reject(new Error('Database connection blocked'));
      };
      
    } catch (error) {
      prodError('Ошибка при инициализации IndexDB:', error);
      reject(error);
    }
  });
}

export async function indexdb_wrapper(
  onChange: (db: IDBDatabase) => Promise<void>,
) {
  if(isDebugMode) {
    ++counterInfo.open;
    debugLog({counterInfo});
  }

  const resultPromise = new Promise(async (_res, _rej) => {
    const res = (_data: any) => {
      _res(_data);
      
      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.success;
      debugLog({counterInfo});
    }
    const rej = (_err: any) => {
      _rej(_err);

      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.error;
      debugLog({counterInfo});
    }

    try {
      indexdb_order(async (onFinishOrder) => {
        resultPromise.finally(onFinishOrder);

        try {
          // Используем кешированное соединение
          const db = await getOrCreateConnection();
          
          // Вызываем пользовательский callback
          await onChange(db);
          
          // НЕ закрываем соединение - оно остается кешированным
          res(undefined);
          
        } catch (error) {
          prodError('Ошибка в indexdb_wrapper:', error);
          rej(error);
        }
      });
      
    } catch (error) {
      prodError('Критическая ошибка в indexdb_wrapper:', error);
      rej(error);
    }
  });

  return resultPromise;
}

// Функция для создания менеджера соединений
export function create_indexdb_wrapper() {
  return indexdb_wrapper;
}
