import { debugLog, prodError, prodInfo } from '../../core/debug/logger';
import { 
  getCurrentDbVersion, 
  preloadMigrations, 
  runSchemaMigrations, 
  getMaxVersion
} from './migrations/migrations';
import { runEmergencyMigrations } from './migrations/emergency_migrations';
import { DB_NAMES, DB_UPDATE_STATUS } from '../constants';
import { 
  getPreviousDbVersion, 
  setUpdateStatus, 
  canStartUpdate,
  startMigrationTimer,
  endMigrationTimer,
  recordMigrationStep,
  detectStuckMigrations,
  resetStuckMigration as resetStuckMigrationState
} from '../db_state_manager_v1/db_state_manager';
import { REQUIRED_STORES } from "./REQUIRED_STORES";
import { RecoveryManager } from './recovery_manager';
import { VersionManager } from './version_manager';

const isDebugMode = false;

// Состояние для кеширования соединения
let cachedConnection: IDBDatabase | null = null;
let connectionPromise: Promise<IDBDatabase> | null = null;
let closeTimer: NodeJS.Timeout | null = null;
let isClosing = false;

// Счетчик активных запросов
let activeRequestsCount = 0;

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 минут

/**
 * Основной класс для управления соединениями IndexedDB
 * Promise-based архитектура, независимая от lifecycle страницы
 */
export class ConnectionManager {
  
  /**
   * Получить соединение с базой данных
   * Основная точка входа для всех операций с БД
   */
  static async getConnection(): Promise<IDBDatabase> {
    // Проверяем и восстанавливаем после возможных сбоев
    await ConnectionManager.checkAndRecoverFromFailures();
    
    // Если соединение уже существует и активно
    if (cachedConnection && !isClosing) {
      return cachedConnection;
    }

    // Если уже идет процесс создания соединения
    if (connectionPromise) {
      return connectionPromise;
    }

    // Создаем новое соединение
    connectionPromise = ConnectionManager.createNewConnection();
    
    try {
      const db = await connectionPromise;
      cachedConnection = db;
      
      // Настраиваем обработчики событий
      ConnectionManager.setupConnectionHandlers(db);

      return db;
    } catch (error) {
      connectionPromise = null;
      throw error;
    }
  }

  /**
   * Проверка и восстановление после сбоев при старте приложения
   */
  static async checkAndRecoverFromFailures(): Promise<void> {
    try {
      const dbName = DB_NAMES.MAIN_LES_STORE_V1;
      
      // Проверяем зависшие миграции
      const hasStuckMigration = await detectStuckMigrations(dbName);
      
      if (hasStuckMigration) {
        prodInfo('🔧 Обнаружена зависшая миграция, выполняем восстановление...');
        await ConnectionManager.resetStuckMigration(dbName);
      }

      // Делегируем дополнительные проверки Recovery Manager
      await RecoveryManager.checkOnAppStart();
      
    } catch (error) {
      prodError('❌ Ошибка при проверке состояния БД:', error);
      // Не блокируем работу приложения при ошибках восстановления
    }
  }

  /**
   * Принудительный сброс заблокированной миграции
   */
  static async resetStuckMigration(dbName: string): Promise<void> {
    try {
      await resetStuckMigrationState(dbName);
      
      // Сбрасываем кешированное соединение
      if (cachedConnection) {
        cachedConnection.close();
        cachedConnection = null;
      }
      connectionPromise = null;
      
      prodInfo('✅ Заблокированная миграция сброшена');
    } catch (error) {
      prodError('❌ Ошибка сброса заблокированной миграции:', error);
      throw error;
    }
  }

  /**
   * Создание нового соединения (основная логика из indexdb_wrapper)
   */
  private static async createNewConnection(): Promise<IDBDatabase> {
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
        
        // 2. Устанавливаем статус начала обновления + ВРЕМЯ
        if (reliableOldVersion < targetVersion) {
          await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_STARTED, reliableOldVersion, targetVersion);
          await startMigrationTimer(dbName, reliableOldVersion, targetVersion);
        }

        // Переменная для хранения предварительно загруженных миграций
        let preloadedMigrations = new Map();

        // 3. Если нужны миграции, предварительно загружаем модули
        if (reliableOldVersion < targetVersion) {
          const preloadStart = Date.now();
          prodInfo('🔄 Предварительная загрузка модулей миграций c версии:', reliableOldVersion);
          preloadedMigrations = await preloadMigrations(reliableOldVersion, targetVersion);
          const preloadDuration = Date.now() - preloadStart;
          prodInfo(`✅ Предзагрузка завершена за ${preloadDuration}мс`);
        }

        // 4. Открываем базу данных с целевой версией
        let openRequest = indexedDB.open(dbName, targetVersion);
        let actualOldVersion = currentVersion;

