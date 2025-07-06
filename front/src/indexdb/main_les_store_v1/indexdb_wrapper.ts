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
import { REQUIRED_STORES } from "./REQUIRED_STORES";

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

// Счетчик активных запросов
let activeRequestsCount = 0;

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 минут

// Функция для увеличения счетчика активных запросов
function incrementActiveRequests() {
  activeRequestsCount++;
  if (isDebugMode) {
    debugLog(`📈 Увеличен счетчик активных запросов: ${activeRequestsCount}`);
  }
  
  // Сбрасываем таймер если он был активен
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
    if (isDebugMode) {
      debugLog('⏰ Таймер закрытия сброшен из-за нового активного запроса');
    }
  }
}

// Функция для уменьшения счетчика активных запросов
function decrementActiveRequests() {
  activeRequestsCount = Math.max(0, activeRequestsCount - 1);
  if (isDebugMode) {
    debugLog(`📉 Уменьшен счетчик активных запросов: ${activeRequestsCount}`);
  }
  
  // Если нет активных запросов, запускаем таймер закрытия
  if (activeRequestsCount === 0) {
    startCloseTimer();
  }
}

// Функция для запуска таймера закрытия (только когда нет активных запросов)
function startCloseTimer() {
  // Сбрасываем предыдущий таймер, если он был
  if (closeTimer) {
    clearTimeout(closeTimer);
  }
  
  closeTimer = setTimeout(() => {
    if (cachedConnection && !isClosing && activeRequestsCount === 0) {
      prodInfo(`🔒 Закрытие соединения IndexDB по таймауту (5 минут после завершения всех запросов). Активных запросов: ${activeRequestsCount}`);
      isClosing = true;
      cachedConnection.close();
      cachedConnection = null;
      connectionPromise = null;
      closeTimer = null;
      isClosing = false;
    } else if (activeRequestsCount > 0) {
      if (isDebugMode) {
        debugLog(`⏰ Таймер не сработал - есть активные запросы: ${activeRequestsCount}`);
      }
    }
  }, IDLE_TIMEOUT);
  
  if (isDebugMode) {
    debugLog(`⏰ Запущен таймер закрытия на 5 минут. Активных запросов: ${activeRequestsCount}`);
  }
}

// Функция для получения или создания соединения
async function getOrCreateConnection(): Promise<IDBDatabase> {
  // Если соединение уже существует и активно
  if (cachedConnection && !isClosing) {
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
    
    // Обработчик для принудительного закрытия извне
    db.onversionchange = function () {
      prodInfo('🔄 Принудительное закрытие соединения IndexDB (version change)');
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      isClosing = true;
      // Сбрасываем счетчик при принудительном закрытии
      activeRequestsCount = 0;
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
      // Сбрасываем счетчик при закрытии
      activeRequestsCount = 0;
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
          const missingStores = REQUIRED_STORES.filter(storeName => !db.objectStoreNames.contains(storeName));
          
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

  // Увеличиваем счетчик активных запросов при начале запроса
  incrementActiveRequests();

  const resultPromise = new Promise(async (_res, _rej) => {
    const res = (_data: any) => {
      // Уменьшаем счетчик активных запросов при завершении
      decrementActiveRequests();
      _res(_data);
      
      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.success;
      debugLog({counterInfo});
    }
    const rej = (_err: any) => {
      // Уменьшаем счетчик активных запросов при ошибке
      decrementActiveRequests();
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

// Функция для получения информации о состоянии соединения
export function getConnectionInfo() {
  return {
    hasConnection: !!cachedConnection,
    isClosing,
    activeRequestsCount,
    hasCloseTimer: !!closeTimer,
    connectionPromiseActive: !!connectionPromise
  };
}

// Функция для принудительного закрытия соединения (для тестирования/отладки)
export function forceCloseConnection() {
  if (cachedConnection) {
    prodInfo('🔒 Принудительное закрытие соединения IndexDB');
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }
    isClosing = true;
    activeRequestsCount = 0; // Сбрасываем счетчик
    cachedConnection.close();
    cachedConnection = null;
    connectionPromise = null;
    isClosing = false;
  }
}

// Функция для создания менеджера соединений
export function create_indexdb_wrapper() {
  return indexdb_wrapper;
}
