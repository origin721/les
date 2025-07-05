import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../../core/debug/logger';
import { 
  getCurrentDbVersion, 
  preloadMigrations, 
  runSchemaMigrations, 
  runDataMigrations,
  getMaxVersion
} from './migrations/migrations';
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
        const dbName = DB_NAMES.MAIN_LES_STORE_V1;

        resultPromise.finally(onFinishOrder);

        try {
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
                  prodInfo('🚨 Экстренное выполнение встроенных миграций схемы');
                  
                  // Выполняем все миграции от 0 до нужной версии
                  for (let migrationVersion = 0; migrationVersion < newVersion; migrationVersion++) {
                    
                    // Миграция 0: создание базовых stores
                    if (migrationVersion === 0 && realOldVersion <= 0) {
                      prodInfo('📦 Экстренная миграция схемы 0: Создание базовых хранилищ');
                      
                      if (!db.objectStoreNames.contains('accounts')) {
                        db.createObjectStore('accounts', { keyPath: 'id' });
                        prodInfo('✅ Хранилище accounts создано');
                      }
                      
                      if (!db.objectStoreNames.contains('friends')) {
                        db.createObjectStore('friends', { keyPath: 'id' });
                        prodInfo('✅ Хранилище friends создано');
                      }
                      
                      if (!db.objectStoreNames.contains('rooms')) {
                        db.createObjectStore('rooms', { keyPath: 'id' });
                        prodInfo('✅ Хранилище rooms создано');
                      }
                      
                      prodInfo('✅ Экстренная миграция схемы 0 завершена');
                    }
                    
                    // Миграция 1: добавление индексов
                    if (migrationVersion === 1 && realOldVersion <= 1) {
                      prodInfo('📦 Экстренная миграция схемы 1: Добавление индексов');
                      // Логика для добавления индексов, если необходимо
                      prodInfo('✅ Экстренная миграция схемы 1 завершена');
                    }
                  }
                  
                  // Дополнительная проверка: создаем базовые хранилища, если они отсутствуют
                  prodInfo('🔍 Дополнительная проверка наличия критических хранилищ...');
                  if (!db.objectStoreNames.contains('accounts')) {
                    db.createObjectStore('accounts', { keyPath: 'id' });
                    prodInfo('✅ Дополнительно создано хранилище accounts');
                  }
                  
                  if (!db.objectStoreNames.contains('friends')) {
                    db.createObjectStore('friends', { keyPath: 'id' });
                    prodInfo('✅ Дополнительно создано хранилище friends');
                  }
                  
                  if (!db.objectStoreNames.contains('rooms')) {
                    db.createObjectStore('rooms', { keyPath: 'id' });
                    prodInfo('✅ Дополнительно создано хранилище rooms');
                  }
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
            rej(openRequest.error);
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
                    indexdb_wrapper(onChange).then(res).catch(rej);
                  }, 100);
                };
                
                deleteRequest.onerror = () => {
                  prodError('❌ Ошибка удаления поврежденной базы:', deleteRequest.error);
                  rej(deleteRequest.error);
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
              
              // 7. Вызываем пользовательский callback
              await onChange(db);
              
              // 8. Закрываем соединение и завершаем
              db.close();
              res(undefined);
              
            } catch (error) {
              prodError('Ошибка при выполнении миграций данных или onChange:', error);
              const errorMessage = error instanceof Error ? error.message : String(error);
              await setUpdateStatus(dbName, DB_UPDATE_STATUS.UPDATE_FAILED, undefined, undefined, errorMessage);
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
