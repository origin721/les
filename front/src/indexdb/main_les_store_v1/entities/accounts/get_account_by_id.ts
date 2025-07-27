//import { AES } from "../../../crypt";
import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import type { HttpServerParam } from "./types";
import { prodError } from "../../../../core/debug/logger";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { source_entity_service } from "../entity_service/source_entity_service";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";

export type Account = {
  namePub: string;
  // TODO: pass должен быть через нижнее подчёркивание _pass но похоже много где завязано без него, отрефачить
  pass: string;
  _libp2p_keyPair: string;
  id: string;
  httpServers: HttpServerParam[];
  date_created: Date;
  date_updated?: Date;
};

export function get_account_by_id(
  accId: string
): Promise<Account> {
  return source_entity_service.get_by_id_entity_with_decrypt({
    table_name: TABLE_NAMES.accounts,
    id: accId,
    pass: back_store.accounts_by_id[accId].pass,
  });
}
