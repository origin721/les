import { back_store } from "../../../../local_back/back_store";
import { room_ids_store_utils } from "../../../../local_back/back_store/room_ids_store_utils";
import { put_accounts } from "../accounts/put_accounts";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { entity_service } from "../entity_service/entity_service";
import { FRIENDS_VERSION } from "../friends/constants";
import type { RoomIdsEntity } from "../rooms/types/RoomIdsEntity";
import type { RoomIdsEntityFull } from "../rooms/types/RoomIdsEntityFull";
import { ACCOUNTS_ROOMS_VERSION } from "./ACCOUNTS_ROOMS_VERSION";

export const accounts_rooms_service = {
  add: add_accounts_rooms,
};

type ServiceParams = {
  list: RoomIdsEntity[];
  explicitMyAccId: string,
}

export async function add_accounts_rooms({
  list,
  explicitMyAccId: explicitMyAccId,
}:ServiceParams): Promise<RoomIdsEntityFull[]> {
  const newFriends = await entity_service.addEntities<
    RoomIdsEntity,
    RoomIdsEntityFull
  >({
    table_name: TABLE_NAMES.accounts_rooms,
    new_list: list,
    explicitMyAccId: explicitMyAccId,
    entityVersion: ACCOUNTS_ROOMS_VERSION,
  });

  room_ids_store_utils.add(newFriends);

  for(const el of newFriends) {
    const acc = back_store.accounts_by_id[el.explicitMyAccId];
    if (acc) {
      //acc.friendsIdJoin = el.id;
      await put_accounts([{
        ...acc,
        accounts_rooms_id: el.id,
      }]);
    }

  }



  return newFriends;
}

async function delete_by_ids(acc_rooms_ids: string[]) {
  await entity_service.delete_entities({
    ids: acc_rooms_ids,
    table_name: TABLE_NAMES.accounts_rooms,
  });

  await friend_ids_store_utils.delete(acc_rooms_ids);
}