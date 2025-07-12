/**
 * Интеграция версионирования сущностей с логином пользователя
 * Обеспечивает проверку и миграцию сущностей при входе в систему
 */

import { prodInfo, prodError, debugLog } from '../../core/debug/logger';
import {
  getEntityVersion,
  setEntityVersion,
  needsMigration,
  initializeEntityVersionsForUser,
  getAllEntityVersions,
  updateMigrationProgress
} from './entity_versions_manager';
import type { EntityType } from './types';
import { CURRENT_ENTITY_VERSIONS } from './types';

/** Результат проверки миграций при логине */
export interface LoginMigrationResult {
  /** Нужны ли миграции */
  migrationsNeeded: boolean;
  /** Сущности, требующие миграции */
  entitiesToMigrate: EntityType[];
  /** Сводка версий до миграции */
  versionsBefore: Record<EntityType, number>;
  /** Время выполнения проверки в мс */
  checkDuration: number;
}

/** Прогресс миграции сущностей */
export interface EntityMigrationProgress {
  /** Текущая мигрируемая сущность */
  currentEntity?: EntityType;
  /** Завершенные сущности */
  completedEntities: EntityType[];
  /** Общий прогресс (0-100) */
  overallProgress: number;
  /** Сообщение о текущем действии */
  currentAction: string;
}

/**
 * Проверка необходимости миграций сущностей при логине
 */
export async function checkEntityMigrationsOnLogin(userId: string): Promise<LoginMigrationResult> {
  const startTime = Date.now();

  try {
    prodInfo('🔍 Проверка версий сущностей при логине:', { userId });

    const entityTypes: EntityType[] = ['accounts', 'rooms', 'friends'];
    const entitiesToMigrate: EntityType[] = [];
    const versionsBefore: Record<EntityType, number> = {} as any;

    // Проверяем каждую сущность
    for (const entityType of entityTypes) {
      const currentVersion = await getEntityVersion(userId, entityType);
      versionsBefore[entityType] = currentVersion;

      const needsUpdate = await needsMigration(userId, entityType);
      if (needsUpdate) {
        entitiesToMigrate.push(entityType);
      }
    }

    const checkDuration = Date.now() - startTime;
    const migrationsNeeded = entitiesToMigrate.length > 0;

    const result: LoginMigrationResult = {
      migrationsNeeded,
      entitiesToMigrate,
      versionsBefore,
      checkDuration
    };

    if (migrationsNeeded) {
      prodInfo('⚠️ Необходимы миграции сущностей:', {
        userId,
        entities: entitiesToMigrate,
        versions: versionsBefore
      });
    } else {
      prodInfo('✅ Все сущности актуальны:', { userId, versions: versionsBefore });
    }

    return result;
  } catch (error) {
    prodError('❌ Ошибка проверки миграций при логине:', { userId, error });
    throw error;
  }
}

/**
 * Выполнение миграций сущностей для пользователя
 */
export async function performEntityMigrations(
  userId: string,
  entitiesToMigrate: EntityType[],
  onProgress?: (progress: EntityMigrationProgress) => void
): Promise<void> {
  const startTime = Date.now();

  try {
    prodInfo('🚀 Начало миграций сущностей:', { userId, entities: entitiesToMigrate });

    const completedEntities: EntityType[] = [];
    const totalEntities = entitiesToMigrate.length;

    for (let i = 0; i < entitiesToMigrate.length; i++) {
      const entityType = entitiesToMigrate[i];
      const currentVersion = await getEntityVersion(userId, entityType);
      const targetVersion = CURRENT_ENTITY_VERSIONS[entityType];

      // Обновляем прогресс
      const progress: EntityMigrationProgress = {
        currentEntity: entityType,
        completedEntities: [...completedEntities],
        overallProgress: Math.round((i / totalEntities) * 100),
        currentAction: `Миграция ${entityType} с версии ${currentVersion} до ${targetVersion}`
      };

      onProgress?.(progress);

      // Отмечаем начало миграции
      await updateMigrationProgress(userId, entityType, {
        inProgress: targetVersion,
        migrationStartTime: Date.now()
      });

      try {
        // Выполняем миграцию сущности
        await migrateEntity(userId, entityType, currentVersion, targetVersion);

        // Обновляем версию и отмечаем завершение
        await setEntityVersion(userId, entityType, targetVersion, {
          totalRecords: await getEntityRecordsCount(userId, entityType),
          lastMigrationDuration: Date.now() - startTime
        });

        await updateMigrationProgress(userId, entityType, {
          inProgress: undefined,
          migrationStartTime: undefined
        });

        completedEntities.push(entityType);

        prodInfo('✅ Миграция сущности завершена:', {
          userId,
          entityType,
          fromVersion: currentVersion,
          toVersion: targetVersion
        });

      } catch (error) {
        prodError('❌ Ошибка миграции сущности:', { userId, entityType, error });

        // Отмечаем ошибку миграции
        await updateMigrationProgress(userId, entityType, {
          inProgress: undefined,
          migrationStartTime: undefined,
          failed: [targetVersion]
        });

        throw error;
      }
    }

    // Финальный прогресс
    const finalProgress: EntityMigrationProgress = {
      completedEntities,
      overallProgress: 100,
      currentAction: 'Миграции завершены'
    };

    onProgress?.(finalProgress);

    const totalDuration = Date.now() - startTime;
    prodInfo('🎉 Все миграции сущностей завершены:', {
      userId,
      entities: entitiesToMigrate,
      duration: totalDuration
    });

  } catch (error) {
    prodError('❌ Ошибка выполнения миграций сущностей:', { userId, error });
    throw error;
  }
}

