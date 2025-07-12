/**
 * Менеджер для работы с версиями сущностей
 * Управляет отдельной базой данных для отслеживания версий сущностей по пользователям
 */

import { prodInfo, prodError, debugLog } from "../../core/debug/logger";
import { back_store } from "../../local_back/back_store/back_store";
import type {
  EntityVersionRecord,
  EntityType,
  EntityMigrationProgress,
  EntityMigrationStatus,
} from "./types";
import {
  ENTITY_VERSIONS_CONSTANTS,
  CURRENT_ENTITY_VERSIONS,
  createEntityVersionId,
} from "./types";

/**
 * Открытие базы данных версий сущностей
 */
function openEntityVersionsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(
      ENTITY_VERSIONS_CONSTANTS.DB_NAME,
      ENTITY_VERSIONS_CONSTANTS.VERSION,
    );

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Создаем store для версий сущностей
      if (
        !db.objectStoreNames.contains(
          ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
        )
      ) {
        const store = db.createObjectStore(
          ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
          { keyPath: "id" },
        );

        // Индекс по userId для быстрого поиска всех сущностей пользователя
        store.createIndex("userId", "userId", { unique: false });

        prodInfo("✅ Создано хранилище entity_versions");
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Получить версию сущности для пользователя
 */
export async function getEntityVersion(
  userId: string,
  entityType: EntityType,
): Promise<number> {
  try {
    const db = await openEntityVersionsDB();
    const transaction = db.transaction(
      [ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS],
      "readonly",
    );
    const store = transaction.objectStore(
      ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
    );

    const id = createEntityVersionId(userId, entityType);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const record = request.result as EntityVersionRecord | undefined;
        resolve(record?.lastVersion || 0);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    prodError("❌ Ошибка получения версии сущности:", {
      userId,
      entityType,
      error,
    });
    return 0; // По умолчанию версия 0
  }
}

/**
 * Установить версию сущности для пользователя
 */
export async function setEntityVersion(
  userId: string,
  entityType: EntityType,
  version: number,
  debugInfo?: EntityVersionRecord["debugInfo"],
): Promise<void> {
  try {
    const db = await openEntityVersionsDB();
    const transaction = db.transaction(
      [ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS],
      "readwrite",
    );
    const store = transaction.objectStore(
      ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
    );

    const id = createEntityVersionId(userId, entityType);

    // Получаем существующую запись или создаем новую
    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const existingRecord = getRequest.result as
          | EntityVersionRecord
          | undefined;

        const record: EntityVersionRecord = {
          id,
          userId,
          entityType,
          lastVersion: version,
          migrationProgress: existingRecord?.migrationProgress || {
            completed: [],
            failed: [],
          },
          lastUpdated: Date.now(),
          debugInfo,
        };

        // Добавляем версию в completed если её там нет
        if (!record.migrationProgress.completed.includes(version)) {
          record.migrationProgress.completed.push(version);
          record.migrationProgress.completed.sort((a, b) => a - b);
        }

        const putRequest = store.put(record);

        putRequest.onsuccess = () => {
          prodInfo("✅ Версия сущности обновлена:", {
            userId,
            entityType,
            version,
          });
          resolve();
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  } catch (error) {
    prodError("❌ Ошибка установки версии сущности:", {
      userId,
      entityType,
      version,
      error,
    });
    throw error;
  }
}

/**
 * Проверить, нужна ли миграция для сущности
 */
export async function needsMigration(
  userId: string,
  entityType: EntityType,
): Promise<boolean> {
  const currentVersion = await getEntityVersion(userId, entityType);
  const targetVersion = CURRENT_ENTITY_VERSIONS[entityType];

  return currentVersion < targetVersion;
}

/**
 * Обновить прогресс миграции
 */
export async function updateMigrationProgress(
  userId: string,
  entityType: EntityType,
  updates: Partial<EntityMigrationProgress>,
): Promise<void> {
  try {
    const db = await openEntityVersionsDB();
    const transaction = db.transaction(
      [ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS],
      "readwrite",
    );
    const store = transaction.objectStore(
      ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
    );

    const id = createEntityVersionId(userId, entityType);
    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const record = getRequest.result as EntityVersionRecord | undefined;

        if (!record) {
          reject(new Error(`Запись версии не найдена: ${id}`));
          return;
        }

        // Обновляем прогресс миграции
        record.migrationProgress = {
          ...record.migrationProgress,
          ...updates,
        };
        record.lastUpdated = Date.now();

        const putRequest = store.put(record);

        putRequest.onsuccess = () => {
          debugLog("📊 Прогресс миграции обновлен:", {
            userId,
            entityType,
            updates,
          });
          resolve();
        };

        putRequest.onerror = () => {
          reject(putRequest.error);
        };
      };

      getRequest.onerror = () => {
        reject(getRequest.error);
      };
    });
  } catch (error) {
    prodError("❌ Ошибка обновления прогресса миграции:", {
      userId,
      entityType,
      error,
    });
    throw error;
  }
}

/**
 * Получить все версии сущностей для пользователя (для отладки)
 */
