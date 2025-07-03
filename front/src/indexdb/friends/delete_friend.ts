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
            
            // Обновляем каждый аккаунт с тайм-аутом
            for (const [accountId, friendIdsToRemove] of Object.entries(friendsByAccount)) {
              forceLog('🔄 Синхронизация аккаунта:', accountId, 'удаление друзей:', friendIdsToRemove);
              
              try {
                // Создаем промис с тайм-аутом для updateAccountFriendsList
                const updatePromise = updateAccountFriendsList(accountId, {
                  remove: friendIdsToRemove
                });
                
                const timeoutPromise = new Promise<never>((_, reject) => 
                  setTimeout(() => {
                    forceLog(`⏰ TIMEOUT: updateAccountFriendsList для аккаунта ${accountId} превысил 8 секунд при удалении`);
                    reject(new Error(`updateAccountFriendsList timeout for account ${accountId} during delete`));
                  }, 8000)
                );
                
                // Ждем либо завершения обновления, либо тайм-аута
                await Promise.race([updatePromise, timeoutPromise]);
                forceLog(`✅ Синхронизация удаления для аккаунта ${accountId} завершена успешно`);
                
              } catch (syncError) {
                forceLog(`❌ Ошибка синхронизации удаления для аккаунта ${accountId}:`, syncError);
                console.error(`❌ Sync error for account ${accountId} during delete:`, syncError);
                // Не прерываем выполнение, продолжаем с другими аккаунтами
              }
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
