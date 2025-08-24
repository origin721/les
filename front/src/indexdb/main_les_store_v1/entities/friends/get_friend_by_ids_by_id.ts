import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { friend_ids_store_utils } from "../../../../local_back/back_store/friend_ids_store_utils";
import { friends_store_utils } from "../../../../local_back/back_store/friends_store_utils";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { entity_service } from "../entity_service/entity_service";
import type { FriendEntityFull } from "./types";
import type { FriendIdsEntityFull } from "./types/FriendIdsEntityFull";

export async function get_friend_by_ids_by_id({
  id,
  explicitMyAccId,
}: {
  id: string;
  explicitMyAccId: string;
}): Promise<FriendIdsEntityFull | null> {
  const foundFriend = await entity_service.get_entity_by_id<FriendIdsEntityFull>({
    table_name: TABLE_NAMES.friends_ids,
    id: id,
    explicitMyAccId,
  });

  if(foundFriend) {
    friend_ids_store_utils.add([foundFriend]);
  }

  return foundFriend;

}
