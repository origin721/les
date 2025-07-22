import type { RoomEntity, RoomEntityFull } from "../../indexdb/main_les_store_v1/entities/rooms/types";
import { back_store } from "./back_store";

export const rooms_store_utils = create_rooms_service_utils();

function create_rooms_service_utils() {
  return ({
    add(rooms: RoomEntityFull[]) {
      for (let room of rooms) {
        back_store.rooms_by_id[room.id] = room as RoomEntityFull;
      }
    },

    delete(ids: string[]) {
      for (let id of ids) {
        delete back_store.rooms_by_id[id];
      }
    },

    getById(roomId: string) {
      return back_store.rooms_by_id[roomId] || null;
    },

   //put(rooms: RoomEntityFull[]) {
   //  for (let room of rooms) {
   //    back_store.rooms_by_id[room.id] = room;
   //  }
   //}
  })
};
