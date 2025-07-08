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
import { ROOMS_VERSION } from "../../../main_les_store_v1/entities/rooms/constants";

export const migrationInfo = {
  version: 3,
  name: "rooms_versioning",
  description: "Добавление поля version ко всем записям rooms",
  fileName: "3_rooms_versioning.ts",
};

export function migrationScheme(db: IDBDatabase): void {
  prodInfo("📦 Выполняем миграцию схемы 3: Схема не изменяется");
  // Схема остается той же, изменяются только данные
  prodInfo("✅ Миграция схемы 3 завершена успешно");
}

export async function migrationData(context: MigrationContext): Promise<void> {
  const { db, currentUser } = context;
  prodInfo(
    `🔄 Выполняем миграцию данных 3 для пользователя: ${currentUser.id}`,
  );

  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["rooms"], "readwrite");
      const store = transaction.objectStore("rooms");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allRoomRecords = getAllRequest.result;

          if (allRoomRecords.length === 0) {
            prodInfo(
              `✅ Нет записей rooms для миграции для пользователя ${currentUser.id}`,
            );
            resolve();
            return;
          }

          prodInfo(
            `📋 Найдено ${allRoomRecords.length} записей rooms для проверки`,
          );

          // Детальная статистика обработки
          let stats = {
            total: allRoomRecords.length,
            processed: 0,
            migrated: 0,
            corrupted: 0, // поврежденные данные
            foreign: 0, // чужие записи
            alreadyVersioned: 0, // уже с версией
            corruptedIds: [] as string[], // ID поврежденных записей
          };

          let migratedCount = 0;

          for (const record of allRoomRecords) {
            stats.processed++;
            devMigration(
              `🔄 Проверяем запись rooms ${record.id} (${stats.processed}/${stats.total})`,
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
                `💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: rooms ${record.id} для аккаунта ${currentUser.id}`,
              );
              continue;
            }

            const roomData = JSON.parse(decryptedData);

            // Фильтруем по текущему пользователю
            if (roomData.myAccId !== currentUser.id) {
              stats.foreign++;
              devMigration(
                `👤 Запись rooms ${record.id} принадлежит другому пользователю (${roomData.myAccId}), пропускаем`,
              );
              continue;
            }

            // Проверяем, есть ли уже поле version
            if (roomData.version !== undefined) {
              stats.alreadyVersioned++;
              devMigration(
                `⏭️ Запись rooms ${record.id} уже содержит поле version: ${roomData.version}, пропускаем`,
              );
              continue;
            }

            // Добавляем version
            const updatedRoomData = {
              ...roomData,
              version: ROOMS_VERSION,
              date_updated: new Date(),
            };

            // Шифруем обновленные данные
            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedRoomData),
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
              `✅ Запись rooms ${record.id} обновлена с version: ${ROOMS_VERSION}`,
            );
          }

          transaction.oncomplete = function () {
            // Детальная статистика результатов
            prodInfo(
              `✅ Миграция данных 3 завершена для пользователя ${currentUser.id}`,
            );
            prodInfo(`📊 Статистика обработки rooms:`);
            prodInfo(`   - Всего записей: ${stats.total}`);
            prodInfo(`   - Обработано: ${stats.processed}`);
            prodInfo(`   - Мигрировано: ${stats.migrated}`);
            prodInfo(`   - Уже с версией: ${stats.alreadyVersioned}`);
            prodInfo(`   - Чужие записи: ${stats.foreign}`);
            prodInfo(`   - Поврежденные: ${stats.corrupted}`);

            if (stats.corruptedIds.length > 0) {
              prodError(
                `💥 ID поврежденных записей rooms:`,
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
          `❌ Ошибка при чтении rooms для пользователя ${currentUser.id}:`,
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
