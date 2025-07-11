//import { AES } from "../../../core/crypt";
import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { HttpServerParam } from "./types";
import type { Account } from "./get_accounts";

export function login(pass: string): Promise<Account[]> {
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");

        const targetId = 5; // Искомый id
        let found = true;

        const request = store.openCursor();
        const result: Account[] = [];
        request.onsuccess = async function (event) {
          const cursor = event.target.result;
          if (cursor) {
            if (!found && cursor.value.id === targetId) {
              found = true; // Нашли нужный id
            }
            if (found) {
              try {
                const _item = await decrypt_curve25519_from_pass({
                  pass,
                  cipherText: cursor.value.data,
                });
                const decrData = !_item ? null : JSON.parse(_item);

                if (decrData) result.push(decrData);
              } catch (err) {}
            }
            cursor.continue(); // Продолжаем обход
          } else {
            mRes(result);
            res();
          }
        };
      });
    });
  });
}
