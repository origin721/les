import { PATHS } from "../../local_back/constant/PATHS";
import { shared_worker_store } from "../../processes/shared_worker/shared_worker_store";
import type { FriendEntity } from "../../indexdb/main_les_store_v1/entities/friends/add_friend";
import type { FriendEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/add_friend";
import type { FriendEntityPut } from "../../indexdb/main_les_store_v1/entities/friends/put_friends";
import type { Account } from "../../indexdb/main_les_store_v1/entities/accounts/get_accounts";
import { devAPI, prodError } from "../../core/debug/logger";

/**
 * Параметры для добавления друзей с явным указанием аккаунта
 */
export type AddFriendsParams = {
  friends: FriendEntity[];
  myAccId: string;
};

export const friends = {
    /**
     * Получить всех друзей
     */
    async getList(): Promise<FriendEntityFull[]> {
      const result = await shared_worker_store.fetch({
        path: PATHS.GET_FRIENDS
      });
      return result as FriendEntityFull[];
    },

    /**
     * Получить друзей по ID аккаунта
     */
    async getByAccountId(myAccId: string): Promise<FriendEntityFull[]> {
      const result = await shared_worker_store.fetch({
        path: PATHS.GET_FRIENDS_BY_ACCOUNT_ID,
        body: { myAccId }
      });
      return result as FriendEntityFull[];
    },

    /**
     * Получить друга по ID
     */
    async getById(friendId: string): Promise<FriendEntityFull | null> {
      const result = await shared_worker_store.fetch({
        path: PATHS.GET_FRIEND_BY_ID,
        body: { friendId }
      });
      return result as FriendEntityFull | null;
    },

    /**
     * Добавить друзей
     * Поддерживает два формата для обратной совместимости:
     * 1. Старый: add(list: FriendEntity[])
     * 2. Новый: add(params: AddFriendsParams)
     */
    async add(listOrParams: FriendEntity[] | AddFriendsParams): Promise<void> {
      devAPI('🌐 API friends.add СТАРТ:', listOrParams);
      const startTime = Date.now();
      
      try {
        let fetchParams;
        
        // Определяем формат входных данных
        if (Array.isArray(listOrParams)) {
          // Старый формат - массив друзей
          fetchParams = {
            path: PATHS.ADD_FRIENDS,
            body: { list: listOrParams }
          };
          devAPI('🌐 API friends.add: используем старый формат (массив)');
        } else {
          // Новый формат - объект с друзьями и myAccId
          fetchParams = {
            path: PATHS.ADD_FRIENDS,
            body: { 
              list: listOrParams.friends,
              myAccId: listOrParams.myAccId 
            }
          };
          devAPI('🌐 API friends.add: используем новый формат с myAccId:', listOrParams.myAccId);
        }
        
        devAPI('🌐 API friends.add: вызываем shared_worker_store.fetch с параметрами:', fetchParams);
        
        const result = await shared_worker_store.fetch(fetchParams);
        
        devAPI('✅ API friends.add УСПЕХ за', Date.now() - startTime, 'мс, результат:', result);
        return result;
      } catch (error) {
        prodError('❌ API friends.add ОШИБКА за', Date.now() - startTime, 'мс:', error);
        devAPI('❌ API friends.add полная ошибка:', (error as any)?.stack);
        throw error;
      }
    },

    /**
     * Удалить друзей
     */
    async delete(ids: string[]): Promise<void> {
      await shared_worker_store.fetch({
        path: PATHS.DELETE_FRIENDS,
        body: { ids }
      });
    },

    /**
     * Обновить друзей
     */
    async put(list: FriendEntityPut[]): Promise<void> {
      await shared_worker_store.fetch({
        path: PATHS.PUT_FRIENDS,
        body: { list }
      });
    }
  }