import { PATHS } from "../local_back/constant/PATHS";
import { shared_worker_store } from "../processes/shared_worker/shared_worker_store";
import type { FriendEntity } from "../indexdb/friends/add_friend";
import type { FriendEntityFull } from "../indexdb/friends/add_friend";
import type { FriendEntityPut } from "../indexdb/friends/put_friends";
import type { Account } from "../indexdb/accounts/get_accounts";

/**
 * Основной API для работы с backend через shared worker
 */
export const api = {
  friends: {
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
     */
    async add(list: FriendEntity[]): Promise<void> {
      await shared_worker_store.fetch({
        path: PATHS.ADD_FRIENDS,
        body: { list }
      });
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
  },

  accounts: {
    /**
     * Войти в аккаунт
     */
    async login(pass: string): Promise<void> {
      await shared_worker_store.fetch({
        path: PATHS.LOGIN,
        body: { pass }
      });
    },

    /**
     * Получить список аккаунтов
     */
    async getList(): Promise<Account[]> {
      const result = await shared_worker_store.fetch({
        path: PATHS.GET_ACCOUNTS
      });
      return result as Account[];
    }
  }
};

export default api;