        openRequest.onupgradeneeded = function (event) {
          const db = openRequest.result;
          const realOldVersion = event.oldVersion ?? 0;
          const newVersion = event.newVersion ?? targetVersion;
          
          actualOldVersion = realOldVersion;
          
          prodInfo('🔄 IndexDB onupgradeneeded:', {
            oldVersion: realOldVersion,
            newVersion,
            existingStores: Array.from(db.objectStoreNames),
            detectedCurrentVersion: currentVersion,
            usingRealOldVersion: realOldVersion
          });
          
          // Перезагружаем миграции для реальной версии, если она отличается
          if (realOldVersion !== currentVersion) {
            prodInfo('⚠️ Обнаружена рассинхронизация версий, сбрасываем предзагруженные миграции:', {
              detectedVersion: currentVersion,
              realVersion: realOldVersion
            });
            preloadedMigrations = new Map();
          }
          
          // 5. Выполняем миграции схемы синхронно
          if (realOldVersion < newVersion) {
            try {
              if (preloadedMigrations.size === 0) {
                runEmergencyMigrations({ db, realOldVersion, newVersion });
              } else {
                ConnectionManager.runSchemaMigrationsWithTiming(
                  db, realOldVersion, newVersion, preloadedMigrations, dbName
                );
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
              
              db.close();
              
              const deleteRequest = indexedDB.deleteDatabase(dbName);
              deleteRequest.onsuccess = () => {
                prodInfo('✅ Поврежденная база удалена');
                setTimeout(() => {
                  prodInfo('🔄 Перезапуск создания базы...');
                  ConnectionManager.createNewConnection().then(resolve).catch(reject);
                }, 100);
              };
              
              deleteRequest.onerror = () => {
                prodError('❌ Ошибка удаления поврежденной базы:', deleteRequest.error);
                reject(deleteRequest.error);
              };
              
              return;
            }

            // 6. В пользователь-центричной архитектуре миграции данных выполняются 
            // только при авторизации пользователей в accounts_service.onLogin()
            // ConnectionManager выполняет только миграции схемы
            prodInfo('✅ Миграции схемы выполнены, БД готова к использованию');
            prodInfo('ℹ️ Миграции данных будут выполнены при авторизации пользователей');
            
            // 7. Обновляем статус успешного завершения + ВРЕМЯ
            await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_SUCCESS, db.version);
            await endMigrationTimer(dbName);
            
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

  /**
   * Выполнение миграций схемы с записью времени по каждой миграции
   */
  private static runSchemaMigrationsWithTiming(
    db: IDBDatabase,
    oldVersion: number,
    newVersion: number,
    preloadedMigrations: Map<number, any>,
    dbName: string
  ): void {
    prodInfo('🚀 Начинаем выполнение миграций схемы IndexedDB:', {
      oldVersion,
      newVersion,
      existingStores: Array.from(db.objectStoreNames)
    });

    try {
      for (let version = oldVersion; version < newVersion; version++) {
        const targetVersion = version + 1;
        
        prodInfo(`📋 Выполняем миграцию схемы с версии ${version} до ${targetVersion}`);
        
        const migrationModule = preloadedMigrations.get(version);
        
        if (!migrationModule) {
          throw new Error(`Предварительно загруженная миграция для версии ${version} не найдена`);
        }

        // Засекаем время выполнения схемы
        const schemaStart = Date.now();
        migrationModule.migrationScheme(db);
        const schemaDuration = Date.now() - schemaStart;
        
        prodInfo(`✅ Миграция схемы ${migrationModule.migrationInfo.fileName} выполнена за ${schemaDuration}мс`);
        
        // Сохраняем информацию о времени выполнения схемы (записывается позже в данных)
        migrationModule._schemaDuration = schemaDuration;
      }

      prodInfo('🏁 Все миграции схемы IndexedDB выполнены успешно. Финальные хранилища:', 
        Array.from(db.objectStoreNames));
      
    } catch (error) {
      prodError('❌ Критическая ошибка во время выполнения миграций схемы IndexedDB:', error);
      throw error;
    }
  }


  /**
   * Настройка обработчиков событий для соединения
   */
  private static setupConnectionHandlers(db: IDBDatabase): void {
    // Обработчик для принудительного закрытия извне
    db.onversionchange = function () {
      prodInfo('🔄 Принудительное закрытие соединения IndexDB (version change)');
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      isClosing = true;
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
      activeRequestsCount = 0;
      cachedConnection = null;
      connectionPromise = null;
      isClosing = false;
    };
  }

  /**
   * Увеличение счетчика активных запросов
   */
  static incrementActiveRequests(): void {
    activeRequestsCount++;
    if (isDebugMode) {
      debugLog(`📈 Увеличен счетчик активных запросов: ${activeRequestsCount}`);
    }
    
    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
      if (isDebugMode) {
        debugLog('⏰ Таймер закрытия сброшен из-за нового активного запроса');
      }
    }
  }

  /**
   * Уменьшение счетчика активных запросов
   */
  static decrementActiveRequests(): void {
    activeRequestsCount = Math.max(0, activeRequestsCount - 1);
    if (isDebugMode) {
      debugLog(`📉 Уменьшен счетчик активных запросов: ${activeRequestsCount}`);
    }
    
    if (activeRequestsCount === 0) {
      ConnectionManager.startCloseTimer();
    }
  }

  /**
   * Запуск таймера закрытия соединения
   */
  private static startCloseTimer(): void {
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

  /**
   * Принудительное закрытие соединения (для тестирования/отладки)
   */
  static forceCloseConnection(): void {
    if (cachedConnection) {
      prodInfo('🔒 Принудительное закрытие соединения IndexDB');
      if (closeTimer) {
        clearTimeout(closeTimer);
        closeTimer = null;
      }
      isClosing = true;
      activeRequestsCount = 0;
      cachedConnection.close();
      cachedConnection = null;
      connectionPromise = null;
      isClosing = false;
    }
  }

  /**
   * Получение информации о состоянии соединения
   */
  static getConnectionInfo() {
    return {
      hasConnection: !!cachedConnection,
      isClosing,
      activeRequestsCount,
      hasCloseTimer: !!closeTimer,
      connectionPromiseActive: !!connectionPromise
    };
  }
}
