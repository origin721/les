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
import { ACCOUNTS_VERSION } from "../../../main_les_store_v1/entities/accounts/constants";

export const migrationInfo = {
  version: 2,
  name: "accounts_versioning",
  description: "Добавление поля version ко всем записям accounts",
  fileName: "2_accounts_versioning.ts",
};

export function migrationScheme(db: IDBDatabase): void {
  prodInfo("📦 Выполняем миграцию схемы 2: Схема не изменяется");
  // Схема остается той же, изменяются только данные
  prodInfo("✅ Миграция схемы 2 завершена успешно");
}

export async function migrationData(context: MigrationContext): Promise<void> {
  const { db, currentUser } = context;
  prodInfo(
    `🔄 Выполняем миграцию данных 2 для пользователя: ${currentUser.id}`,
  );

  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allAccountRecords = getAllRequest.result;

          // Фильтруем по текущему пользователю
          const userAccountRecords = allAccountRecords.filter(
            (record) => record.id === currentUser.id,
          );

          if (userAccountRecords.length === 0) {
            prodInfo(
              `✅ Нет аккаунтов для миграции для пользователя ${currentUser.id}`,
            );
            resolve();
            return;
          }

          prodInfo(
            `📋 Найдено ${userAccountRecords.length} записей аккаунтов для миграции`,
          );

          // Детальная статистика обработки
          let stats = {
            total: userAccountRecords.length,
            processed: 0,
            migrated: 0,
            corrupted: 0, // поврежденные данные
            foreign: 0, // чужие записи (для accounts всегда 0, т.к. уже отфильтровано)
            alreadyVersioned: 0, // уже с версией
            corruptedIds: [] as string[], // ID поврежденных записей
          };

          let migratedCount = 0;

          for (const record of userAccountRecords) {
            stats.processed++;
            devMigration(
              `🔄 Мигрируем аккаунт ${record.id} (${stats.processed}/${stats.total})`,
            );

            // Дешифруем данные
            const decryptedData = await decrypt_curve25519_from_pass({
              pass: currentUser.pass,
              cipherText: record.data,
            });

            if (!decryptedData) {
              stats.corrupted++;
              stats.corruptedIds.push(record.id);
              prodError(
                `💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: accounts ${record.id} для пользователя ${currentUser.id}`,
              );
              continue;
            }

            const accountData = JSON.parse(decryptedData);

            // Проверяем, есть ли уже поле version
            if (accountData.version !== undefined) {
              stats.alreadyVersioned++;
              devMigration(
                `⏭️ Аккаунт ${record.id} уже содержит поле version: ${accountData.version}, пропускаем`,
              );
              continue;
            }

            // Добавляем version
            const updatedAccountData = {
              ...accountData,
              version: ACCOUNTS_VERSION,
              date_updated: new Date(),
            };

            // Шифруем обновленные данные
            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedAccountData),
            });

            // Обновляем запись в IndexedDB (version теперь только внутри зашифрованных данных)
            const updatedRecord = {
              id: record.id,
              data: encryptedData,
            };

            store.put(updatedRecord);
            migratedCount++;
            stats.migrated++;

            devMigration(
              `✅ Аккаунт ${record.id} обновлен с version: ${ACCOUNTS_VERSION}`,
            );
          }

          transaction.oncomplete = function () {
            // Детальная статистика результатов
            prodInfo(
              `✅ Миграция данных 2 завершена для пользователя ${currentUser.id}`,
            );
            prodInfo(`📊 Статистика обработки accounts:`);
            prodInfo(`   - Всего записей: ${stats.total}`);
            prodInfo(`   - Обработано: ${stats.processed}`);
            prodInfo(`   - Мигрировано: ${stats.migrated}`);
            prodInfo(`   - Уже с версией: ${stats.alreadyVersioned}`);
            prodInfo(`   - Чужие записи: ${stats.foreign}`);
            prodInfo(`   - Поврежденные: ${stats.corrupted}`);

            if (stats.corruptedIds.length > 0) {
              prodError(
                `💥 ID поврежденных записей accounts:`,
                stats.corruptedIds,
              );
            }

            resolve();
          };

          transaction.onerror = function () {
            prodError(
              `❌ Ошибка транзакции при миграции для пользователя ${currentUser.id}:`,
              transaction.error,
            );
            reject(transaction.error);
          };
        } catch (error) {
          prodError(
            `❌ Ошибка обработки данных для пользователя ${currentUser.id}:`,
            error,
          );
          reject(error);
        }
      };

      getAllRequest.onerror = function () {
        prodError(
          `❌ Ошибка при чтении аккаунтов для пользователя ${currentUser.id}:`,
          getAllRequest.error,
        );
        reject(getAllRequest.error);
      };
    } catch (error) {
      prodError(
        `❌ Критическая ошибка в migrationData для пользователя ${currentUser.id}:`,
        error,
      );
      reject(error);
    }
  });
}
