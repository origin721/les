import { indexdb_order } from "./indexdb_order";

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
    console.log({counterInfo});
  }

  const resultPromise = new Promise((_res, _rej) => {
    const res = (_data: any) => {
      // TODO: Добавить флаг что бы только при дебаг режиме было это
      _res(_data);
      
      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.success;
      console.log({counterInfo});
    }
    const rej = (_err: any) => {
      _rej(_err);

      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.error;
      console.log({counterInfo});
    }
    indexdb_order(onFinishOrder => {

      resultPromise.finally(onFinishOrder);

      let openRequest = indexedDB.open("store", 1);

      openRequest.onupgradeneeded = function (event) {
        // версия существующей базы данных меньше 2 (или база данных не существует)
        let db = openRequest.result;
        switch (event.oldVersion) { // существующая (старая) версия базы данных
          case 0:
            // версия 0 означает, что на клиенте нет базы данных
            // выполнить инициализацию
            if (!db.objectStoreNames.contains('accounts')) { // если хранилище "accounts" не существует
              const objectStore = db.createObjectStore('accounts', { keyPath: 'id' }); // создаём хранилище
              // Добавляем индекс для поля data
              //objectStore.createIndex("dataIndex", "data", { unique: false });
            }
            break;
          case 1:
            // на клиенте версия базы данных 1
            // обновить
            break;
        }

      };

      openRequest.onerror = function () {
        console.error("Error", openRequest.error);
        rej(openRequest.error);
      };

      openRequest.onsuccess = function () {
        let db = openRequest.result;

        onChange(db)
          .then(() => {
            db.close();
            res();
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
        console.log('Событие не должно было сработать');
        rej();
      };

    });
  });

  return resultPromise;
}