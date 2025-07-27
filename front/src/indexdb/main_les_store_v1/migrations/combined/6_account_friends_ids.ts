import {
  prodInfo,
  prodError,
  devMigration,
  devDB,
} from "../../../../core/debug/logger";
import {
  decrypt_curve25519_from_pass,
  encrypt_curve25519_from_pass,
} from "../../../../core/crypt";
import type { MigrationContext } from "../../../db_state_manager_v1/constants";
import { TABLE_NAMES } from "../../entities/constats/TABLE_NAMES";

export const migrationInfo = {
  version: 5,
  name: "account_friends_ids",
  description:
    "Добавление полей связи полей с друзьями и акаунтами",
  fileName: "6_account_friends_ids.ts",
};

export function migrationScheme(db: IDBDatabase): void {
  prodInfo("📦 Выполняем миграцию схемы 5: Схема не изменяется");
  // Схема остается той же, изменяются только данные
  prodInfo("✅ Миграция схемы 5 завершена успешно");

  if (!db.objectStoreNames.contains(TABLE_NAMES.friends_ids)) {
    db.createObjectStore(TABLE_NAMES.friends_ids, { keyPath: 'id' });
    devDB(`✅ Хранилище ${TABLE_NAMES.friends_ids} создано`);
  }
}

export async function migrationData(context: MigrationContext): Promise<void> {
  return;

}
