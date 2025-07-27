//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import { gen_pass } from "../../../../core/random/gen_pass";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import {
  privateKeyToString,
  recommendedGenerateKeyPair,
} from "../../../../libs/libp2p";
import { prodError, prodInfo } from "../../../../core/debug/logger";
import { ACCOUNTS_VERSION } from "./constants";
import type { AccountEntity, HttpServerParam } from "./types";
import { entity_service } from "../entity_service/entity_service";
import { back_store } from "../../../../local_back/back_store";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { source_entity_service, type SaveEntityItem } from "../entity_service/source_entity_service";
import type { AccountEntityFull } from "./types/full_account_entity";

export async function add_accounts(new_list: AccountEntity[]) {
  const result: AccountEntityFull[] = [];
  const saveResult: SaveEntityItem[] = [];

  for (const item of new_list) {
    const newId = uuidv4();
    const libp2p_keyPair = await recommendedGenerateKeyPair();

    const entityForSave: AccountEntityFull = {
      ...item,
      id: newId,
      _pass: gen_pass(),
      _libp2p_keyPair: privateKeyToString(libp2p_keyPair),
      date_created: new Date(),
      friendsByIds: item.friendsByIds || [], // Инициализируем пустым массивом
      roomIds: item.roomIds || [], // Инициализируем пустым массивом
      version: ACCOUNTS_VERSION, // Версия внутри зашифрованных данных
    }

    saveResult.push({
      id: newId,
      data: JSON.stringify(entityForSave),
      pass: entityForSave.pass,
    });
    result.push(entityForSave)


  }

  await source_entity_service.add_encrypt_entities({
    table_name: TABLE_NAMES.accounts,
    new_list: saveResult,
  });

  accounts_store_utils.add(result);

  return result;
}
