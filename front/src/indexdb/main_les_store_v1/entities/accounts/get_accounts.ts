//import { AES } from "../../../crypt";
import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { HttpServerParam } from "./types";

export type Account = {
  namePub: string;
  pass: string;
  id: string;
  httpServers: HttpServerParam[];
  date_created: Date;
  date_updated?: Date;
  _pass: string;
  _libp2p_keyPair: string;
  friendsByIds?: string[]; // Массив ID друзей для данного аккаунта
  version: number; // Версия entity для отслеживания изменений структуры
};

export function get_accounts(): Promise<Account[]> {
  // Оптимизированный возврат аккаунтов из оперативной памяти
  return Promise.resolve(Object.values(back_store.accounts_by_id));

  // Старый код как пример брудфорса через IndexDB - больше не нужен,
  // так как можно оптимизировать и возвращать аккаунты из оперативки
  /*
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");

        const targetId = 5; // Искомый id
        let found = true;

        const request = store.openCursor();
        const result: Account[] = []
        request.onsuccess = async function (event) {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
           //if (!found && cursor.value.id === targetId) {
           //  found = true; // Нашли нужный id
           //}
            if (found) {
              try {

                const passwords = new Set<string>();
                for(let ac of Object.values(back_store.accounts_by_id)) {
                  passwords.add(ac.pass);
                }
                for (let pass of passwords) {
                  const _item = await decrypt_curve25519_from_pass({
                      pass,
                      cipherText: cursor.value.data,
                  });
                  const decrData = !_item
                    ? null
                    : JSON.parse(_item);
                  if (decrData)
                    result.push(decrData);
                }

              }
              catch(err) {}
              //console.log("Обработка записи:", cursor.value);
            }
            cursor.continue(); // Продолжаем обход
          } else {
            mRes(result);
            //console.log("Обработка завершена.");
            res();
          }
        };

      });
    })

  });
  */
}
