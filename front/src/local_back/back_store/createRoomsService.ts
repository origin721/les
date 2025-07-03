import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddRooms, PostMessageParamDeleteRooms, RoomDto } from "../../core/broadcast_channel/front_middleware_channel";
import type { RoomEntity, RoomEntityFull } from "../../indexdb/rooms/add_room";
import { add_room } from "../../indexdb/rooms/add_room";
import { get_rooms } from "../../indexdb/rooms/get_rooms";
import { get_room_by_id } from "../../indexdb/rooms/get_room_by_id";
import { delete_room } from "../../indexdb/rooms/delete_room";
import { put_rooms } from "../../indexdb/rooms/put_rooms";
import { get_accounts } from "../../indexdb/accounts/get_accounts";
import { back_store } from "./back_store";
import { devLog, prodError, prodInfo } from "../../core/debug/logger";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const create_rooms_service = () => ({
  byId: {} as Record<string, RoomEntityFull>,
  
  async add(rooms: RoomEntity[], accountId?: string): Promise<void> {
    devLog('🔄 rooms_service.add starting with rooms:', rooms, 'accountId:', accountId);
    const self = this;
    
    try {
      devLog('🔄 rooms_service.add вызывает add_room...');
      const addRoomStartTime = Date.now();
      
      await add_room(rooms, accountId);
      
      const addRoomDuration = Date.now() - addRoomStartTime;
      prodInfo(`✅ rooms_service.add add_room завершен за ${addRoomDuration} мс, получаем список...`);
      
      const getListStartTime = Date.now();
      const getListDuration = Date.now() - getListStartTime;
      
      prodInfo(`✅ rooms_service.add getList завершен за ${getListDuration} мс`);

      return;
      
    } catch (error) {
      prodError('❌ Ошибка в rooms_service.add:', error);
      if (error instanceof Error) {
        prodError('❌ Полная ошибка rooms_service.add:', error.stack);
      }
      throw error;
    }
  },

  async delete(ids: string[]) {
    try {
      await delete_room(ids[0]); // delete_room принимает один ID
      
      // Удаляем из локального кэша
      for (const roomId of ids) {
        delete back_store.rooms.byId[roomId];
      }

      // Отправляем broadcast о удалении
      const broadcast_event: PostMessageParamDeleteRooms = {
        action: FrontMiddlewareActions.DELETE_ROOMS,
        data: {
          ids: ids,
        }
      }
      channel.postMessage(broadcast_event);
    }
    catch(err) {
      prodError('Error deleting rooms:', err);
    }
  },

  async getById(roomId: string): Promise<RoomEntityFull | null> {
    try {
      return this.byId[roomId];
    }
    catch(err) {
      prodError('Error getting room by id:', err);
      return null;
    }
  },

  async put(rooms: RoomEntityFull[]) {
    const self = this;
    try {
      await put_rooms(rooms);
      
      // Обновляем локальный кэш
      for (const room of rooms) {
        // Обновляем существующую запись в кэше
        if (back_store.rooms.byId[room.id]) {
          back_store.rooms.byId[room.id] = {
            ...back_store.rooms.byId[room.id],
            ...room
          };
        }
      }
    }
    catch(err) {
      prodError('Error updating rooms:', err);
    }
  }
});

function roomToDto(room: RoomEntityFull): RoomDto {
  return {
    id: room.id,
    sourceName: room.sourceName,
    viewName: room.viewName,
    myAccId: room.myAccId,
  }
}
