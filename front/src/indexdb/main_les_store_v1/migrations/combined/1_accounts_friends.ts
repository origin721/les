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
import { FRIENDS_VERSION } from "../../../main_les_store_v1/entities/friends/constants";

/**
 * Информация о миграции
 */
export const migrationInfo = {
  version: 1,
  name: "accounts_friends",
  description: "Добавление поля version ко всем записям friends",
  fileName: "1_accounts_friends.ts",
};

/**
 * Миграция схемы: Добавление индексов и улучшений схемы
 */
export function migrationScheme(db: IDBDatabase): void {
  prodInfo("📦 Выполняем миграцию схемы 1: Добавление индексов");

  // Пример добавления индексов к существующим хранилищам
  // В данном случае схема уже создана в версии 0, так что индексы можно не добавлять
  // Но если нужно, то код был бы такой:

  // if (db.objectStoreNames.contains('accounts')) {
  //   const accountsStore = transaction.objectStore('accounts');
  //   if (!accountsStore.indexNames.contains('byEmail')) {
  //     accountsStore.createIndex('byEmail', 'email', { unique: true });
  //   }
  // }

  prodInfo("✅ Миграция схемы 1 завершена успешно");
}

/**
 * Миграция данных: добавление поля version ко всем записям friends
 */
export async function migrationData(context: MigrationContext): Promise<void> {
  const { db, currentUser } = context;
  prodInfo(
    `🔄 Выполняем миграцию данных 1 для пользователя: ${currentUser.id}`,
  );

  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["friends"], "readwrite");
      const store = transaction.objectStore("friends");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allFriendRecords = getAllRequest.result;

          if (allFriendRecords.length === 0) {
            prodInfo(
              `✅ Нет записей friends для миграции для пользователя ${currentUser.id}`,
            );
            resolve();
            return;
          }

          prodInfo(
            `📋 Найдено ${allFriendRecords.length} записей friends для проверки`,
          );

          // Детальная статистика обработки
          let stats = {
            total: allFriendRecords.length,
            processed: 0,
            migrated: 0,
            corrupted: 0, // поврежденные данные
            foreign: 0, // чужие записи
            alreadyVersioned: 0, // уже с версией
            corruptedIds: [] as string[], // ID поврежденных записей
          };

          let migratedCount = 0;

          for (const record of allFriendRecords) {
            stats.processed++;
            devMigration(
              `🔄 Проверяем запись friends ${record.id} (${stats.processed}/${stats.total})`,
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
                `💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: friends ${record.id} для аккаунта ${currentUser.id}`,
              );
              continue;
            }

            const friendData = JSON.parse(decryptedData);

            // Фильтруем по текущему пользователю
            if (friendData.myAccId !== currentUser.id) {
              stats.foreign++;
              devMigration(
                `👤 Запись friends ${record.id} принадлежит другому пользователю (${friendData.myAccId}), пропускаем`,
              );
              continue;
            }

            // Проверяем, есть ли уже поле version
            if (friendData.version !== undefined) {
              stats.alreadyVersioned++;
              devMigration(
                `⏭️ Запись friends ${record.id} уже содержит поле version: ${friendData.version}, пропускаем`,
              );
              continue;
            }

            // Добавляем version
            const updatedFriendData = {
              ...friendData,
              version: FRIENDS_VERSION,
              date_updated: new Date(),
            };

            // Шифруем обновленные данные
            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedFriendData),
            });

            // Обновляем запись в IndexedDB
            const updatedRecord = {
              id: record.id,
              data: encryptedData,
            };

            store.put(updatedRecord);
            migratedCount++;
            stats.migrated++;

            devMigration(
              `✅ Запись friends ${record.id} обновлена с version: ${FRIENDS_VERSION}`,
            );
          }

          transaction.oncomplete = function () {
            // Детальная статистика результатов
            prodInfo(
              `✅ Миграция данных 1 завершена для пользователя ${currentUser.id}`,
            );
            prodInfo(`📊 Статистика обработки friends:`);
            prodInfo(`   - Всего записей: ${stats.total}`);
            prodInfo(`   - Обработано: ${stats.processed}`);
            prodInfo(`   - Мигрировано: ${stats.migrated}`);
            prodInfo(`   - Уже с версией: ${stats.alreadyVersioned}`);
            prodInfo(`   - Чужие записи: ${stats.foreign}`);
            prodInfo(`   - Поврежденные: ${stats.corrupted}`);

            if (stats.corruptedIds.length > 0) {
              prodError(
                `💥 ID поврежденных записей friends:`,
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
          `❌ Ошибка при чтении friends для пользователя ${currentUser.id}:`,
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
