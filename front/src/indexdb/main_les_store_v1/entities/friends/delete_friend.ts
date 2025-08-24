import { indexdb_wrapper } from "../../indexdb_wrapper";
import { back_store } from "../../../../local_back/back_store/back_store";
import { prodError, prodInfo, devDB } from "../../../../core/debug/logger";
import { entity_service } from "../entity_service/entity_service";
import { friends_store_utils } from "../../../../local_back/back_store/friends_store_utils";
import { friend_by_ids_utils } from "./friend_by_ids_utils";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";

export async function delete_friend(
  friendIds: string[]
): Promise<void> {
  await friend_by_ids_utils.delete_friend(friendIds);

  await entity_service.delete_entities({
    ids: friendIds,
    table_name: TABLE_NAMES.friends,
  });

  friends_store_utils.delete(friendIds);
}
