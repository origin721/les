//import { AES } from "../../../crypt";
import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import { accounts_store_utils } from "../../../../local_back/back_store/accounts_store_utils";
import { back_store } from "../../../../local_back/back_store/back_store";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { source_entity_service } from "../entity_service/source_entity_service";
import type { HttpServerParam } from "./types";
import type { AccountEntityFull } from "./types/full_account_entity";


  // Оптимизированный возврат аккаунтов из оперативной памяти
  //return Promise.resolve(Object.values(back_store.accounts_by_id));

  // Старый код как пример брудфорса через IndexDB - больше не нужен,
  // так как можно оптимизировать и возвращать аккаунты из оперативки
export async function get_accounts(
): Promise<AccountEntityFull[]> {
  const result: AccountEntityFull[] = [];
  const passwords = new Set<string>();
  for (let ac of Object.values(back_store.accounts_by_id)) {
    passwords.add(ac.pass);
  }
  const passwordArray = [...passwords];

  async function decryptByPasses(cipherText: string) {
    for (const pass of passwordArray) {
      const _item = await decrypt_curve25519_from_pass({
        pass,
        cipherText: cipherText,
      });
      if (_item) return _item;
    }
  }

  await source_entity_service.get_all_entities({
    table_name: TABLE_NAMES.accounts,
    on: async ({ entity, onNext }) => {
      try {
        const _item = await decryptByPasses(entity.data);
        const decrData = !_item ? null : JSON.parse(_item);

        if (decrData) result.push(decrData);
      }
      catch (err) { }
      onNext();
    }
  });

  return result;

}
