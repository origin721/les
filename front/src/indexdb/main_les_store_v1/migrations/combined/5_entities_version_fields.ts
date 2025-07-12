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

export const migrationInfo = {
  version: 5,
  name: "entities_version_fields",
  description:
    "Добавление полей version и lastUpdated ко всем сущностям (accounts, rooms, friends)",
  fileName: "5_entities_version_fields.ts",
};

export function migrationScheme(db: IDBDatabase): void {
  prodInfo("📦 Выполняем миграцию схемы 5: Схема не изменяется");
  // Схема остается той же, изменяются только данные
  prodInfo("✅ Миграция схемы 5 завершена успешно");
}

export async function migrationData(context: MigrationContext): Promise<void> {
  const { db, currentUser } = context;
  prodInfo(
    `🔄 Выполняем миграцию данных 5 для пользователя: ${currentUser.id}`,
  );

  const currentTimestamp = Date.now();
  const defaultVersion = 1;

  try {
    // Миграция accounts
    await migrateAccounts(db, currentUser, defaultVersion, currentTimestamp);

    // Миграция rooms
    await migrateRooms(db, currentUser, defaultVersion, currentTimestamp);

    // Миграция friends
    await migrateFriends(db, currentUser, defaultVersion, currentTimestamp);

    prodInfo(
      `✅ Миграция данных 5 завершена для пользователя ${currentUser.id}`,
    );
  } catch (error) {
    prodError(
      `❌ Ошибка миграции данных 5 для пользователя ${currentUser.id}:`,
      error,
    );
    throw error;
  }
}

async function migrateAccounts(
  db: IDBDatabase,
  currentUser: any,
  defaultVersion: number,
  currentTimestamp: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["accounts"], "readwrite");
      const store = transaction.objectStore("accounts");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allRecords = getAllRequest.result;
          const userRecords = allRecords.filter(
            (record) => record.id === currentUser.id,
          );

          if (userRecords.length === 0) {
            prodInfo(
              `✅ Нет accounts для миграции для пользователя ${currentUser.id}`,
            );
            resolve();
            return;
          }

          prodInfo(
            `📋 Найдено ${userRecords.length} записей accounts для миграции`,
          );

          let stats = {
            total: userRecords.length,
            processed: 0,
            migrated: 0,
            corrupted: 0,
            alreadyVersioned: 0,
            corruptedIds: [] as string[],
          };

          for (const record of userRecords) {
            stats.processed++;
            devMigration(
              `🔄 Мигрируем account ${record.id} (${stats.processed}/${stats.total})`,
            );

            const decryptedData = await decrypt_curve25519_from_pass({
              pass: currentUser.pass,
              cipherText: record.data,
            });

            if (!decryptedData) {
              stats.corrupted++;
              stats.corruptedIds.push(record.id);
              prodError(`💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: account ${record.id}`);
              continue;
            }

            const accountData = JSON.parse(decryptedData);

            // Проверяем, есть ли уже поля версионирования
            if (
              accountData.version !== undefined &&
              accountData.lastUpdated !== undefined
            ) {
              stats.alreadyVersioned++;
              devMigration(
                `⏭️ Account ${record.id} уже содержит поля версионирования, пропускаем`,
              );
              continue;
            }

            // Добавляем поля версионирования
            const updatedAccountData = {
              ...accountData,
              version: defaultVersion,
              lastUpdated: currentTimestamp,
              date_updated: new Date(),
            };

            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedAccountData),
            });

            const updatedRecord = {
              id: record.id,
              data: encryptedData,
            };

            store.put(updatedRecord);
            stats.migrated++;
            devMigration(
              `✅ Account ${record.id} обновлен с version: ${defaultVersion}`,
            );
          }

          transaction.oncomplete = function () {
            prodInfo(`✅ Миграция accounts завершена`);
            prodInfo(
              `📊 Статистика accounts: обработано ${stats.processed}, мигрировано ${stats.migrated}, уже с версией ${stats.alreadyVersioned}, поврежденные ${stats.corrupted}`,
            );
            if (stats.corruptedIds.length > 0) {
              prodError(`💥 ID поврежденных accounts:`, stats.corruptedIds);
            }
            resolve();
          };

          transaction.onerror = function () {
            prodError(`❌ Ошибка транзакции accounts:`, transaction.error);
            reject(transaction.error);
          };
        } catch (error) {
          prodError(`❌ Ошибка обработки accounts:`, error);
          reject(error);
        }
      };

      getAllRequest.onerror = function () {
        prodError(`❌ Ошибка чтения accounts:`, getAllRequest.error);
        reject(getAllRequest.error);
      };
    } catch (error) {
      prodError(`❌ Критическая ошибка миграции accounts:`, error);
      reject(error);
    }
  });
}

