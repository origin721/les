import { indexdb_wrapper } from "../../indexdb_wrapper";
import { back_store } from "../../../../local_back/back_store/back_store";
import { prodError, prodInfo, devDB } from "../../../../core/debug/logger";
import { entity_service } from "../entity_service/entity_service";
import { friends_store_utils } from "../../../../local_back/back_store/friends_store_utils";

export async function delete_friend(
  friendIds: string[]
): Promise<void> {
  await entity_service.delete_entities({
    ids: friendIds,
    table_name: "friends",
  });

  friends_store_utils.delete(friendIds);

// return indexdb_wrapper((db) => {
//   return new Promise<void>((res, rej) => {
//     try {
//       const transaction = db.transaction(["friends"], "readwrite");
//       const store = transaction.objectStore("friends");
//       
//       let completedOperations = 0;
//       const totalOperations = friendIds.length;
//       
//       if (totalOperations === 0) {
//         res();
//         return;
//       }
//       
//       for (const friendId of friendIds) {
//         const request = store.delete(friendId);
//         
//         request.onsuccess = function () {
//           // Удаляем из back_store
//           delete back_store.friends_by_id[friendId];
//           
//           completedOperations++;
//           if (completedOperations === totalOperations) {
//             devDB('✅ Друзья удалены из IndexedDB и back_store');
//             prodInfo('✅ Друзья удалены успешно');
//             res();
//           }
//         };

//         request.onerror = function (event) {
//           prodError('❌ Ошибка удаления друга из IndexedDB:', event);
//           rej(event);
//         };
//       }
//     } catch (error) {
//       prodError('❌ Критическая ошибка в delete_friend:', error);
//       rej(error);
//     }
//   });
// }) as Promise<void>;
}
