import { UserStateManager } from '../db_state_manager_v1/user_state_manager';

/**
 * Проверка готовности всех пользователей для безопасного удаления таблиц
 */
export class AllUsersChecker {
  /**
   * Сканировать accounts таблицу, получить все ID пользователей в системе
   */
  static async scanAllUserIds(db: IDBDatabase): Promise<Set<string>> {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['accounts'], 'readonly');
      const store = transaction.objectStore('accounts');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const accounts = request.result;
        const userIds = new Set(accounts.map((account: any) => account.id));
        resolve(userIds);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Проверить готовность всех пользователей для удаления таблицы
   */
  static async allUsersReady(db: IDBDatabase, version: number): Promise<boolean> {
    try {
      // 1. Получить всех пользователей из accounts таблицы
      const allSystemUserIds = await this.scanAllUserIds(db);
      
      // 2. Получить пользователей, завершивших миграцию
      const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
      
      // 3. Проверить что размеры равны И все элементы совпадают
      const result = allSystemUserIds.size === completedUserIds.size && 
                     [...allSystemUserIds].every(id => completedUserIds.has(id));
      
      console.log(`🔍 Проверка готовности всех пользователей для версии ${version}:`);
      console.log(`   - Всего пользователей в системе: ${allSystemUserIds.size}`);
      console.log(`   - Завершивших миграцию: ${completedUserIds.size}`);
      console.log(`   - Результат: ${result ? '✅ Все готовы' : '⏳ Ожидание'}`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Ошибка при проверке готовности пользователей:', error);
      return false;
    }
  }

  /**
   * Получить список пользователей, которые ещё не завершили миграцию
   */
  static async getPendingUsers(db: IDBDatabase, version: number): Promise<string[]> {
    const allSystemUserIds = await this.scanAllUserIds(db);
    const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
    
    return [...allSystemUserIds].filter(id => !completedUserIds.has(id));
  }

  /**
   * Получить детальную статистику готовности пользователей
   */
  static async getUserReadinessStats(db: IDBDatabase, version: number): Promise<{
    totalUsers: number;
    completedUsers: number;
    pendingUsers: string[];
    completionPercentage: number;
    isReady: boolean;
  }> {
    try {
      const allSystemUserIds = await this.scanAllUserIds(db);
      const completedUserIds = new Set(await UserStateManager.getUsersCompletedVersion(version));
      const pendingUsers = [...allSystemUserIds].filter(id => !completedUserIds.has(id));
      
      const totalUsers = allSystemUserIds.size;
      const completedUsers = completedUserIds.size;
      const completionPercentage = totalUsers > 0 ? Math.round((completedUsers / totalUsers) * 100) : 100;
      const isReady = totalUsers === completedUsers && totalUsers > 0;
      
      return {
        totalUsers,
        completedUsers,
        pendingUsers,
        completionPercentage,
        isReady
      };
      
    } catch (error) {
      console.error('❌ Ошибка получения статистики готовности пользователей:', error);
      return {
        totalUsers: 0,
        completedUsers: 0,
        pendingUsers: [],
        completionPercentage: 0,
        isReady: false
      };
    }
  }
}
