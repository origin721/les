import { indexdb_wrapper } from "../../indexdb_wrapper";
import { prodInfo, devDB } from "../../../../core/debug/logger";
import { back_store } from "../../../../local_back/back_store";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";


export function delete_accounts(ids: string[]) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      // Добавляем запись

      const listPromise: Promise<void>[] = [];

      ids.forEach((key) => {
        const deleteRequest = store.delete(key);

        listPromise.push(new Promise((i_res,i_rej) => {
          deleteRequest.onsuccess = () => {
            //console.log(`Запись с id=${key} успешно удалена.`);
            accounts_store_utils.delete([key]);
            i_res();
          }
          deleteRequest.onerror = (event) => {
            //console.error(`Ошибка удаления записи с id=${key}:`, event.target.errorCode);
            i_rej();
          }
        }));
      });

      Promise.allSettled(listPromise).then(() => res());

      transaction.oncomplete = function() {
        devDB("✅ Все выбранные аккаунты удалены из IndexDB");
        prodInfo("✅ Аккаунты удалены успешно");
      };

     //transaction.oncomplete = function () {
     //  console.log("Данные добавлены успешно");
     //  res();
     //};

     //transaction.onerror = function (event) {
     //  console.error("Ошибка при добавлении данных:", event.target.errorCode);
     //  rej();
     //};
    });
  })
}
