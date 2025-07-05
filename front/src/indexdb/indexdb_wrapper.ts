import { indexdb_order } from "./indexdb_order";
import { debugLog, prodError, prodInfo, devDB } from '../core/debug/logger';
import { autoRunDataMigrations } from './migrations/data_migrations';
import { runSchemaMigrations } from './migrations/schema_migrations';
import { KEYS } from '../core/local-storage/constants';

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

      let openRequest = indexedDB.open("main_les_store_v1", 1);

      openRequest.onupgradeneeded = async function (event) {
        const db = openRequest.result;
        const oldVersion = event.oldVersion ?? 0;
        const newVersion = event.newVersion ?? 1;
        
        prodInfo('🔄 IndexDB onupgradeneeded:', {
          oldVersion,
          newVersion,
          existingStores: Array.from(db.objectStoreNames)
        });
        
        // Выполняем миграции схемы с асинхронной загрузкой модулей
        try {
          await runSchemaMigrations(db, oldVersion, newVersion);
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

        // Проверяем синхронизацию версий
        const schemaVersion = parseInt(localStorage.getItem(KEYS.SCHEMA_VERSION) || '0', 10);
        const currentDBVersion = db.version;
        
        prodInfo('🔍 Проверка синхронизации версий:', {
          schemaVersionInStorage: schemaVersion,
          currentDBVersion: currentDBVersion,
          isSync: schemaVersion === currentDBVersion
        });

        // Сначала выполняем миграции данных, затем вызываем onChange
        autoRunDataMigrations()
          .then(() => {
            prodInfo('✅ Миграции данных выполнены, БД готова к использованию');
            
            // Финальная проверка синхронизации
            const dataVersion = parseInt(localStorage.getItem(KEYS.DATA_MIGRATION_VERSION) || '0', 10);
            prodInfo('📊 Финальное состояние версий:', {
              schemaVersion: currentDBVersion,
              dataVersion: dataVersion,
              allInSync: currentDBVersion === dataVersion
            });
            
            return onChange(db);
          })
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
