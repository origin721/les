import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { friends_store_utils } from "../../../../local_back/back_store/friends_store_utils";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { entity_service } from "../entity_service/entity_service";
import type { FriendEntityFull } from "./types";

export async function get_friend_by_id({
  friendId,
  explicitMyAccId,
}: {
  friendId: string;
  explicitMyAccId: string;
}): Promise<FriendEntityFull | null> {
  const foundFriend = await entity_service.get_entity_by_id<FriendEntityFull>({
    table_name: "friends",
    id: friendId,
    explicitMyAccId,
  });

  if(foundFriend) {
    friends_store_utils.add([foundFriend]);
  }

  return foundFriend;

 //return new Promise((mRes, rej) => {
 //  indexdb_wrapper((db) => {
 //    return new Promise((res, rej) => {
 //      const transaction = db.transaction(["friends"], "readonly");
 //      const store = transaction.objectStore("friends");

 //      const request = store.get(friendId);

 //      request.onsuccess = async function (event) {
 //        const data = (event.target as IDBRequest).result;
 //        if (!data) {
 //          mRes(null);
 //          res();
 //          return;
 //        }

 //        try {
 //          const passwords = new Set<string>();
 //          for (let ac of Object.values(back_store.accounts_by_id)) {
 //            passwords.add(ac.pass);
 //          }

 //          for (let pass of passwords) {
 //            const _item = await decrypt_curve25519_from_pass({
 //              pass,
 //              cipherText: data.data,
 //            });
 //            const decrData = !_item ? null : JSON.parse(_item);
 //            if (decrData) {
 //              mRes(decrData);
 //              res();
 //              return;
 //            }
 //          }
 //          // If no password worked
 //          mRes(null);
 //          res();
 //        } catch (err) {
 //          mRes(null);
 //          res();
 //        }
 //      };

 //      request.onerror = function (event) {
 //        rej(event);
 //      };
 //    });
 //  });
 //});
}
