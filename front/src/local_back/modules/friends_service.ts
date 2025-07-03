import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddFriends, PostMessageParamDeleteFriends, FriendDto } from "../../core/broadcast_channel/front_middleware_channel";
import { add_friend, type FriendEntity, type FriendEntityFull } from "../../indexdb/friends/add_friend";
import { delete_friend } from "../../indexdb/friends/delete_friend";
import { get_friends } from "../../indexdb/friends/get_friends";
import { get_friend_by_id } from "../../indexdb/friends/get_friend_by_id";
import { put_friends, type FriendEntityPut } from "../../indexdb/friends/put_friends";
import { get_accounts } from "../../indexdb/accounts/get_accounts";
import { back_store } from "../back_store";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const friends_service = {
  async add(list: FriendEntity[], myAccId?: string): Promise<FriendEntityFull[]> {
    console.log('🔄 friends_service.add starting with list:', list, 'myAccId:', myAccId);
    
    try {
      // Убеждаемся, что аккаунты загружены в back_store
      if (Object.keys(back_store.accounts_by_id).length === 0) {
        console.log('🔄 back_store.accounts_by_id пустой, загружаем аккаунты...');
        const accounts = await get_accounts();
        for (let ac of accounts) {
          back_store.accounts_by_id[ac.id] = ac;
        }
        console.log('✅ Аккаунты загружены в back_store:', Object.keys(back_store.accounts_by_id));
      }
      
      // Если передан myAccId, убеждаемся что для этого аккаунта есть пароль
      if (myAccId) {
        console.log('🔍 Проверяем аккаунт для myAccId:', myAccId);
        const account = back_store.accounts_by_id[myAccId];
        if (!account) {
          console.error('❌ Аккаунт не найден для myAccId:', myAccId);
          console.error('❌ Доступные аккаунты:', Object.keys(back_store.accounts_by_id));
          throw new Error(`Аккаунт ${myAccId} не найден в back_store`);
        }
        if (!account.pass) {
          console.error('❌ У аккаунта нет пароля:', account);
          throw new Error(`У аккаунта ${myAccId} нет пароля`);
        }
        console.log('✅ Аккаунт найден с паролем:', account.id);
      }
      
      console.log('🔄 friends_service.add вызывает add_friend...');
      const addFriendStartTime = Date.now();
      
      await add_friend(list, myAccId);
      
      const addFriendDuration = Date.now() - addFriendStartTime;
      console.log(`✅ friends_service.add add_friend завершен за ${addFriendDuration} мс, получаем список...`);
      
      const getListStartTime = Date.now();
      const result = await friends_service.getList();
      const getListDuration = Date.now() - getListStartTime;
      
      console.log(`✅ friends_service.add getList завершен за ${getListDuration} мс`);
      console.log('✅ friends_service.add завершен, результат:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка в friends_service.add:', error);
      if (error instanceof Error) {
        console.error('❌ Полная ошибка friends_service.add:', error.stack);
      }
      throw error;
    }
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

  async getList(): Promise<FriendEntityFull[]> {
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
      
      // Возвращаем список друзей
      return friends;
    }
    catch(err) {
      console.error('Error getting friends list:', err);
      return [];
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
  },

  async put(list: FriendEntityPut[]) {
    try {
      await put_friends(list);
      
      // Обновляем локальный кэш
      for (const friend of list) {
        if (!back_store.friends_by_account[friend.myAccId]) {
          back_store.friends_by_account[friend.myAccId] = {};
        }
        // Обновляем существующую запись в кэше
        if (back_store.friends_by_account[friend.myAccId][friend.id]) {
          back_store.friends_by_account[friend.myAccId][friend.id] = {
            ...back_store.friends_by_account[friend.myAccId][friend.id],
            ...friend
          };
        }
      }

      // Перезагружаем весь список для синхронизации
      await friends_service.getList();
    }
    catch(err) {
      console.error('Error updating friends:', err);
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
