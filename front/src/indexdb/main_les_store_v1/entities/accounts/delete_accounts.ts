import { indexdb_wrapper } from "../../indexdb_wrapper";
import { prodInfo, devDB } from "../../../../core/debug/logger";
import { back_store } from "../../../../local_back/back_store";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { source_entity_service } from "../entity_service/source_entity_service";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";


export async function delete_accounts(ids: string[]) {
  const deletedItems = await source_entity_service.delete_entities({
    table_name: TABLE_NAMES.accounts,
    ids,
  });

  accounts_store_utils.delete(ids);

  return deletedItems;
}
