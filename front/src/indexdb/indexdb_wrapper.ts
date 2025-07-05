import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../core/debug/logger';
import { 
  getCurrentDbVersion, 
  preloadMigrations, 
  runSchemaMigrations, 
  runDataMigrations,
  getMaxVersion
} from './migrations/migrations';

const counterInfo = {
  open: 0,
  close: 0,
  success: 0,
  error: 0,
}

const isDebugMode = false;

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
        const dbName = "main_les_store_v1";

        resultPromise.finally(onFinishOrder);

        try {
          // 1. Получаем текущую версию базы данных
          const currentVersion = await getCurrentDbVersion(dbName);
          const targetVersion = getMaxVersion();
          
          prodInfo('📊 Информация о версиях БД:', {
            currentVersion,
            targetVersion,
            needsMigration: currentVersion < targetVersion
          });

          // Переменная для хранения предварительно загруженных миграций
          let preloadedMigrations = new Map();

          // 2. Если нужны миграции, предварительно загружаем модули
          if (currentVersion < targetVersion) {
            prodInfo('🔄 Предварительная загрузка модулей миграций...');
            preloadedMigrations = await preloadMigrations(currentVersion, targetVersion);
          }

          // 3. Открываем базу данных с целевой версией
          let openRequest = indexedDB.open(dbName, targetVersion);

          openRequest.onupgradeneeded = function (event) {
            const db = openRequest.result;
            const oldVersion = event.oldVersion ?? 0;
            const newVersion = event.newVersion ?? targetVersion;
            
            prodInfo('🔄 IndexDB onupgradeneeded:', {
              oldVersion,
              newVersion,
              existingStores: Array.from(db.objectStoreNames)
            });
            
            // 4. Выполняем миграции схемы синхронно с предварительно загруженными модулями
            if (oldVersion < newVersion && preloadedMigrations.size > 0) {
              try {
                runSchemaMigrations(db, oldVersion, newVersion, preloadedMigrations);
              } catch (error) {
                prodError('Критическая ошибка во время миграции схемы IndexedDB:', error);
                throw error;
              }
            }
          };

          openRequest.onerror = function () {
            prodError("IndexDB openRequest error:", openRequest.error);
            rej(openRequest.error);
          };

          openRequest.onsuccess = async function () {
            let db = openRequest.result;

            prodInfo('✅ IndexDB соединение установлено, версия БД:', db.version);

            try {
              // 5. Выполняем миграции данных асинхронно с предварительно загруженными модулями
              if (currentVersion < targetVersion && preloadedMigrations.size > 0) {
                await runDataMigrations(db, currentVersion, targetVersion, preloadedMigrations);
              }

              prodInfo('✅ Все миграции выполнены, БД готова к использованию');
              
              // 6. Вызываем пользовательский callback
              await onChange(db);
              
              // 7. Закрываем соединение и завершаем
              db.close();
              res(undefined);
              
            } catch (error) {
              prodError('Ошибка при выполнении миграций данных или onChange:', error);
              db.close();
              rej(error);
            }

            db.onversionchange = function () {
              db.close();
            };
          };

          openRequest.onblocked = function () {
            debugLog('Database connection blocked');
            rej(new Error('Database connection blocked'));
          };
          
        } catch (error) {
          prodError('Ошибка при инициализации IndexDB:', error);
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
