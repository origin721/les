import { uuidv4 } from "../../uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";

type AccountEntity = {
  name: string;
}

export function add_accounts(new_list: AccountEntity[]) {
  return indexdb_wrapper((db) => {
    return new Promise((res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");

      // Добавляем запись
      for (let item of new_list) {
        store.add({ id: uuidv4(), data: JSON.stringify(item) });
      }

      transaction.oncomplete = function () {
        console.log("Данные добавлены успешно");
        res();
      };

      transaction.onerror = function (event) {
        console.error("Ошибка при добавлении данных:", event.target.errorCode);
        rej();
      };
    });
  })
}