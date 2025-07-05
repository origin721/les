import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { FriendEntityFull } from "./add_friend";

export function get_friends(): Promise<FriendEntityFull[]> {
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["friends"], "readonly");
        const store = transaction.objectStore("friends");

        const request = store.openCursor();
        const result: FriendEntityFull[] = []
        
        request.onsuccess = async function (event) {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
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
                if (decrData) {
                  result.push(decrData);
                  break; // Found valid decryption, move to next
                }
              }
            }
            catch(err) {}
            cursor.continue();
          } else {
            mRes(result);
            res();
          }
        };

        request.onerror = function(event) {
          rej(event);
        };
      });
    })
  });
}
