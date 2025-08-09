import { indexdb_wrapper } from "../../indexdb_wrapper";
import { prodInfo, devDB } from "../../../../core/debug/logger";
import { back_store } from "../../../../local_back/back_store";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { source_entity_service } from "../entity_service/source_entity_service";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { friend_by_ids_utils } from "../friends/friend_by_ids_utils";


export async function delete_accounts(ids: string[]) {
  for(const idItem of ids) {
    await friend_by_ids_utils.delete([
      back_store.accounts_by_id[idItem].friendsIdJoin
    ]);
  }

  const deletedItems = await source_entity_service.delete_entities({
    table_name: TABLE_NAMES.accounts,
    ids,
  });

  accounts_store_utils.delete(ids);

  return deletedItems;
}
