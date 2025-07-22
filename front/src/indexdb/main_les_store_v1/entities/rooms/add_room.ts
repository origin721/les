import { back_store } from "../../../../local_back/back_store/back_store";
import { prodError, prodInfo } from "../../../../core/debug/logger";
import { rooms_store_utils } from "../../../../local_back/back_store";
import { ROOMS_VERSION } from "./constants";
import type { RoomEntity, RoomEntityFull } from "./types";
import { entity_service } from "../entity_service/entity_service";

export type AddRoomParam = {
  new_rooms: RoomEntity[],
  explicit_my_acc_id:string;
}

export async function add_room({
  new_rooms,
  explicit_my_acc_id,
}: AddRoomParam): Promise<RoomEntityFull[]> {
  try {
    // Используем EntityService для добавления комнат
    return await entity_service.addEntities<
      RoomEntity,
      RoomEntityFull
    >({
      table_name: "rooms",
      new_list: new_rooms,
      entityVersion: ROOMS_VERSION,
      explicitMyAccId: explicit_my_acc_id,
    });

  } catch (error) {
    prodError(
      `❌ Ошибка добавления комнат для аккаунта ${explicit_my_acc_id || "auto"}:`,
      error,
    );
    throw error;
  }
}
