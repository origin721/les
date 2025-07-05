import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../core/debug/logger';
import { autoRunDataMigrations } from './migrations/data_migrations';
import { runSchemaMigrations } from './migrations/schema_migrations';

const counterInfo = {
  open: 0,
  close: 0,
  success: 0,
  error: 0,
}

const isDebugMode = false;

export function indexdb_wrapper(
  onChange: (db: IDBDatabase) => Promise<void>,
) {
  if(isDebugMode) {
    ++counterInfo.open;
    debugLog({counterInfo});
  }

  const resultPromise = new Promise((_res, _rej) => {
    const res = (_data: any) => {
      // TODO: Добавить флаг что бы только при дебаг режиме было это
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
    indexdb_order((onFinishOrder) => {
      const dbName = "main_les_store_v1";

      resultPromise.finally(onFinishOrder);

      const targetVersion = 1; // Устанавливаем фиксированную целевую версию
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
        
        // Выполняем миграции схемы синхронно (IndexedDB требует синхронного выполнения)
        if (oldVersion < newVersion) {
          try {
            // Используем простой подход для базовой инициализации
            if (oldVersion === 0 && newVersion >= 1) {
              prodInfo('📦 Создаем новую базу данных с базовыми хранилищами');

              if (!db.objectStoreNames.contains('accounts')) {
                db.createObjectStore('accounts', { keyPath: 'id' });
                devDB('✅ Хранилище accounts создано');
              }

              if (!db.objectStoreNames.contains('friends')) {
                db.createObjectStore('friends', { keyPath: 'id' });
                devDB('✅ Хранилище friends создано');
              }

              if (!db.objectStoreNames.contains('rooms')) {
                db.createObjectStore('rooms', { keyPath: 'id' });
                devDB('✅ Хранилище rooms создано');
              }
            }

            prodInfo('🏁 IndexDB миграция завершена. Финальные хранилища:', Array.from(db.objectStoreNames));
          } catch (error) {
            prodError('Критическая ошибка во время миграции IndexedDB:', error);
            throw error;
          }
        }
      };

      openRequest.onerror = function () {
        prodError("IndexDB openRequest error:", openRequest.error);
        rej(openRequest.error);
      };

      openRequest.onsuccess = function () {
        let db = openRequest.result;

        prodInfo('✅ IndexDB соединение установлено, версия БД:', db.version);

        // Выполняем миграции данных, затем вызываем onChange
        const finalVersion = db.version;
        autoRunDataMigrations({ db, oldVersion: 0, newVersion: finalVersion })
          .then(() => {
            prodInfo('✅ Миграции данных выполнены, БД готова к использованию');
            return onChange(db);
          })
          .then(() => {
            db.close();
            res(undefined);
          })
          .catch(rej);

        db.onversionchange = function () {
          db.close();
        };
      };

      openRequest.onblocked = function () {
        debugLog('Database connection blocked');
        rej(new Error('Database connection blocked'));
      };
    });
  });

  return resultPromise;
}
