import { decrypt_curve25519_from_pass } from "../../core/crypt";
import { back_store } from "../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../indexdb_wrapper";
import type { FriendEntityFull } from "./add_friend";

export function get_friend_by_id(friendId: string): Promise<FriendEntityFull | null> {
  return new Promise((mRes, rej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["friends"], "readonly");
        const store = transaction.objectStore("friends");
        
        const request = store.get(friendId);
        
        request.onsuccess = async function (event) {
          const data = (event.target as IDBRequest).result;
          if (!data) {
            mRes(null);
            res();
            return;
          }

          try {
            const passwords = new Set<string>();
            for(let ac of Object.values(back_store.accounts_by_id)) {
              passwords.add(ac.pass);
            }
            
            for (let pass of passwords) {
              const _item = await decrypt_curve25519_from_pass({
                  pass,
                  cipherText: data.data,
              });
              const decrData = !_item 
                ? null
                : JSON.parse(_item);
              if (decrData) {
                mRes(decrData);
                res();
                return;
              }
            }
            // If no password worked
            mRes(null);
            res();
          }
          catch(err) {
            mRes(null);
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
