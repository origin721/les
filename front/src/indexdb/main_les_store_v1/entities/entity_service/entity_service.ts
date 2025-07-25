import { decrypt_curve25519_from_pass, encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { prodError, prodInfo } from "../../../../core/debug/logger";
import { recommendedGenerateKeyPair } from "../../../../libs/libp2p";
import { back_store } from "../../../../local_back/back_store";
import { workerGeneratorIds } from "../../../../processes/shared_worker/workerGeneratorIds";
import { indexdb_wrapper } from "../../indexdb_wrapper";

export const entity_service = {
  addEntities: add_entities,
  delete_entities,
  get_entity_by_id,
}

export function get_entity_by_id<FULL_T = any>(
  {
    table_name,
    id,
    explicitMyAccId,
  }: {
    table_name: string;
    id: string;
    /**
     * Для шифрования к акаунту
     */
    explicitMyAccId: string;
  },
): Promise<FULL_T | null> {
  return indexdb_wrapper((db) => {
    return new Promise<FULL_T | null>((res, rej) => {
      const transaction = db.transaction([table_name], "readonly");
      const store = transaction.objectStore(table_name);

      const request = store.get(id);

      request.onsuccess = async function (event) {
        const data = (event.target as IDBRequest).result;
        if (!data) {
          res(null);
          return;
        }

        try {
          const passwords = new Set<string>();
          for (let ac of Object.values(back_store.accounts_by_id)) {
            passwords.add(ac.pass);
          }

          for (let pass of passwords) {
            const _item = await decrypt_curve25519_from_pass({
              pass,
              cipherText: data.data,
            });
            const decrData = !_item ? null : JSON.parse(_item);
            if (decrData) {
              res(decrData);
              return;
            }
          }
          // If no password worked
          res(null);
        } catch (err) {
          res(null);
        }
      };

      request.onerror = function (event) {
        rej(event);
      };
    });
  });
}

function add_entities<T = any, FULL_T = any>({
  table_name,
  new_list,
  explicitMyAccId,
  entityVersion,
}: {
  table_name: string;
  new_list: T[];
  /**
   * Для шифрования к акаунту
   */
  explicitMyAccId: string;
  entityVersion: number;
}): Promise<FULL_T[]> {

  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      if (!back_store.accounts_by_id[explicitMyAccId]) {
        rej('Не найден explicitMyAccId для сущности таблице ' + table_name);
        return;
      };

      const myAcc = back_store.accounts_by_id[explicitMyAccId];

      const transaction = db.transaction([table_name], "readwrite");
      const store = transaction.objectStore(table_name);
      const resultList = [];
      // Добавляем запись
      for (let item of new_list) {
        const newId = workerGeneratorIds();

        const resultItem = {
          ...item,
          id: newId,
          date_created: new Date(),
          version: entityVersion, // Версия внутри зашифрованных данных
        }

        resultList.push(resultItem);

        const newData = await encrypt_curve25519_from_pass({
          pass: myAcc.pass,
          message: JSON.stringify(resultItem),
        });
        store.add({ id: newId, data: newData });
      }

      transaction.oncomplete = function () {
        prodInfo("Данные добавлены успешно");
        res(resultList);
      };

      transaction.onerror = function (event) {
        prodError("Ошибка при добавлении данных:", event);
        rej(new Error("Ошибка при добавлении данных в IndexedDB"));
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