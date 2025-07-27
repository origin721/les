//import { AES } from "../../../core/crypt";
import { decrypt_curve25519_from_pass } from "../../../../core/crypt";
import type { AccountEntityFull } from "./types/full_account_entity";
import { source_entity_service } from "../entity_service/source_entity_service";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";

export async function login(
  pass: string
): Promise<AccountEntityFull[]> {
  const result: AccountEntityFull[] = [];

  await source_entity_service.get_all_entities({
    table_name: TABLE_NAMES.accounts,
    on: async ({ entity, onNext }) => {
      try {
        const _item = await decrypt_curve25519_from_pass({
          pass,
          cipherText: entity.data,
        });
        const decrData = !_item ? null : JSON.parse(_item);

        if (decrData) result.push(decrData);
        pass
      }
      catch(err) { }
      onNext();
    }
  });

  return result;

}
