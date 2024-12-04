import { AES } from "../../../crypt";
import { uuidv4 } from "../../uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";

export type AccountEntity = {
  login: string;
  pass: string;
}

export function add_accounts(new_list: AccountEntity[]) {
  return indexdb_wrapper((db) => {
    return new Promise((res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      // Добавляем запись
      for (let item of new_list) {
        const newId = uuidv4();
        const newData = AES.encrypt(JSON.stringify({
          ...item,
          id: newId,
          date_created: new Date(),
        }), item.pass);
        store.add({ id: newId, data: newData });
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