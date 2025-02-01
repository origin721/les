//import { AES } from "../../../crypt";
import { encrypt_curve25519_from_pass } from "../../../crypt";
import { back_store } from "../../../local_back/back_store";
import { uuidv4 } from "../../uuid";
import { indexdb_wrapper } from "../indexdb_wrapper";
import type { HttpServerParam } from "./add_accounts";


export type AccountEntityPut = {
  id: string;
  namePub: string;
  pass: string;
  httpServers: HttpServerParam[];
  date_updated?: Date;
}

export function put_accounts(new_list: AccountEntityPut[]) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      // Добавляем запись
      for (let item of new_list) {
        // TODO: нужно шифровать
        const newData = await encrypt_curve25519_from_pass({
          pass: back_store.accounts_by_id[item.id].pass,
          message: JSON.stringify({
            ...item,
            date_updated: new Date(),
            pass: back_store.accounts_by_id[item.id].pass,
          }),
        });
        store.put({ id: item.id, data: newData });
      }

      transaction.oncomplete = function () {
        //console.log("Данные добавлены успешно");
        res();
      };

      transaction.onerror = function (event) {
        //console.error("Ошибка при добавлении данных:", event.target.errorCode);
        rej();
      };
    });
  })
}