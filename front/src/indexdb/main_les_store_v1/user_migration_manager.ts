import { UserStateManager } from '../db_state_manager_v1/user_state_manager';
import { MIGRATIONS_REGISTRY } from './migrations/MIGRATIONS_REGISTRY';
import { getMaxVersion } from './migrations/migrations';
import type { MigrationContext, UserMigrationRecord } from '../db_state_manager_v1/constants';

/**
 * Интерфейс модуля миграции с версией (временный, до обновления основного types.ts)
 */
interface MigrationModule {
  migrationInfo: {
    version: number;
    name: string;
    description: string;
    fileName: string;
  };
  migrationScheme?: (db: IDBDatabase) => void;
  migrationData?: (context: MigrationContext) => Promise<void>;
  version: number; // Добавляем поле версии
}

/**
 * Менеджер миграций для конкретных пользователей
 * Основная логика пользователь-центричной архитектуры
 */
export class UserMigrationManager {
  /**
   * Асинхронно загружает модуль миграции
   */
  private static async loadMigrationModule(version: number): Promise<MigrationModule> {
    const fileName = MIGRATIONS_REGISTRY[version];
    
    if (!fileName) {
      throw new Error(`Миграция для версии ${version} не найдена в реестре`);
    }

    try {
      console.log(`🔄 Загружаем модуль миграции: ${fileName}`);
      
      // Динамический импорт модуля миграции
      const module = await import(`./migrations/combined/${fileName}.ts`);
      
      if (!module.migrationInfo) {
        throw new Error(`Модуль миграции ${fileName} не содержит migrationInfo`);
      }
      
      console.log(`✅ Модуль миграции ${fileName} загружен успешно`);
      return module as MigrationModule;
      
    } catch (error) {
      console.error(`❌ Ошибка загрузки модуля миграции ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Получить все доступные миграции
   */
  static async getAllMigrations(): Promise<MigrationModule[]> {
    const migrations: MigrationModule[] = [];
    
    for (const version of Object.keys(MIGRATIONS_REGISTRY).map(Number)) {
      try {
        const migration = await this.loadMigrationModule(version);
        migrations.push({
          ...migration,
          version: version + 1 // Версия миграции на 1 больше индекса
        });
      } catch (error) {
        console.error(`Не удалось загрузить миграцию версии ${version}:`, error);
      }
    }
    
    return migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Проверить какие миграции нужно выполнить для пользователя
   */
  static async checkUserMigrations(userId: string): Promise<number[]> {
    const userState = await UserStateManager.getUserState(userId);
    const currentVersion = userState?.currentVersion || 0;
    
    const maxVersion = getMaxVersion();
    
    const neededMigrations: number[] = [];
    for (let version = currentVersion + 1; version <= maxVersion; version++) {
      if (!userState?.completedMigrations?.includes(version)) {
        neededMigrations.push(version);
      }
    }
    
    return neededMigrations;
  }

  /**
   * Выполнить миграции для конкретного пользователя
   */
  static async migrateUser(context: MigrationContext): Promise<void> {
    const { currentUser, db, oldVersion, newVersion } = context;
    const userId = currentUser.id;
    
    console.log(`🔄 Начинаем миграцию пользователя ${userId} с версии ${oldVersion} до ${newVersion}`);
    
    // Отметить начало миграции
    await UserStateManager.updateUserState(userId, {
      migrationStartTime: Date.now(),
      currentVersion: oldVersion
    });

    try {
      const neededMigrations = await this.checkUserMigrations(userId);
      
      for (const version of neededMigrations) {
        if (version > newVersion) break;
        
        await this.executeUserMigration(context, version);
        
        // Отметить завершение конкретной версии
        const userState = await UserStateManager.getUserState(userId) || {
          userId,
          currentVersion: oldVersion,
          completedMigrations: [],
          migrationHistory: []
        };
        
        await UserStateManager.updateUserState(userId, {
          currentVersion: version,
          completedMigrations: [...userState.completedMigrations, version]
        });
      }

      // Отметить завершение всей миграции
      await UserStateManager.updateUserState(userId, {
        migrationEndTime: Date.now(),
        currentVersion: newVersion
      });

      console.log(`✅ Миграция пользователя ${userId} завершена успешно`);
      
    } catch (error) {
      console.error(`❌ Ошибка миграции пользователя ${userId}:`, error);
      
      await UserStateManager.updateUserState(userId, {
        migrationEndTime: Date.now(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      });
      
      throw error;
    }
  }

  /**
   * Выполнить конкретную миграцию для пользователя
   */
  private static async executeUserMigration(context: MigrationContext, version: number): Promise<void> {
    const { currentUser } = context;
    
    console.log(`📦 Выполняем миграцию версии ${version} для пользователя ${currentUser.id}`);
    
    const startTime = Date.now();
    
    // Загрузить миграцию динамически
    const migrationIndex = version - 1; // Версия миграции на 1 больше индекса
    const migration = await this.loadMigrationModule(migrationIndex);
    
    if (!migration) {
      throw new Error(`Миграция версии ${version} не найдена`);
    }

    // Выполнить migrationData с контекстом пользователя
    if (migration.migrationData) {
      await migration.migrationData(context);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`✅ Миграция версии ${version} для пользователя ${currentUser.id} завершена за ${duration}мс`);
    
    // Записать в историю
    const userState = await UserStateManager.getUserState(currentUser.id);
    if (userState) {
      const historyEntry = {
        version,
        fileName: migration.migrationInfo?.fileName || `migration_${version}`,
        schemaDuration: 0, // Schema уже выполнена глобально
        dataDuration: duration,
        startTime,
        endTime
      };
      
      await UserStateManager.updateUserState(currentUser.id, {
        migrationHistory: [...userState.migrationHistory, historyEntry]
      });
    }
  }

  /**
   * Проверить что ВСЕ пользователи прошли определенную версию (для удаления таблиц)
   */
  static async allUsersCompletedVersion(version: number): Promise<boolean> {
    // Получить всех пользователей из accounts таблицы
    const allSystemUserIds = await this.scanAllUserIds();
    
    // Получить пользователей, завершивших версию
    const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
    
    // Проверить что размеры равны И все элементы совпадают
    return allSystemUserIds.size === completedUserIds.size && 
           [...allSystemUserIds].every(id => completedUserIds.has(id));
  }

  /**
   * Сканировать accounts таблицу для получения всех ID пользователей
   * TODO: Реализовать под конкретную структуру accounts таблицы
   */
  private static async scanAllUserIds(): Promise<Set<string>> {
    // Временная заглушка - нужно будет реализовать под конкретную структуру
    console.warn('⚠️ scanAllUserIds() требует реализации под конкретную структуру accounts');
    return new Set<string>();
  }

  /**
   * Получить статистику миграций пользователя
   */
  static async getUserMigrationStats(userId: string): Promise<UserMigrationRecord | null> {
    return await UserStateManager.getUserState(userId);
  }
}
