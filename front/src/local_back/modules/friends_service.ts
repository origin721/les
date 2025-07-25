import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type {
  PostMessageParamAddFriends,
  PostMessageParamDeleteFriends,
  FriendDto,
} from "../../core/broadcast_channel/front_middleware_channel";
import {
  add_friend,
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
import type { FriendEntity, FriendEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/types";
import { friends_store_utils } from "../back_store/friends_store_utils";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const friends_service = {
  async add(
    list: FriendEntity[],
    myAccId: string,
  ): Promise<FriendEntityFull[]> {

    return add_friend({list, myAccId});
  },

  async delete(ids: string[]) {
    try {
      await delete_friend(ids);

      // Удаляем из локального кэша
     //for (const friendId of ids) {
     //  delete back_store.friends_by_id[friendId];
     //}

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

  async getFriendById({
    friendId,
    explicitMyAccId,
  }:{
    friendId: string;
    explicitMyAccId: string;
  }): Promise<FriendEntityFull | null> {
    try {
      return await get_friend_by_id({
        friendId,
        explicitMyAccId,
      });
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

export function friendToDto(friend: FriendEntityFull): FriendDto {
  return {
    id: friend.id,
    namePub: friend.namePub,
    myAccId: friend.myAccId,
  };
}
