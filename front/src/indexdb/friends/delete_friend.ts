import { indexdb_wrapper } from "../indexdb_wrapper";

export function delete_friend(friendIds: string[]): Promise<void> {
  return indexdb_wrapper((db) => {
    return new Promise<void>((res, rej) => {
      const transaction = db.transaction(["friends"], "readwrite");
      const store = transaction.objectStore("friends");
      
      let completedOperations = 0;
      const totalOperations = friendIds.length;
      
      if (totalOperations === 0) {
        res();
        return;
      }
      
      for (const friendId of friendIds) {
        const request = store.delete(friendId);
        
        request.onsuccess = function () {
          completedOperations++;
          if (completedOperations === totalOperations) {
            res();
          }
        };

        request.onerror = function (event) {
          rej(event);
        };
      }
    });
  }) as Promise<void>;
}
