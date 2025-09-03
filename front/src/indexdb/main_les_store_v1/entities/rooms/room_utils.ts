import { rooms_store_utils } from "../../../../local_back/back_store";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { entity_service } from "../entity_service/entity_service";
import type { RoomEntityFull } from "./types";

export const room_utils = {
  get_by_id: get_room_by_id,
}

async function get_room_by_id({
  room_id,
  explicitMyAccId,
}: {
  room_id: string;
  explicitMyAccId: string;
}): Promise<RoomEntityFull | null> {
  const foundRoom = await entity_service.get_entity_by_id<RoomEntityFull>({
    table_name: TABLE_NAMES.rooms,
    id: room_id,
    explicitMyAccId,
  });

  if(foundRoom) {
    rooms_store_utils.add([foundRoom]);
  }

  return foundRoom;  
}