import { indexdb_wrapper } from "../indexdb_wrapper";

export function delete_friend(friendId: string): Promise<void> {
  return indexdb_wrapper((db) => {
    return new Promise<void>((res, rej) => {
      const transaction = db.transaction(["friends"], "readwrite");
      const store = transaction.objectStore("friends");
      
      const request = store.delete(friendId);
      
      request.onsuccess = function () {
        res();
      };

      request.onerror = function (event) {
        rej(event);
      };
    });
  }) as Promise<void>;
}
