import { indexdb_wrapper } from "../../indexdb_wrapper";
import { prodInfo, devDB } from "../../../../core/debug/logger";
import { back_store } from "../../../../local_back/back_store";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { source_entity_service } from "../entity_service/source_entity_service";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { friend_by_ids_utils } from "../friends/friend_by_ids_utils";


export async function delete_accounts(ids: string[]) {
  for(const idItem of ids) {
    //const acc = back_store.accounts_by_id[idItem];
    //debugger

    //console.log({back_store});

    const friends_by_id = back_store.friends_ids_by_accounts_id[idItem];

    //console.log({friends_by_id});
    
    await friend_by_ids_utils.delete(
      [friends_by_id.id],
      idItem,
    );
  }

  const deletedItems = await source_entity_service.delete_entities({
    table_name: TABLE_NAMES.accounts,
    ids,
  });

  accounts_store_utils.delete(ids);

  return deletedItems;
}
