//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { HttpServerParam, AccountEntityPut } from "./types";
import { ACCOUNTS_VERSION } from "./constants";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";

export function put_accounts(new_list: AccountEntityPut[]) {
  return indexdb_wrapper((db) => {
    return new Promise(async (res, rej) => {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const result = [];
      // Обновляем записи
      for (let item of new_list) {
        const existingAccount = back_store.accounts_by_id[item.id];
        if (!existingAccount) {
          throw new Error(`Account ${item.id} not found in back_store`);
        }

        // Объединяем существующие данные с новыми
        const updatedAccount = {
          ...existingAccount,
          ...item,
          date_updated: new Date(),
          // Сохраняем важные поля из оригинального аккаунта
          //_pass: existingAccount._pass,
          //_libp2p_keyPair: existingAccount._libp2p_keyPair,
          date_created: existingAccount.date_created,
          version: ACCOUNTS_VERSION, // Версия внутри зашифрованных данных
        };

        result.push(updatedAccount);

        const newData = await encrypt_curve25519_from_pass({
          pass: existingAccount.pass,
          message: JSON.stringify(updatedAccount),
        });

        store.put({ id: item.id, data: newData });
      }

      transaction.oncomplete = function () {
        //console.log("Данные добавлены успешно");
        accounts_store_utils.add(result);
        res(result);
      };

      transaction.onerror = function (event) {
        //console.error("Ошибка при добавлении данных:", event.target.errorCode);
        rej();
      };
    });
  });
}
