import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { prodError, prodInfo } from "../../../../core/debug/logger";
import { recommendedGenerateKeyPair } from "../../../../libs/libp2p";
import { back_store } from "../../../../local_back/back_store";
import { workerGeneratorIds } from "../../../../processes/shared_worker/workerGeneratorIds";
import { indexdb_wrapper } from "../../indexdb_wrapper";

export const entity_service = {
  addEntities: <T = any, FULL_T = any>({
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
  }): Promise<FULL_T[]> => {

    return indexdb_wrapper((db) => {
      return new Promise(async (res, rej) => {
        if(!back_store.accounts_by_id[explicitMyAccId]) {
          rej('Не найден explicitMyAccId для сущности таблице ' +table_name);
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
          res(resultItem);
        };

        transaction.onerror = function (event) {
          prodError("Ошибка при добавлении данных:", event);
          rej(new Error("Ошибка при добавлении данных в IndexedDB"));
        };
      });
    });
  }
}