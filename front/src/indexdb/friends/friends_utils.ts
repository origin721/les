import { back_store } from "../../local_back/back_store";
import type { FriendEntityFull } from "./add_friend";

/**
 * Простые утилиты для работы с друзьями через back_store.friends_by_id
 * Заменяет сложную логику синхронизации
 */

/**
 * Получает всех друзей из back_store
 * @returns Массив всех друзей
 */
export function getAllFriends(): FriendEntityFull[] {
  return Object.values(back_store.friends_by_id);
}

/**
 * Получает друга по ID
 * @param friendId ID друга
 * @returns Друг или undefined
 */
export function getFriendById(friendId: string): FriendEntityFull | undefined {
  return back_store.friends_by_id[friendId];
}

/**
 * Получает друзей конкретного аккаунта
 * @param accountId ID аккаунта
 * @returns Массив друзей аккаунта
 */
export function getFriendsByAccountId(accountId: string): FriendEntityFull[] {
  return Object.values(back_store.friends_by_id).filter(
    friend => friend.myAccId === accountId
  );
}

/**
 * Проверяет, является ли пользователь другом аккаунта
 * @param accountId ID аккаунта
 * @param friendId ID друга
 * @returns true если является другом
 */
export function isAccountFriend(accountId: string, friendId: string): boolean {
  const friend = back_store.friends_by_id[friendId];
  return friend?.myAccId === accountId;
}

/**
 * Получает количество друзей аккаунта
 * @param accountId ID аккаунта
 * @returns Количество друзей
 */
export function getFriendsCount(accountId: string): number {
  return getFriendsByAccountId(accountId).length;
}
