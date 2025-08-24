import { back_store } from "../../../../local_back/back_store";
import { room_ids_store_utils } from "../../../../local_back/back_store/room_ids_store_utils";
import { put_accounts } from "../accounts/put_accounts";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { entity_service } from "../entity_service/entity_service";
import { FRIENDS_VERSION } from "../friends/constants";
import type { RoomIdsEntity } from "./types/RoomIdsEntity";
import type { RoomIdsEntityFull } from "./types/RoomIdsEntityFull";

export const room_by_ids_utils = {
  add_room_ids,
};

type ServiceParams = {
  list: RoomIdsEntity[];
  explicitMyAccId: string,
}

export async function add_room_ids({
  list,
  explicitMyAccId: explicitMyAccId,
}:ServiceParams): Promise<RoomIdsEntityFull[]> {
  const newFriends = await entity_service.addEntities<
    RoomIdsEntity,
    RoomIdsEntityFull
  >({
    table_name: TABLE_NAMES.friends_ids,
    new_list: list,
    explicitMyAccId: explicitMyAccId,
    entityVersion: FRIENDS_VERSION,
  });

  room_ids_store_utils.add(newFriends);

  for(const el of newFriends) {
    const acc = back_store.accounts_by_id[el.explicitMyAccId];
    if (acc) {
      //acc.friendsIdJoin = el.id;
      await put_accounts([{
        ...acc,
        roomsIdJoin: el.id,
      }]);
    }

  }



  return newFriends;
}
