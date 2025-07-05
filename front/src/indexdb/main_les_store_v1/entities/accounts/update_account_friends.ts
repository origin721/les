import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { prodError, prodInfo, devDB } from "../../../../core/debug/logger";

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
        devDB(`🔄 updateAccountFriendsList НАЧАЛО для аккаунта: ${accountId}`, operation);
        
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");
        
        devDB(`🔄 IndexDB transaction создана для аккаунта: ${accountId}`);
        
        // Получаем существующий аккаунт из back_store
        const existingAccount = back_store.accounts_by_id[accountId];
        if (!existingAccount) {
          prodError(`❌ Аккаунт ${accountId} не найден в back_store`);
          throw new Error(`Account ${accountId} not found in back_store`);
        }
        
        devDB(`✅ Аккаунт найден в back_store: ${accountId}`, existingAccount.friendsByIds);

        // Создаем обновленный список друзей
        let currentFriends = existingAccount.friendsByIds || [];
        devDB(`🔍 Текущие друзья: ${currentFriends}`);
        
        // Добавляем новых друзей
        if (operation.add) {
          devDB(`➕ Добавляем друзей: ${operation.add}`);
          for (const friendId of operation.add) {
            if (!currentFriends.includes(friendId)) {
              currentFriends.push(friendId);
            }
          }
        }
        
        // Удаляем друзей
        if (operation.remove) {
          devDB(`➖ Удаляем друзей: ${operation.remove}`);
          currentFriends = currentFriends.filter(
            friendId => !operation.remove!.includes(friendId)
          );
        }

        devDB(`✅ Обновленный список друзей: ${currentFriends}`);

        // Создаем обновленную запись аккаунта
        const updatedAccount = {
          ...existingAccount,
          friendsByIds: currentFriends,
          date_updated: new Date(),
        };

        devDB(`🔐 Начинаем шифрование для аккаунта: ${accountId}`);
        
        // Шифруем обновленные данные
        const encryptStartTime = Date.now();
        const newData = await encrypt_curve25519_from_pass({
          pass: existingAccount.pass,
          message: JSON.stringify(updatedAccount),
        });
        const encryptDuration = Date.now() - encryptStartTime;
        
        devDB(`✅ Шифрование завершено за ${encryptDuration} мс для аккаунта: ${accountId}`);
        
        // Сохраняем в IndexedDB
        devDB(`💾 Сохраняем в IndexDB для аккаунта: ${accountId}`);
        const putStartTime = Date.now();
        const putRequest = store.put({ id: accountId, data: newData });

        putRequest.onsuccess = function() {
          const putDuration = Date.now() - putStartTime;
          devDB(`✅ store.put успешно завершен за ${putDuration} мс для аккаунта: ${accountId}`);
        };

        putRequest.onerror = function(event) {
          prodError(`❌ store.put ошибка для аккаунта: ${accountId}`, event);
          prodError("❌ Error in store.put:", event);
          rej(new Error(`IndexDB put error: ${JSON.stringify(event)}`));
        };

        // Обновляем back_store
        back_store.accounts_by_id[accountId] = updatedAccount;
        devDB(`✅ back_store обновлен для аккаунта: ${accountId}`);

        transaction.oncomplete = function () {
          prodInfo(`🎉 Transaction oncomplete для аккаунта: ${accountId}`);
          prodInfo(`✅ Account ${accountId} friends list updated successfully`);
          res();
        };

        transaction.onerror = function (event) {
          prodError(`❌ Transaction onerror для аккаунта: ${accountId}`, event);
          prodError("❌ Error updating account friends list:", event);
          rej(new Error(`IndexDB error: ${JSON.stringify(event)}`));
        };

        transaction.onabort = function (event) {
          prodError(`❌ Transaction onabort для аккаунта: ${accountId}`, event);
          prodError("❌ Transaction was aborted:", event);
          rej(new Error(`IndexDB transaction aborted: ${JSON.stringify(event)}`));
        };

      } catch (error) {
        prodError(`❌ Критическая ошибка в updateAccountFriendsList для аккаунта: ${accountId}`, error);
        prodError('❌ Critical error in updateAccountFriendsList:', error);
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
