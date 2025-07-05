import type { RoomEntity, RoomEntityFull } from "../../indexdb/rooms/add_room";
import { back_store } from "./back_store";

export const rooms_store_utils = create_rooms_service_utils();

function create_rooms_service_utils() {
  return ({
    async add(rooms: RoomEntity[], accountId?: string): Promise<void> {
      for (let room of rooms) {
        back_store.rooms_by_id[room.id] = room as RoomEntityFull;
      }
    },

    async delete(ids: string[]) {
      for (let id of ids) {
        delete back_store.rooms_by_id[id];
      }
    },

    async getById(roomId: string): Promise<RoomEntityFull | null> {
      return back_store.rooms_by_id[roomId] || null;
    },

    async put(rooms: RoomEntityFull[]) {
      for (let room of rooms) {
        back_store.rooms_by_id[room.id] = room;
      }
    }
  })
};
