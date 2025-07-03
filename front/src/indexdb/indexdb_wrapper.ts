import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../core/debug/logger';

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
    indexdb_order(onFinishOrder => {

      resultPromise.finally(onFinishOrder);

      let openRequest = indexedDB.open("store_v3", 1);

      openRequest.onupgradeneeded = function (event) {
        const db = openRequest.result;
        const oldVersion = event.oldVersion ?? 0;
        const newVersion = event.newVersion ?? 1;
        
        prodInfo('🔄 IndexDB onupgradeneeded:', {
          oldVersion,
          newVersion,
          existingStores: Array.from(db.objectStoreNames)
        });
        
        // IndexedDB миграции должны выполняться синхронно
        // Пока используем старый подход, но с возможностью расширения
        try {
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
          
          // Здесь можно добавить дополнительные миграции
          // if (oldVersion === 1 && newVersion >= 2) { ... }
          
          prodInfo('🏁 IndexDB миграция завершена. Финальные хранилища:', Array.from(db.objectStoreNames));
        } catch (error) {
          prodError('Критическая ошибка во время миграции IndexedDB:', error);
          throw error;
        }
      };

      openRequest.onerror = function () {
        prodError("IndexDB openRequest error:", openRequest.error);
        rej(openRequest.error);
      };

      openRequest.onsuccess = function () {
        let db = openRequest.result;

        onChange(db)
          .then(() => {
            db.close();
            res(undefined);
          })
          .catch(rej);


        db.onversionchange = function () {
          db.close();
          //console.log("База данных устарела, пожалуйста, перезагрузите страницу.");
          //rej();
        };

        // продолжить работу с базой данных, используя объект db
      };

      openRequest.onblocked = function () {
        // это событие не должно срабатывать, если мы правильно обрабатываем onversionchange

        // это означает, что есть ещё одно открытое соединение с той же базой данных
        // и он не был закрыт после того, как для него сработал db.onversionchange
        debugLog('Событие не должно было сработать');
        rej(new Error('Database connection blocked'));
      };

    });
  });

  return resultPromise;
}
