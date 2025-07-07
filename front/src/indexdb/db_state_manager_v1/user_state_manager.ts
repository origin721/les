import { USER_MIGRATION_CONSTANTS, type UserMigrationRecord } from './constants';

/**
 * Менеджер состояний для пользователь-центричных миграций
 * База состояний версии 2 с поддержкой множественных пользователей
 */
export class UserStateManager {
  private static dbPromise: Promise<IDBDatabase> | null = null;

  /**
   * Получить соединение с базой состояний v2
   */
  private static async getDatabase(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(USER_MIGRATION_CONSTANTS.DB_NAME, USER_MIGRATION_CONSTANTS.VERSION);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains(USER_MIGRATION_CONSTANTS.STORE_NAME)) {
            const store = db.createObjectStore(USER_MIGRATION_CONSTANTS.STORE_NAME, { keyPath: 'userId' });
            store.createIndex('userId', 'userId', { unique: true });
            store.createIndex('currentVersion', 'currentVersion', { unique: false });
          }
        };
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
    return this.dbPromise;
  }

  /**
   * Получить состояние миграций пользователя
   */
  static async getUserState(userId: string): Promise<UserMigrationRecord | null> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.get(userId);
      
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Обновить состояние миграций пользователя
   */
  static async updateUserState(userId: string, record: Partial<UserMigrationRecord>): Promise<void> {
    const db = await this.getDatabase();
    const existingRecord = await this.getUserState(userId) || {
      userId,
      currentVersion: 0,
      completedMigrations: [],
      migrationHistory: []
    };

    const updatedRecord: UserMigrationRecord = { ...existingRecord, ...record };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readwrite');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.put(updatedRecord);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить список пользователей, завершивших определенную версию
   */
  static async getUsersCompletedVersion(version: number): Promise<string[]> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.getAll();
      
      request.onsuccess = () => {
        const records: UserMigrationRecord[] = request.result;
        const completedUsers = records
          .filter(record => record.completedMigrations.includes(version))
          .map(record => record.userId);
        resolve(completedUsers);
      };
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Получить всех пользователей в системе состояний
   */
  static async getAllSystemUserIds(): Promise<string[]> {
    const db = await this.getDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([USER_MIGRATION_CONSTANTS.STORE_NAME], 'readonly');
      const store = transaction.objectStore(USER_MIGRATION_CONSTANTS.STORE_NAME);
      const request = store.getAllKeys();
      
      request.onsuccess = () => resolve(request.result as string[]);
      request.onerror = () => reject(request.error);
    });
  }
}