export async function getAllEntityVersions(
  userId: string,
): Promise<EntityVersionRecord[]> {
  try {
    const db = await openEntityVersionsDB();
    const transaction = db.transaction(
      [ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS],
      "readonly",
    );
    const store = transaction.objectStore(
      ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
    );
    const index = store.index("userId");

    const request = index.getAll(userId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        resolve(request.result as EntityVersionRecord[]);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  } catch (error) {
    prodError("❌ Ошибка получения всех версий сущностей:", { userId, error });
    return [];
  }
}

/**
 * Получить сводку версий для отладки
 */
export async function getEntityVersionsSummary(userId: string): Promise<{
  accounts: number;
  rooms: number;
  friends: number;
}> {
  try {
    const [accountsVersion, roomsVersion, friendsVersion] = await Promise.all([
      getEntityVersion(userId, "accounts"),
      getEntityVersion(userId, "rooms"),
      getEntityVersion(userId, "friends"),
    ]);

    return {
      accounts: accountsVersion,
      rooms: roomsVersion,
      friends: friendsVersion,
    };
  } catch (error) {
    prodError("❌ Ошибка получения сводки версий:", { userId, error });
    return {
      accounts: 0,
      rooms: 0,
      friends: 0,
    };
  }
}

/**
 * Инициализация версий сущностей для нового пользователя
 */
export async function initializeEntityVersionsForUser(
  userId: string,
): Promise<void> {
  try {
    await Promise.all([
      setEntityVersion(userId, "accounts", CURRENT_ENTITY_VERSIONS.accounts),
      setEntityVersion(userId, "rooms", CURRENT_ENTITY_VERSIONS.rooms),
      setEntityVersion(userId, "friends", CURRENT_ENTITY_VERSIONS.friends),
    ]);

    prodInfo("✅ Версии сущностей инициализированы для пользователя:", userId);
  } catch (error) {
    prodError("❌ Ошибка инициализации версий сущностей:", { userId, error });
    throw error;
  }
}

/**
 * Сброс заблокированных миграций (для восстановления)
 */
export async function resetStuckMigrations(userId: string): Promise<void> {
  try {
    const records = await getAllEntityVersions(userId);
    const db = await openEntityVersionsDB();
    const transaction = db.transaction(
      [ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS],
      "readwrite",
    );
    const store = transaction.objectStore(
      ENTITY_VERSIONS_CONSTANTS.STORES.ENTITY_VERSIONS,
    );

    for (const record of records) {
      if (record.migrationProgress.inProgress) {
        record.migrationProgress.inProgress = undefined;
        record.migrationProgress.migrationStartTime = undefined;
        record.lastUpdated = Date.now();

        store.put(record);
      }
    }

    prodInfo("🔄 Сброшены заблокированные миграции для пользователя:", userId);
  } catch (error) {
    prodError("❌ Ошибка сброса заблокированных миграций:", { userId, error });
    throw error;
  }
}

/**
 * Тип для статистики версий сущностей
 */
export type EntityVersionStats = {
  version: number;
  count: number;
};

/**
 * Тип для результата анализа версий всех сущностей
 */
export type EntityVersionsAnalysis = {
  accounts: EntityVersionStats[];
  rooms: EntityVersionStats[];
  friends: EntityVersionStats[];
};

/**
 * Получить статистику версий сущностей из back_store (оперативной памяти)
 * Анализирует реальные данные и подсчитывает количество записей по версиям
 */
export function getEntityVersions(): EntityVersionsAnalysis {
  try {
    // Анализируем аккаунты
    const accountsStats = new Map<number, number>();
    for (const account of Object.values(back_store.accounts_by_id)) {
      const version = account.version || 0;
      accountsStats.set(version, (accountsStats.get(version) || 0) + 1);
    }

    // Анализируем комнаты
    const roomsStats = new Map<number, number>();
    for (const room of Object.values(back_store.rooms_by_id)) {
      const version = room.version || 0;
      roomsStats.set(version, (roomsStats.get(version) || 0) + 1);
    }

    // Анализируем друзей
    const friendsStats = new Map<number, number>();
    for (const friend of Object.values(back_store.friends_by_id)) {
      const version = friend.version || 0;
      friendsStats.set(version, (friendsStats.get(version) || 0) + 1);
    }

    // Преобразуем Map в массивы и сортируем по версиям
    const result: EntityVersionsAnalysis = {
      accounts: Array.from(accountsStats.entries())
        .map(([version, count]) => ({ version, count }))
        .sort((a, b) => a.version - b.version),

      rooms: Array.from(roomsStats.entries())
        .map(([version, count]) => ({ version, count }))
        .sort((a, b) => a.version - b.version),

      friends: Array.from(friendsStats.entries())
        .map(([version, count]) => ({ version, count }))
        .sort((a, b) => a.version - b.version),
    };

    prodInfo("📊 Анализ версий сущностей завершен:", {
      accountsTotal: Object.keys(back_store.accounts_by_id).length,
      roomsTotal: Object.keys(back_store.rooms_by_id).length,
      friendsTotal: Object.keys(back_store.friends_by_id).length,
      result,
    });

    return result;
  } catch (error) {
    prodError("❌ Ошибка анализа версий сущностей:", error);
    return {
      accounts: [],
      rooms: [],
      friends: [],
    };
  }
}
