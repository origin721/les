import { devLog, prodInfo } from "../../core/debug/logger";
//import { add_room, type AddRoomParam } from "../../indexdb/main_les_store_v1/entities/rooms/add_room";
import type { RoomEntity } from "../../indexdb/main_les_store_v1/entities/rooms/types";
import { rooms_store_utils } from "../back_store";

export const rooms_service = {
  async add_rooms(addRoomParam: any) {
    //const addedRooms = await add_room(addRoomParam);

    rooms_store_utils.add(addedRooms);

    devLog(
      `✅ Добавлено ${addedRooms.length} комнат для аккаунта ${addRoomParam.explicit_my_acc_id || "auto"}`,
    );
    //return ;
  }
}