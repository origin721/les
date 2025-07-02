import { encrypt_curve25519_from_pass } from "../../core/crypt";
import { back_store } from "../../local_back/back_store";
import { indexdb_wrapper } from "../indexdb_wrapper";

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
        const transaction = db.transaction(["accounts"], "readwrite");
        const store = transaction.objectStore("accounts");
        
        // Получаем существующий аккаунт из back_store
        const existingAccount = back_store.accounts_by_id[accountId];
        if (!existingAccount) {
          throw new Error(`Account ${accountId} not found in back_store`);
        }

        // Создаем обновленный список друзей
        let currentFriends = existingAccount.friendsByIds || [];
        
        // Добавляем новых друзей
        if (operation.add) {
          for (const friendId of operation.add) {
            if (!currentFriends.includes(friendId)) {
              currentFriends.push(friendId);
            }
          }
        }
        
        // Удаляем друзей
        if (operation.remove) {
          currentFriends = currentFriends.filter(
            friendId => !operation.remove!.includes(friendId)
          );
        }

        // Создаем обновленную запись аккаунта
        const updatedAccount = {
          ...existingAccount,
          friendsByIds: currentFriends,
          date_updated: new Date(),
        };

        // Шифруем обновленные данные
        const newData = await encrypt_curve25519_from_pass({
          pass: existingAccount.pass,
          message: JSON.stringify(updatedAccount),
        });
        
        // Сохраняем в IndexedDB
        store.put({ id: accountId, data: newData });

        // Обновляем back_store
        back_store.accounts_by_id[accountId] = updatedAccount;

        transaction.oncomplete = function () {
          console.log(`✅ Account ${accountId} friends list updated successfully`);
          res();
        };

        transaction.onerror = function (event) {
          console.error("❌ Error updating account friends list:", event);
          rej(new Error(`IndexDB error: ${JSON.stringify(event)}`));
        };

      } catch (error) {
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
