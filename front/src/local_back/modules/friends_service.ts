import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type {
  PostMessageParamAddFriends,
  PostMessageParamDeleteFriends,
  FriendDto,
} from "../../core/broadcast_channel/front_middleware_channel";
import {
  add_friend,
  type FriendEntity,
  type FriendEntityFull,
} from "../../indexdb/main_les_store_v1/entities/friends/add_friend";
import { delete_friend } from "../../indexdb/main_les_store_v1/entities/friends/delete_friend";
import { get_friends } from "../../indexdb/main_les_store_v1/entities/friends/get_friends";
import { get_friend_by_id } from "../../indexdb/main_les_store_v1/entities/friends/get_friend_by_id";
import {
  put_friends,
  type FriendEntityPut,
} from "../../indexdb/main_les_store_v1/entities/friends/put_friends";
import { get_accounts } from "../../indexdb/main_les_store_v1/entities/accounts/get_accounts";
import { back_store } from "../back_store/back_store";
import { devLog, prodError, prodInfo } from "../../core/debug/logger";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const friends_service = {
  async add(
    list: FriendEntity[],
    myAccId?: string,
  ): Promise<FriendEntityFull[]> {
    devLog(
      "🔄 friends_service.add starting with list:",
      list,
      "myAccId:",
      myAccId,
    );

    try {
      // Убеждаемся, что аккаунты загружены в back_store
      if (Object.keys(back_store.accounts_by_id).length === 0) {
        devLog("🔄 back_store.accounts_by_id пустой, загружаем аккаунты...");
        const accounts = await get_accounts();
        for (let ac of accounts) {
          back_store.accounts_by_id[ac.id] = ac;
        }
        devLog(
          "✅ Аккаунты загружены в back_store:",
          Object.keys(back_store.accounts_by_id),
        );
      }

      // Если передан myAccId, убеждаемся что для этого аккаунта есть пароль
      if (myAccId) {
        devLog("🔍 Проверяем аккаунт для myAccId:", myAccId);
        const account = back_store.accounts_by_id[myAccId];
        if (!account) {
          prodError("❌ Аккаунт не найден для myAccId:", myAccId);
          prodError(
            "❌ Доступные аккаунты:",
            Object.keys(back_store.accounts_by_id),
          );
          throw new Error(`Аккаунт ${myAccId} не найден в back_store`);
        }
        if (!account.pass) {
          prodError("❌ У аккаунта нет пароля:", account);
          throw new Error(`У аккаунта ${myAccId} нет пароля`);
        }
        devLog("✅ Аккаунт найден с паролем:", account.id);
      }

      devLog("🔄 friends_service.add вызывает add_friend...");
      const addFriendStartTime = Date.now();

      await add_friend(list, myAccId);

      const addFriendDuration = Date.now() - addFriendStartTime;
      prodInfo(
        `✅ friends_service.add add_friend завершен за ${addFriendDuration} мс, синхронизируем с back_store...`,
      );

      // Синхронизируем добавленных друзей с back_store
      const syncStartTime = Date.now();
      const freshFriends = await get_friends();

      // Обновляем back_store с новыми друзьями
      for (const friend of freshFriends) {
        back_store.friends_by_id[friend.id] = friend;
      }

      const syncDuration = Date.now() - syncStartTime;
      prodInfo(
        `✅ friends_service.add синхронизация с back_store завершена за ${syncDuration} мс`,
      );

      // Отправляем broadcast уведомление о добавлении друзей
      const broadcast_event: PostMessageParamAddFriends = {
        action: FrontMiddlewareActions.ADD_FRIENDS,
        data: {
          list: freshFriends.map(friendToDto),
        },
      };
      channel.postMessage(broadcast_event);
      prodInfo("📡 friends_service.add broadcast уведомление отправлено");

      const getListStartTime = Date.now();
      const result = freshFriends;
      const getListDuration = Date.now() - getListStartTime;

      prodInfo(`✅ friends_service.add завершен за ${getListDuration} мс`);
      prodInfo("✅ friends_service.add результат:", result);
      return result;
    } catch (error) {
      prodError("❌ Ошибка в friends_service.add:", error);
      if (error instanceof Error) {
        prodError("❌ Полная ошибка friends_service.add:", error.stack);
      }
      throw error;
    }
  },

  async delete(ids: string[]) {
    try {
      await delete_friend(ids);

      // Удаляем из локального кэша
      for (const friendId of ids) {
        delete back_store.friends_by_id[friendId];
      }

      // Отправляем broadcast о удалении
      const broadcast_event: PostMessageParamDeleteFriends = {
        action: FrontMiddlewareActions.DELETE_FRIENDS,
        data: {
          ids: ids,
        },
      };
      channel.postMessage(broadcast_event);
    } catch (err) {
      prodError("Error deleting friends:", err);
    }
  },

  async getList(): Promise<FriendEntityFull[]> {
    try {
      const friends = await get_friends();

      // Обновляем локальный кэш
      for (const friend of friends) {
        back_store.friends_by_id[friend.id] = friend;
      }

      // Отправляем broadcast с данными
      const broadcast_event: PostMessageParamAddFriends = {
        action: FrontMiddlewareActions.ADD_FRIENDS,
        data: {
          list: friends.map(friendToDto),
        },
      };
      channel.postMessage(broadcast_event);

      // Возвращаем список друзей
      return friends;
    } catch (err) {
      prodError("Error getting friends list:", err);
      return [];
    }
  },

  async getFriendsByAccountId(myAccId: string): Promise<FriendEntityFull[]> {
    try {
      const friends = await get_friends();
      return friends.filter((friend) => friend.myAccId === myAccId);
    } catch (err) {
      prodError("Error getting friends by account id:", err);
      return [];
    }
  },

  async getFriendById(friendId: string): Promise<FriendEntityFull | null> {
    try {
      return await get_friend_by_id(friendId);
    } catch (err) {
      prodError("Error getting friend by id:", err);
      return null;
    }
  },

  async put(list: FriendEntityPut[]) {
    try {
      await put_friends(list);

      // Обновляем локальный кэш
      for (const friend of list) {
        // Обновляем существующую запись в кэше
        if (back_store.friends_by_id[friend.id]) {
          back_store.friends_by_id[friend.id] = {
            ...back_store.friends_by_id[friend.id],
            ...friend,
          };
        }
      }

      // Перезагружаем весь список для синхронизации
      await friends_service.getList();
    } catch (err) {
      prodError("Error updating friends:", err);
    }
  },
};

function friendToDto(friend: FriendEntityFull): FriendDto {
  return {
    id: friend.id,
    namePub: friend.namePub,
    myAccId: friend.myAccId,
  };
}
