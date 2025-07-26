import { decrypt_curve25519_from_pass, encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { devLog, prodError, prodInfo } from "../../../../core/debug/logger";
import { indexdb_wrapper } from "../../indexdb_wrapper";

export const source_entity_service = {
  add_entities: add_encrypt_entities,
  put_entities: put_encrypt_entities,
  delete_entities,
  get_all_entities,
  get_by_id_entity,
  get_by_ids_entity,
  get_by_ids_entity_with_decrypt,
}

export type SaveEntityItem = Entity & {
  pass: string;
}

type Entity = {
  id: string;
  data: string;
}

function add_encrypt_entities({
  table_name,
  new_list,
}: {
  table_name: string;
  new_list: SaveEntityItem[];
}) {

  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {

      const transaction = db.transaction([table_name], "readwrite");
      const store = transaction.objectStore(table_name);
      //const resultList = [];
      // Добавляем запись
      for (let item of new_list) {
        //const newId = workerGeneratorIds();

        //resultList.push(resultItem);

        const newData = await encrypt_curve25519_from_pass({
          pass: item.pass,
          message: JSON.stringify(item.data),
        });
        store.add({ id: item.id, data: newData });
      }

      transaction.oncomplete = function () {
        devLog("Данные добавлены успешно");
        res();
      };

      transaction.onerror = function (event) {
        prodError("Ошибка при добавлении данных:", event);
        rej(new Error("Ошибка при добавлении данных в IndexedDB"));
      };
    });
  });
}

function put_encrypt_entities({
  table_name,
  new_list,
}: {
  table_name: string;
  new_list: SaveEntityItem[];
}) {

  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {

      const transaction = db.transaction([table_name], "readwrite");
      const store = transaction.objectStore(table_name);
      //const resultList = [];
      // Добавляем запись
      for (let item of new_list) {
        //const newId = workerGeneratorIds();

        //resultList.push(resultItem);

        const newData = await encrypt_curve25519_from_pass({
          pass: item.pass,
          message: JSON.stringify(item.data),
        });
        store.put({ id: item.id, data: newData });
      }

      transaction.oncomplete = function () {
        devLog("Данные изменены успешно");
        res();
      };

      transaction.onerror = function (event) {
        prodError("Ошибка при изменение данных:", event);
        rej(new Error("Ошибка при изменении данных в IndexedDB"));
      };
    });
  });
}


export function delete_entities<T = string[]>({
  table_name,
  ids,
}: {
  table_name: string;
  ids: T[];
  /**
   * Для шифрования к акаунту
   */
  //explicitMyAccId: string;
}) {
  return indexdb_wrapper((db) => {
    return new Promise((res, rej) => {
      try {
        const transaction = db.transaction([table_name], "readwrite");
        const store = transaction.objectStore(table_name);

        let completedOperations = 0;
        const totalOperations = ids.length;

        if (totalOperations === 0) {
          res();
          return;
        }

        for (const id of ids) {
          const request = store.delete(id);

          request.onsuccess = function () {

            completedOperations++;
            if (completedOperations === totalOperations) {
              prodInfo('✅ entity удалены успешно');
              res();
            }
          };

          request.onerror = function (event) {
            prodError('❌ Ошибка удаления друга из IndexedDB:', event);
            rej(event);
          };
        }
      } catch (error) {
        prodError('❌ Критическая ошибка в delete_friend:', error);
        rej(error);
      }
    });
  }) as Promise<void>;
}


function get_all_entities({
  table_name,
  on,
}: {
  table_name: string;
  onFinish: () => void;
  on: (p: {
    entity: Entity;
    onNext: () => void;
    abort: () => void;
  }) => void;
  }) {
  return indexdb_wrapper((db) => {
    return new Promise((res, rej) => {
      try {
        // Начинаем транзакцию и открываем объект хранилища
        const transaction = db.transaction([table_name], 'readonly');
        const objectStore = transaction.objectStore(table_name);

        // Создаем запрос на открытие курсора
        const cursorRequest = objectStore.openCursor();

        cursorRequest.onerror = function (event) {
          console.error(
            'Ошибка при открытии курсора:',
            event.target.error
          );
          rej();
        };

        cursorRequest.onsuccess = function (event) {
          const cursor = event.target.result;
          if (cursor) {
            // Обрабатываем текущую запись
            //console.log('Ключ:', cursor.key, 'Значение:', cursor.value);
            on({
              entity: cursor.value,
              onNext: () => cursor.continue(),
              abort: () => {
                transaction.abort();
                rej('abort');
              },
            });

            // Переходим к следующей записи
            //cursor.continue();
          } else {
            console.log('Все записи обработаны.');
            res();
          }
        };

      } catch (error) {
        prodError('❌ Критическая ошибка в delete_friend:', error);
        rej(error);
      }
    });
  }) as Promise<void>;
}

function get_by_id_entity({
  table_name,
  id,
}: {
  table_name: string;
  id: string;
}) {
  return indexdb_wrapper((db) => {
    return new Promise((res, rej) => {
      try {
        // Начинаем транзакцию и открываем объект хранилища
        const transaction = db.transaction([table_name], 'readonly');
        const objectStore = transaction.objectStore(table_name);

        // Предположим, что у нас есть ID записи, которую мы хотим получить

        // Создаем запрос на получение записи по ID
        const getRequest = objectStore.get(id);

        getRequest.onerror = function (event) {
          prodError('Ошибка при получении записи:', event.target.error);
          rej(event.target.error);
        };

        getRequest.onsuccess = function (event) {
          const record = event.target.result;
          if (record) {
            res(record.data);
          } else {
            //console.log('Запись с ID', id, 'не найдена.');
            rej('Запись с ID' + id + 'не найдена.');
          }
        };
      } catch (error) {
        prodError('❌ Критическая ошибка в getById: '+table_name, error);
        rej(error);
      }
    });
  }) as Promise<void>;
}

async function get_by_ids_entity({
  table_name,
  ids,
}: {
  table_name: string;
  ids: string[];
}) {

  const promises = ids.map(id => {
    return new Promise(async (res, rej) => {
      try {
      res([
        id,
        await get_by_id_entity({
          table_name,
          id,
        })
      ])
      }
      catch (err) {
        rej(err);
      }
    });
  });

  return Promise.all(promises).then(entries_by_ids => {
    return Object.fromEntries(entries_by_ids);
  });
}

async function get_by_ids_entity_with_decrypt<T = any>({
  table_name,
  ids,
  pass,
}: {
  table_name: string;
  ids: string[];
  pass: string;
}): Promise<Record<string, T>> {

  const entityById = await get_by_ids_entity({
    table_name,
    ids
  });

  const result: Record<string, T> = {}

  for (const [key, value] of Object.entries(entityById)) {
    result[key] = await decrypt_curve25519_from_pass({
      pass,
      cipherText: value,
    });
  };

  return result;
}