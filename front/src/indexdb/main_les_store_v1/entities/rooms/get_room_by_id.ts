import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { RoomEntityFull } from "./add_room";

export function get_room_by_id(roomId: string): Promise<RoomEntityFull | null> {
  return new Promise((mRes, mRej) => {
    indexdb_wrapper((db) => {
      return new Promise(async (res, rej) => {
        const transaction = db.transaction(["rooms"], "readonly");
        const store = transaction.objectStore("rooms");

        const request = store.get(roomId);

        request.onsuccess = async function (event) {
          const result = (event.target as IDBRequest).result;
          
          if (!result) {
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
              try {
                const _item = await decrypt_curve25519_from_pass({
                  pass,
                  cipherText: result.data,
                });
                const decrData = !_item 
                  ? null
                  : JSON.parse(_item);
                if (decrData) {
                  mRes(decrData);
                  res();
                  return;
                }
              } catch (err) {
                // Continue with next password
              }
            }
            
            // If no password worked, return null
            mRes(null);
            res();
          } catch (err) {
            mRej(err);
            rej(err);
          }
        };

        request.onerror = function(event) {
          mRej(event);
          rej(event);
        };
      });
    });
  });
}
