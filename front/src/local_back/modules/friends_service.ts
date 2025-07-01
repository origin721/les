import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddFriends, PostMessageParamDeleteFriends, FriendDto } from "../../core/broadcast_channel/front_middleware_channel";
import { add_friend, type FriendEntity, type FriendEntityFull } from "../../indexdb/friends/add_friend";
import { delete_friend } from "../../indexdb/friends/delete_friend";
import { get_friends } from "../../indexdb/friends/get_friends";
import { get_friend_by_id } from "../../indexdb/friends/get_friend_by_id";
import { back_store } from "../back_store";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const friends_service = {
  async add(list: FriendEntity[]) {
    await add_friend(list);
    await friends_service.getList();
  },

  async delete(ids: string[]) {
    try {
      await delete_friend(ids);
      
      // Удаляем из локального кэша
      for (const accId in back_store.friends_by_account) {
        for (const friendId of ids) {
          delete back_store.friends_by_account[accId][friendId];
        }
      }

      // Отправляем broadcast о удалении
      const broadcast_event: PostMessageParamDeleteFriends = {
        action: FrontMiddlewareActions.DELETE_FRIENDS,
        data: {
          ids: ids,
        }
      }
      channel.postMessage(broadcast_event);
    }
    catch(err) {
      console.error('Error deleting friends:', err);
    }
  },

  async getList() {
    try {
      const friends = await get_friends();
      
      // Обновляем локальный кэш по аккаунтам
      for (const friend of friends) {
        if (!back_store.friends_by_account[friend.myAccId]) {
          back_store.friends_by_account[friend.myAccId] = {};
        }
        back_store.friends_by_account[friend.myAccId][friend.id] = friend;
      }

      // Отправляем broadcast с данными
      const broadcast_event: PostMessageParamAddFriends = {
        action: FrontMiddlewareActions.ADD_FRIENDS,
        data: {
          list: friends.map(friendToDto)
        }
      }
      channel.postMessage(broadcast_event);
    }
    catch(err) {
      console.error('Error getting friends list:', err);
    }
  },

  async getFriendsByAccountId(myAccId: string): Promise<FriendEntityFull[]> {
    try {
      const friends = await get_friends();
      return friends.filter(friend => friend.myAccId === myAccId);
    }
    catch(err) {
      console.error('Error getting friends by account id:', err);
      return [];
    }
  },

  async getFriendById(friendId: string): Promise<FriendEntityFull | null> {
    try {
      return await get_friend_by_id(friendId);
    }
    catch(err) {
      console.error('Error getting friend by id:', err);
      return null;
    }
  }
}

function friendToDto(friend: FriendEntityFull): FriendDto {
  return {
    id: friend.id,
    namePub: friend.namePub,
    myAccId: friend.myAccId,
  }
}
