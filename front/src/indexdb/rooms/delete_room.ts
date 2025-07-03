import { indexdb_wrapper } from "../indexdb_wrapper";
import { back_store } from "../../local_back/back_store/back_store";
import { prodError, prodInfo, devDB } from "../../core/debug/logger";

export function delete_room(roomId: string): Promise<void> {
  devDB('🔄 Удаление комнаты начато, ID:', roomId);
  
  return new Promise((mRes, mRej) => {
    indexdb_wrapper((db) => {
      return new Promise((res, rej) => {
        const transaction = db.transaction(["rooms"], "readwrite");
        const store = transaction.objectStore("rooms");

        devDB('💾 Удаляем из IndexDB...');
        const deleteRequest = store.delete(roomId);

        deleteRequest.onsuccess = function() {
          devDB('✅ store.delete успешно завершен для ID:', roomId);
        };

        deleteRequest.onerror = function(event) {
          devDB('❌ store.delete ошибка для ID:', roomId, 'event:', event);
        };

        transaction.oncomplete = function () {
          devDB("🎉 Transaction oncomplete triggered!");
          devDB("✅ Комната удалена успешно из IndexDB");
          
          // Удаляем из back_store через сервис
          back_store.rooms.delete([roomId]);
          
          devDB('✅ Комната удалена из back_store через сервис');
          devDB('🎯 Вызываем res() для завершения delete_room');
          prodInfo('✅ Комната удалена успешно');
          mRes();
          res();
        };

        transaction.onerror = function (event) {
          devDB("❌ Transaction onerror triggered!");
          prodError("❌ Ошибка при удалении комнаты из IndexDB:", event);
          const error = new Error(`IndexDB error: ${JSON.stringify(event)}`);
          mRej(error);
          rej(error);
        };

        transaction.onabort = function (event) {
          devDB("❌ Transaction onabort triggered!");
          prodError("❌ Transaction была прервана:", event);
          const error = new Error(`IndexDB transaction aborted: ${JSON.stringify(event)}`);
          mRej(error);
          rej(error);
        };
      });
    });
  });
}
