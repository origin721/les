import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../../core/debug/logger';
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
                  
                  // Встроенная миграция для версии 0: создание базовых stores
                  if (realOldVersion === 0) {
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
                  
                  // Встроенная миграция для версии 1: добавление индексов (если нужно)
                  if (realOldVersion <= 1 && newVersion > 1) {
                    prodInfo('📦 Экстренная миграция схемы 1: Добавление индексов');
                    // Логика для добавления индексов, если необходимо
                    prodInfo('✅ Экстренная миграция схемы 1 завершена');
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

          openRequest.onerror = function () {
            prodError("IndexDB openRequest error:", openRequest.error);
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
