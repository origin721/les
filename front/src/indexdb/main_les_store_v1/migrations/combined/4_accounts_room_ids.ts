import {
  prodInfo,
  prodError,
  devMigration,
} from "../../../../core/debug/logger";
import {
  decrypt_curve25519_from_pass,
  encrypt_curve25519_from_pass,
} from "../../../../core/crypt";
import type { MigrationContext } from "../../../db_state_manager_v1/constants";

/**
 * Информация о миграции
 */
export const migrationInfo = {
  version: 4,
  name: "accounts_room_ids",
  description: "Добавление поля roomIds к accounts",
  fileName: "4_accounts_room_ids.ts",
};

/**
 * Миграция схемы: без изменений схемы
 */
export function migrationScheme(db: IDBDatabase): void {
  prodInfo("📦 Выполняем миграцию схемы 4: без изменений");
  prodInfo("✅ Миграция схемы 4 завершена успешно");
}

/**
 * Миграция данных: добавление поля roomIds ко всем записям accounts
 */
export async function migrationData(context: MigrationContext): Promise<void> {
  const { db, currentUser } = context;
  prodInfo(
    `🔄 Выполняем миграцию данных 4 для пользователя: ${currentUser.id}`,
  );

  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allAccountRecords = getAllRequest.result;

          if (allAccountRecords.length === 0) {
            prodInfo(`✅ Нет записей accounts для миграции`);
            resolve();
            return;
          }

          prodInfo(`📋 Найдено ${allAccountRecords.length} записей accounts`);

          let migratedCount = 0;

          for (const record of allAccountRecords) {
            devMigration(`🔄 Проверяем запись account ${record.id}`);

            // Дешифруем данные
            const decryptedData = await decrypt_curve25519_from_pass({
              pass: currentUser.pass,
              cipherText: record.data,
            });

            if (!decryptedData) {
              prodError(`💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: account ${record.id}`);
              continue;
            }

            const accountData = JSON.parse(decryptedData);

            // Проверяем версию для предотвращения повторной миграции
            if (accountData.version >= 2) {
              devMigration(
                `⏭️ Запись account ${record.id} уже имеет версию ${accountData.version}`,
              );
              continue;
            }

            // Добавляем roomIds
            const updatedAccountData = {
              ...accountData,
              roomIds: [],
              version: 2,
              date_updated: new Date(),
            };

            // Шифруем обновленные данные
            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedAccountData),
            });

            // Обновляем запись в IndexedDB
            const updatedRecord = {
              id: record.id,
              data: encryptedData,
            };

            store.put(updatedRecord);
            migratedCount++;

            devMigration(`✅ Запись account ${record.id} обновлена с roomIds`);
          }

          transaction.oncomplete = function () {
            prodInfo(`✅ Миграция данных 4 завершена`);
            prodInfo(`📊 Мигрировано: ${migratedCount} accounts`);
            resolve();
          };

          transaction.onerror = function () {
            prodError(`❌ Ошибка транзакции при миграции:`, transaction.error);
            reject(transaction.error);
          };
        } catch (error) {
          prodError(`❌ Ошибка обработки данных:`, error);
          reject(error);
        }
      };

      getAllRequest.onerror = function () {
        prodError(`❌ Ошибка при чтении accounts:`, getAllRequest.error);
        reject(getAllRequest.error);
      };
    } catch (error) {
      prodError(`❌ Критическая ошибка в migrationData:`, error);
      reject(error);
    }
  });
}
