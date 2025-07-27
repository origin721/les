//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { HttpServerParam, AccountEntityPut } from "./types";
import { ACCOUNTS_VERSION } from "./constants";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { source_entity_service, type SaveEntityItem } from "../entity_service/source_entity_service";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import type { AccountEntityFull } from "./types/full_account_entity";

export async function put_accounts(new_list: AccountEntityFull[]) {
  const saveItems: SaveEntityItem[] = [];
  const result: AccountEntityFull[] = [];

  for (let item of new_list) {
    const existingAccount = back_store.accounts_by_id[item.id];
    if (!existingAccount) {
      throw new Error(`Account ${item.id} not found in back_store`);
    }

    // Объединяем существующие данные с новыми
    const updatedAccount = {
      ...existingAccount,
      ...item,
      date_updated: new Date(),
      version: ACCOUNTS_VERSION, // Версия внутри зашифрованных данных
    };

    result.push(updatedAccount);

    saveItems.push({
      id: updatedAccount.id,
      data: JSON.stringify(updatedAccount),
      pass: updatedAccount.pass,
    });

  }

  accounts_store_utils.add(result);

  await source_entity_service.put_encrypt_entities({
    table_name: TABLE_NAMES.accounts,
    new_list: saveItems,
  });

  return result;
}