async function migrateRooms(
  db: IDBDatabase,
  currentUser: any,
  defaultVersion: number,
  currentTimestamp: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["rooms"], "readwrite");
      const store = transaction.objectStore("rooms");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allRecords = getAllRequest.result;
          const userRecords = allRecords.filter((record) =>
            record.id.startsWith(currentUser.id),
          );

          if (userRecords.length === 0) {
            prodInfo(
              `✅ Нет rooms для миграции для пользователя ${currentUser.id}`,
            );
            resolve();
            return;
          }

          prodInfo(
            `📋 Найдено ${userRecords.length} записей rooms для миграции`,
          );

          let stats = {
            total: userRecords.length,
            processed: 0,
            migrated: 0,
            corrupted: 0,
            alreadyVersioned: 0,
            corruptedIds: [] as string[],
          };

          for (const record of userRecords) {
            stats.processed++;
            devMigration(
              `🔄 Мигрируем room ${record.id} (${stats.processed}/${stats.total})`,
            );

            const decryptedData = await decrypt_curve25519_from_pass({
              pass: currentUser.pass,
              cipherText: record.data,
            });

            if (!decryptedData) {
              stats.corrupted++;
              stats.corruptedIds.push(record.id);
              prodError(`💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: room ${record.id}`);
              continue;
            }

            const roomData = JSON.parse(decryptedData);

            // Проверяем, есть ли уже поля версионирования
            if (
              roomData.version !== undefined &&
              roomData.lastUpdated !== undefined
            ) {
              stats.alreadyVersioned++;
              devMigration(
                `⏭️ Room ${record.id} уже содержит поля версионирования, пропускаем`,
              );
              continue;
            }

            // Добавляем поля версионирования
            const updatedRoomData = {
              ...roomData,
              version: defaultVersion,
              lastUpdated: currentTimestamp,
            };

            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedRoomData),
            });

            const updatedRecord = {
              id: record.id,
              data: encryptedData,
            };

            store.put(updatedRecord);
            stats.migrated++;
            devMigration(
              `✅ Room ${record.id} обновлен с version: ${defaultVersion}`,
            );
          }

          transaction.oncomplete = function () {
            prodInfo(`✅ Миграция rooms завершена`);
            prodInfo(
              `📊 Статистика rooms: обработано ${stats.processed}, мигрировано ${stats.migrated}, уже с версией ${stats.alreadyVersioned}, поврежденные ${stats.corrupted}`,
            );
            if (stats.corruptedIds.length > 0) {
              prodError(`💥 ID поврежденных rooms:`, stats.corruptedIds);
            }
            resolve();
          };

          transaction.onerror = function () {
            prodError(`❌ Ошибка транзакции rooms:`, transaction.error);
            reject(transaction.error);
          };
        } catch (error) {
          prodError(`❌ Ошибка обработки rooms:`, error);
          reject(error);
        }
      };

      getAllRequest.onerror = function () {
        prodError(`❌ Ошибка чтения rooms:`, getAllRequest.error);
        reject(getAllRequest.error);
      };
    } catch (error) {
      prodError(`❌ Критическая ошибка миграции rooms:`, error);
      reject(error);
    }
  });
}

async function migrateFriends(
  db: IDBDatabase,
  currentUser: any,
  defaultVersion: number,
  currentTimestamp: number,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["friends"], "readwrite");
      const store = transaction.objectStore("friends");
      const getAllRequest = store.getAll();

      getAllRequest.onsuccess = async function () {
        try {
          const allRecords = getAllRequest.result;
          const userRecords = allRecords.filter((record) =>
            record.id.startsWith(currentUser.id),
          );

          if (userRecords.length === 0) {
            prodInfo(
              `✅ Нет friends для миграции для пользователя ${currentUser.id}`,
            );
            resolve();
            return;
          }

          prodInfo(
            `📋 Найдено ${userRecords.length} записей friends для миграции`,
          );

          let stats = {
            total: userRecords.length,
            processed: 0,
            migrated: 0,
            corrupted: 0,
            alreadyVersioned: 0,
            corruptedIds: [] as string[],
          };

          for (const record of userRecords) {
            stats.processed++;
            devMigration(
              `🔄 Мигрируем friend ${record.id} (${stats.processed}/${stats.total})`,
            );

            const decryptedData = await decrypt_curve25519_from_pass({
              pass: currentUser.pass,
              cipherText: record.data,
            });

            if (!decryptedData) {
              stats.corrupted++;
              stats.corruptedIds.push(record.id);
              prodError(`💥 ПОВРЕЖДЕННЫЕ ДАННЫЕ: friend ${record.id}`);
              continue;
            }

            const friendData = JSON.parse(decryptedData);

            // Проверяем, есть ли уже поля версионирования
            if (
              friendData.version !== undefined &&
              friendData.lastUpdated !== undefined
            ) {
              stats.alreadyVersioned++;
              devMigration(
                `⏭️ Friend ${record.id} уже содержит поля версионирования, пропускаем`,
              );
              continue;
            }

            // Добавляем поля версионирования
            const updatedFriendData = {
              ...friendData,
              version: defaultVersion,
              lastUpdated: currentTimestamp,
            };

            const encryptedData = await encrypt_curve25519_from_pass({
              pass: currentUser.pass,
              message: JSON.stringify(updatedFriendData),
            });

            const updatedRecord = {
              id: record.id,
              data: encryptedData,
            };

            store.put(updatedRecord);
            stats.migrated++;
            devMigration(
              `✅ Friend ${record.id} обновлен с version: ${defaultVersion}`,
            );
          }

          transaction.oncomplete = function () {
            prodInfo(`✅ Миграция friends завершена`);
            prodInfo(
              `📊 Статистика friends: обработано ${stats.processed}, мигрировано ${stats.migrated}, уже с версией ${stats.alreadyVersioned}, поврежденные ${stats.corrupted}`,
            );
            if (stats.corruptedIds.length > 0) {
              prodError(`💥 ID поврежденных friends:`, stats.corruptedIds);
            }
            resolve();
          };

          transaction.onerror = function () {
            prodError(`❌ Ошибка транзакции friends:`, transaction.error);
            reject(transaction.error);
          };
        } catch (error) {
          prodError(`❌ Ошибка обработки friends:`, error);
          reject(error);
        }
      };

      getAllRequest.onerror = function () {
        prodError(`❌ Ошибка чтения friends:`, getAllRequest.error);
        reject(getAllRequest.error);
      };
    } catch (error) {
      prodError(`❌ Критическая ошибка миграции friends:`, error);
      reject(error);
    }
  });
}
