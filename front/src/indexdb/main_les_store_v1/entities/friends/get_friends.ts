import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { FriendEntityFull } from "./add_friend";

export function get_friends({ userId }: { userId: string }): Promise<FriendEntityFull[]> {
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
              const account = back_store.accounts_by_id[userId];
              if (!account) throw new Error(`Account ${userId} not found`);
              
              const _item = await decrypt_curve25519_from_pass({
                  pass: account.pass,
                  cipherText: cursor.value.data,
              });
              const decrData = !_item 
                ? null
                : JSON.parse(_item);
              if (decrData && decrData.myAccId === userId) {
                result.push(decrData);
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
