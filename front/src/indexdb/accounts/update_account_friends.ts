import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { back_store } from "../../local_back/back_store";
import { indexdb_wrapper } from "../indexdb_wrapper";
import { forceLog } from "../../core/debug/logger";

export type UpdateAccountFriendsOperation = {
  add?: string[];
  remove?: string[];
};

/**
 * Атомарно обновляет список друзей в аккаунте
 * @param accountId ID аккаунта для обновления
 * @param operation Операции добавления/удаления друзей
 */
export function updateAccountFriendsList(
  accountId: string, 
  operation: UpdateAccountFriendsOperation
): Promise<void> {
  return indexdb_wrapper((db) => {
    return new Promise<void>(async (res, rej) => {
      try {
        forceLog(`🔄 updateAccountFriendsList НАЧАЛО для аккаунта: ${accountId}`, operation);
        
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");
        
        forceLog(`🔄 IndexDB transaction создана для аккаунта: ${accountId}`);
        
        // Получаем существующий аккаунт из back_store
        const existingAccount = back_store.accounts_by_id[accountId];
        if (!existingAccount) {
          forceLog(`❌ Аккаунт ${accountId} не найден в back_store`);
          throw new Error(`Account ${accountId} not found in back_store`);
        }
        
        forceLog(`✅ Аккаунт найден в back_store: ${accountId}`, existingAccount.friendsByIds);

        // Создаем обновленный список друзей
        let currentFriends = existingAccount.friendsByIds || [];
        forceLog(`🔍 Текущие друзья: ${currentFriends}`);
        
        // Добавляем новых друзей
        if (operation.add) {
          forceLog(`➕ Добавляем друзей: ${operation.add}`);
          for (const friendId of operation.add) {
            if (!currentFriends.includes(friendId)) {
              currentFriends.push(friendId);
            }
          }
        }
        
        // Удаляем друзей
        if (operation.remove) {
          forceLog(`➖ Удаляем друзей: ${operation.remove}`);
          currentFriends = currentFriends.filter(
            friendId => !operation.remove!.includes(friendId)
          );
        }

        forceLog(`✅ Обновленный список друзей: ${currentFriends}`);

        // Создаем обновленную запись аккаунта
        const updatedAccount = {
          ...existingAccount,
          friendsByIds: currentFriends,
          date_updated: new Date(),
        };

        forceLog(`🔐 Начинаем шифрование для аккаунта: ${accountId}`);
        
        // Шифруем обновленные данные
        const encryptStartTime = Date.now();
        const newData = await encrypt_curve25519_from_pass({
          pass: existingAccount.pass,
          message: JSON.stringify(updatedAccount),
        });
        const encryptDuration = Date.now() - encryptStartTime;
        
        forceLog(`✅ Шифрование завершено за ${encryptDuration} мс для аккаунта: ${accountId}`);
        
        // Сохраняем в IndexedDB
        forceLog(`💾 Сохраняем в IndexDB для аккаунта: ${accountId}`);
        const putStartTime = Date.now();
        const putRequest = store.put({ id: accountId, data: newData });

        putRequest.onsuccess = function() {
          const putDuration = Date.now() - putStartTime;
          forceLog(`✅ store.put успешно завершен за ${putDuration} мс для аккаунта: ${accountId}`);
        };

        putRequest.onerror = function(event) {
          forceLog(`❌ store.put ошибка для аккаунта: ${accountId}`, event);
        };

        // Обновляем back_store
        back_store.accounts_by_id[accountId] = updatedAccount;
        forceLog(`✅ back_store обновлен для аккаунта: ${accountId}`);

        transaction.oncomplete = function () {
          forceLog(`🎉 Transaction oncomplete для аккаунта: ${accountId}`);
          forceLog(`✅ Account ${accountId} friends list updated successfully`);
          res();
        };

        transaction.onerror = function (event) {
          forceLog(`❌ Transaction onerror для аккаунта: ${accountId}`, event);
          console.error("❌ Error updating account friends list:", event);
          rej(new Error(`IndexDB error: ${JSON.stringify(event)}`));
        };

        transaction.onabort = function (event) {
          forceLog(`❌ Transaction onabort для аккаунта: ${accountId}`, event);
          console.error("❌ Transaction was aborted:", event);
          rej(new Error(`IndexDB transaction aborted: ${JSON.stringify(event)}`));
        };

      } catch (error) {
        forceLog(`❌ Критическая ошибка в updateAccountFriendsList для аккаунта: ${accountId}`, error);
        console.error('❌ Critical error in updateAccountFriendsList:', error);
        rej(error);
      }
    });
  }) as Promise<void>;
}

/**
 * Получает список друзей из аккаунта
 * @param accountId ID аккаунта
 * @returns Список ID друзей
 */
export function getAccountFriendsList(accountId: string): string[] {
  const account = back_store.accounts_by_id[accountId];
  return account?.friendsByIds || [];
}

/**
 * Проверяет, является ли указанный ID другом данного аккаунта
 * @param accountId ID аккаунта
 * @param friendId ID друга
 * @returns true если является другом
 */
export function isAccountFriend(accountId: string, friendId: string): boolean {
  const friends = getAccountFriendsList(accountId);
  return friends.includes(friendId);
}
