import { jsonParse } from "../../../../core";
import { decrypt_curve25519_from_pass, encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { devLog, prodError, prodInfo } from "../../../../core/debug/logger";
import { recommendedGenerateKeyPair } from "../../../../libs/libp2p";
import { back_store } from "../../../../local_back/back_store";
import { workerGeneratorIds } from "../../../../processes/shared_worker/workerGeneratorIds";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { db_id_generator } from "../../utils/db_id_generator";
import { source_entity_service, type SaveEntityItem } from "./source_entity_service";
import type { CommonEntity } from "./types/CommonEntity";

export const entity_service = {
  addEntities: add_entities,
  delete_entities: source_entity_service.delete_entities,
  get_entity_by_id,
  put_entities,
  decrypt_by_explicitMyAccId,
  decrypt_by_pass,
}


async function decrypt_by_explicitMyAccId({
  cipherText,
  explicitMyAccId,
}:{
  cipherText: string,
  explicitMyAccId: string,
}) {
  const acc = back_store.accounts_by_id[explicitMyAccId];
  if(!acc) return null;

    return jsonParse(
    await decrypt_curve25519_from_pass({
      pass: acc._pass,
      cipherText: cipherText,
    })
  );
}

async function decrypt_by_pass({
  cipherText,
  pass,
}:{
  cipherText: string,
  pass: string,
}) {

  return jsonParse(
    await decrypt_curve25519_from_pass({
      pass: pass,
      cipherText: cipherText,
    })
  );
}

export function put_entities<
T extends CommonEntity = CommonEntity
>(
  {
    table_name,
    new_list,
    entityVersion,
  }: {
    table_name: string;
    new_list: T[];
    entityVersion: number;
  }): Promise<T[]> {
  return new Promise(async (res, rej) => {
    const resultList = [];
    const saveItem: SaveEntityItem[] = [];


    for (let item of new_list) {
      if (!back_store.accounts_by_id[item.explicitMyAccId]) {
        rej('Не найден explicitMyAccId для сущности таблице ' + table_name);
        return;
      };

      //const newId = workerGeneratorIds();

      const myAcc = back_store.accounts_by_id[item.explicitMyAccId];


      const resultItem: T = {
        ...item,
        date_updated: new Date(),
        version: entityVersion, // Версия внутри зашифрованных данных
      }

      resultList.push(resultItem);
      saveItem.push({
        pass: myAcc._pass,
        id: resultItem.id,
        data: JSON.stringify(resultItem),
      });

    }


    await source_entity_service.put_entities({
      table_name,
      new_list: saveItem,
    });

    res(resultList);
  });
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
            passwords.add(ac._pass);
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

function add_entities<
  T = any,
  FULL_T extends CommonEntity = CommonEntity
>({
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
  return new Promise(async (res, rej) => {
    if (!back_store.accounts_by_id[explicitMyAccId]) {
      rej('Не найден explicitMyAccId для сущности таблице ' + table_name);
      return;
    };

    const myAcc = back_store.accounts_by_id[explicitMyAccId];
    const resultList = [];
    const saveItem: SaveEntityItem[] = [];

    for (let item of new_list) {
      const newId = db_id_generator();

      const resultItem: FULL_T = {
        ...item,
        id: newId,
        date_created: new Date(),
        version: entityVersion, // Версия внутри зашифрованных данных
        explicitMyAccId,
      }

      resultList.push(resultItem);
      saveItem.push({
        pass: myAcc._pass,
        id: newId,
        data: JSON.stringify(resultItem),
      });

    }

    await source_entity_service.add_encrypt_entities({
      table_name,
      new_list: saveItem,
    });

    res(resultList);
  });



 //return indexdb_wrapper((db) => {
 //  return new Promise(async (res, rej) => {
 //    if (!back_store.accounts_by_id[explicitMyAccId]) {
 //      rej('Не найден explicitMyAccId для сущности таблице ' + table_name);
 //      return;
 //    };

 //    const myAcc = back_store.accounts_by_id[explicitMyAccId];

 //    const transaction = db.transaction([table_name], "readwrite");
 //    const store = transaction.objectStore(table_name);
 //    const resultList = [];
 //    // Добавляем запись
 //    for (let item of new_list) {
 //      const newId = workerGeneratorIds();

 //      const resultItem = {
 //        ...item,
 //        id: newId,
 //        date_created: new Date(),
 //        version: entityVersion, // Версия внутри зашифрованных данных
 //        explicitMyAccId,
 //      }

 //      resultList.push(resultItem);

 //      const newData = await encrypt_curve25519_from_pass({
 //        pass: myAcc.pass,
 //        message: JSON.stringify(resultItem),
 //      });
 //      store.add({ id: newId, data: newData });
 //    }

 //    transaction.oncomplete = function () {
 //      prodInfo("Данные добавлены успешно");
 //      res(resultList);
 //    };

 //    transaction.onerror = function (event) {
 //      prodError("Ошибка при добавлении данных:", event);
 //      rej(new Error("Ошибка при добавлении данных в IndexedDB"));
 //    };
 //  });
 //});
}
