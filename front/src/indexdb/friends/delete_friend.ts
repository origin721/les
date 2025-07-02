import { indexdb_wrapper } from "../indexdb_wrapper";
import { updateAccountFriendsList } from "../accounts/update_account_friends";
import { back_store } from "../../local_back/back_store";
import { forceLog } from "../../core/debug/logger";

export function delete_friend(friendIds: string[]): Promise<void> {
  return indexdb_wrapper((db) => {
    return new Promise<void>(async (res, rej) => {
      try {
        // Сначала получаем информацию о друзьях для синхронизации аккаунтов
        const friendsToDelete: Array<{ friendId: string; myAccId: string }> = [];
        
        // Получаем данные друзей из back_store для определения аккаунтов
        for (const accId in back_store.friends_by_account) {
          for (const friendId of friendIds) {
            if (back_store.friends_by_account[accId][friendId]) {
              friendsToDelete.push({ friendId, myAccId: accId });
            }
          }
        }

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
              // После успешного удаления из IndexedDB синхронизируем аккаунты
              syncAccountsAfterDelete();
            }
          };

          request.onerror = function (event) {
            rej(event);
          };
        }

        async function syncAccountsAfterDelete() {
          try {
            forceLog("✅ Друзья удалены из IndexedDB, начинаем синхронизацию аккаунтов");
            
            // Группируем друзей по аккаунтам для эффективной синхронизации
            const friendsByAccount: Record<string, string[]> = {};
            
            for (const { friendId, myAccId } of friendsToDelete) {
              if (!friendsByAccount[myAccId]) {
                friendsByAccount[myAccId] = [];
              }
              friendsByAccount[myAccId].push(friendId);
            }
            
            // Обновляем каждый аккаунт
            for (const [accountId, friendIdsToRemove] of Object.entries(friendsByAccount)) {
              forceLog('🔄 Синхронизация аккаунта:', accountId, 'удаление друзей:', friendIdsToRemove);
              
              await updateAccountFriendsList(accountId, {
                remove: friendIdsToRemove
              });
            }
            
            forceLog('✅ Синхронизация аккаунтов завершена');
            res();
          } catch (error) {
            console.error('❌ Ошибка синхронизации аккаунтов при удалении:', error);
            // Не прерываем выполнение, так как друзья уже удалены
            res();
          }
        }
      } catch (error) {
        console.error('❌ Критическая ошибка в delete_friend:', error);
        rej(error);
      }
    });
  }) as Promise<void>;
}