/**
 * Миграция конкретной сущности
 */
async function migrateEntity(
  userId: string,
  entityType: EntityType,
  fromVersion: number,
  toVersion: number
): Promise<void> {
  // Пока заглушка - в будущем здесь будет реальная логика миграции
  // В зависимости от entityType и версий будут выполняться разные миграции

  debugLog('🔄 Выполнение миграции сущности:', {
    userId,
    entityType,
    fromVersion,
    toVersion
  });

  // Имитируем работу миграции
  await new Promise(resolve => setTimeout(resolve, 100));

  // TODO: Реализовать реальную логику миграции для каждого типа сущности
  switch (entityType) {
    case 'accounts':
      await migrateAccountsEntity(userId, fromVersion, toVersion);
      break;
    case 'rooms':
      await migrateRoomsEntity(userId, fromVersion, toVersion);
      break;
    case 'friends':
      await migrateFriendsEntity(userId, fromVersion, toVersion);
      break;
  }
}

/**
 * Миграция сущности accounts
 */
async function migrateAccountsEntity(userId: string, fromVersion: number, toVersion: number): Promise<void> {
  debugLog('📁 Миграция accounts:', { userId, fromVersion, toVersion });

  // TODO: Здесь будет логика миграции accounts
  // Например, обновление полей version и lastUpdated во всех записях
}

/**
 * Миграция сущности rooms
 */
async function migrateRoomsEntity(userId: string, fromVersion: number, toVersion: number): Promise<void> {
  debugLog('🏠 Миграция rooms:', { userId, fromVersion, toVersion });

  // TODO: Здесь будет логика миграции rooms
}

/**
 * Миграция сущности friends
 */
async function migrateFriendsEntity(userId: string, fromVersion: number, toVersion: number): Promise<void> {
  debugLog('👥 Миграция friends:', { userId, fromVersion, toVersion });

  // TODO: Здесь будет логика миграции friends
}

/**
 * Получение количества записей сущности для статистики
 */
async function getEntityRecordsCount(userId: string, entityType: EntityType): Promise<number> {
  // TODO: Реализовать получение реального количества записей
  return 0;
}

/**
 * Инициализация версий сущностей для нового пользователя
 */
export async function initializeEntityVersionsOnLogin(userId: string): Promise<void> {
  try {
    // Проверяем, есть ли уже записи для этого пользователя
    const existingVersions = await getAllEntityVersions(userId);

    if (existingVersions.length === 0) {
      prodInfo('🆕 Инициализация версий для нового пользователя:', userId);
      await initializeEntityVersionsForUser(userId);
    } else {
      debugLog('👤 Пользователь уже имеет записи версий:', {
        userId,
        existingCount: existingVersions.length
      });
    }
  } catch (error) {
    prodError('❌ Ошибка инициализации версий при логине:', { userId, error });
    throw error;
  }
}

/**
 * Полный процесс проверки и миграции при логине
 */
export async function handleEntityVersionsOnLogin(
  userId: string,
  onProgress?: (progress: EntityMigrationProgress) => void
): Promise<LoginMigrationResult> {
  try {
    prodInfo('🔑 Обработка версий сущностей при логине:', userId);

    // Инициализируем версии для нового пользователя
    await initializeEntityVersionsOnLogin(userId);

    // Проверяем необходимость миграций
    const migrationResult = await checkEntityMigrationsOnLogin(userId);

    // Выполняем миграции если нужно
    if (migrationResult.migrationsNeeded) {
      await performEntityMigrations(
        userId,
        migrationResult.entitiesToMigrate,
        onProgress
      );
    }

    return migrationResult;
  } catch (error) {
    prodError('❌ Ошибка обработки версий при логине:', { userId, error });
    throw error;
  }
}
