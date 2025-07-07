import { prodInfo, prodError, debugLog } from '../../core/debug/logger';
import { DB_NAMES } from '../constants';
import { 
  detectStuckMigrations, 
  resetStuckMigration, 
  getDbState,
  getAllDbStates 
} from '../db_state_manager_v1/db_state_manager';
import { getCurrentDbVersion } from './migrations/migrations';

/**
 * Менеджер восстановления после сбоев миграций
 */
export class RecoveryManager {
  
  /**
   * Проверка при старте приложения
   */
  static async checkOnAppStart(): Promise<void> {
    try {
      prodInfo('🔍 Проверка состояния баз данных при старте...');
      
      // Проверяем все базы данных на зависшие миграции
      const allStates = await getAllDbStates();
      
      for (const state of allStates) {
        const isStuck = await detectStuckMigrations(state.dbName);
        
        if (isStuck) {
          prodInfo('⚠️ Обнаружена зависшая миграция, попытка восстановления:', state.dbName);
          await this.recoverFromIncompleteUpdate(state.dbName);
        } else {
          await this.validateVersionConsistency(state.dbName);
        }
      }
      
      prodInfo('✅ Проверка состояния баз данных завершена');
    } catch (error) {
      prodError('❌ Ошибка при проверке на старте приложения:', error);
      // Не прерываем работу приложения из-за ошибки восстановления
    }
  }
  
  /**
   * Восстановление после некорректного завершения
   */
  static async recoverFromIncompleteUpdate(dbName: string): Promise<void> {
    try {
      prodInfo('🔄 Начало восстановления после некорректного завершения:', dbName);
      
      // Получаем текущее состояние
      const state = await getDbState(dbName);
      if (!state) {
        prodInfo('ℹ️ Состояние БД не найдено, восстановление не требуется:', dbName);
        return;
      }
      
      // Проверяем, действительно ли миграция зависла
      const isStuck = await detectStuckMigrations(dbName);
      if (!isStuck) {
        prodInfo('ℹ️ Миграция не зависла, восстановление не требуется:', dbName);
        return;
      }
      
      // Получаем реальную версию БД
      const realDbVersion = await getCurrentDbVersion(dbName);
      prodInfo('📊 Сравнение версий для восстановления:', {
        dbName,
        stateVersion: state.version,
        realDbVersion,
        targetVersion: state.targetVersion
      });
      
      // Если реальная версия БД совпадает с целевой, миграция на самом деле завершилась успешно
      if (state.targetVersion && realDbVersion >= state.targetVersion) {
        prodInfo('✅ Миграция была завершена успешно, обновляем статус:', dbName);
        await resetStuckMigration(dbName);
        return;
      }
      
      // Иначе сбрасываем зависшую миграцию
      await resetStuckMigration(dbName);
      prodInfo('🔄 Восстановление завершено, миграция сброшена:', dbName);
      
    } catch (error) {
      prodError('❌ Ошибка при восстановлении после некорректного завершения:', error);
      
      // В крайнем случае принудительно сбрасываем статус
      try {
        await resetStuckMigration(dbName);
        prodInfo('🔄 Принудительный сброс статуса выполнен:', dbName);
      } catch (resetError) {
        prodError('❌ Критическая ошибка при принудительном сбросе:', resetError);
      }
    }
  }
  
  /**
   * Проверка согласованности версий между состоянием и реальной БД
   */
  static async validateVersionConsistency(dbName: string): Promise<boolean> {
    try {
      const state = await getDbState(dbName);
      if (!state) {
        return true; // Новая БД, согласованность не требуется
      }
      
      const realDbVersion = await getCurrentDbVersion(dbName);
      
      if (state.version !== realDbVersion) {
        prodInfo('⚠️ Обнаружено рассогласование версий:', {
          dbName,
          stateVersion: state.version,
          realDbVersion
        });
        
        // Если реальная версия больше, обновляем состояние
        if (realDbVersion > state.version) {
          state.version = realDbVersion;
          await import('../db_state_manager_v1/db_state_manager').then(({ updateDbState }) => 
            updateDbState(state)
          );
          prodInfo('✅ Версия в состоянии обновлена до реальной:', realDbVersion);
        }
        
        return false;
      }
      
      return true;
    } catch (error) {
      prodError('❌ Ошибка проверки согласованности версий:', error);
      return false;
    }
  }
  
  /**
   * Проверка целостности данных
   */
  static async validateDataIntegrity(db: IDBDatabase): Promise<boolean> {
    try {
      prodInfo('🔍 Проверка целостности данных БД:', db.name);
      
      // Проверяем, что все обязательные stores существуют
      const { REQUIRED_STORES } = await import('./REQUIRED_STORES');
      const missingStores = REQUIRED_STORES.filter(storeName => 
        !db.objectStoreNames.contains(storeName)
      );
      
      if (missingStores.length > 0) {
        prodError('❌ Отсутствуют обязательные object stores:', missingStores);
        return false;
      }
      
      // Проверяем доступность stores для чтения
      let integrityValid = true;
      
      for (const storeName of REQUIRED_STORES) {
        try {
          const transaction = db.transaction([storeName], 'readonly');
          const store = transaction.objectStore(storeName);
          
          // Пытаемся получить количество записей
          const countRequest = store.count();
          await new Promise((resolve, reject) => {
            countRequest.onsuccess = () => resolve(countRequest.result);
            countRequest.onerror = () => reject(countRequest.error);
          });
          
        } catch (error) {
          prodError(`❌ Ошибка доступа к store ${storeName}:`, error);
          integrityValid = false;
        }
      }
      
      if (integrityValid) {
        prodInfo('✅ Проверка целостности данных пройдена:', db.name);
      } else {
        prodError('❌ Обнаружены проблемы целостности данных:', db.name);
      }
      
      return integrityValid;
      
    } catch (error) {
      prodError('❌ Ошибка при проверке целостности данных:', error);
      return false;
    }
  }
  
  /**
   * Принудительная очистка всех зависших миграций (для экстренных случаев)
   */
  static async forceResetAllStuckMigrations(): Promise<void> {
    try {
      prodInfo('🚨 Принудительный сброс всех зависших миграций...');
      
      const allStates = await getAllDbStates();
      let resetCount = 0;
      
      for (const state of allStates) {
        const isStuck = await detectStuckMigrations(state.dbName);
        if (isStuck) {
          await resetStuckMigration(state.dbName);
          resetCount++;
        }
      }
      
      prodInfo(`✅ Принудительно сброшено миграций: ${resetCount}`);
    } catch (error) {
      prodError('❌ Ошибка при принудительном сбросе всех миграций:', error);
    }
  }
  
  /**
   * Получение диагностической информации
   */
  static async getDiagnosticInfo(): Promise<{
    databases: Array<{
      name: string;
      stateVersion: number;
      realVersion: number;
      isStuck: boolean;
      versionConsistent: boolean;
    }>;
    summary: {
      total: number;
      stuck: number;
      inconsistent: number;
    };
  }> {
    try {
      const allStates = await getAllDbStates();
      const databases = [];
      let stuckCount = 0;
      let inconsistentCount = 0;
      
      for (const state of allStates) {
        const isStuck = await detectStuckMigrations(state.dbName);
        const realVersion = await getCurrentDbVersion(state.dbName);
        const versionConsistent = state.version === realVersion;
        
        if (isStuck) stuckCount++;
        if (!versionConsistent) inconsistentCount++;
        
        databases.push({
          name: state.dbName,
          stateVersion: state.version,
          realVersion,
          isStuck,
          versionConsistent
        });
      }
      
      return {
        databases,
        summary: {
          total: databases.length,
          stuck: stuckCount,
          inconsistent: inconsistentCount
        }
      };
    } catch (error) {
      prodError('❌ Ошибка получения диагностической информации:', error);
      return {
        databases: [],
        summary: { total: 0, stuck: 0, inconsistent: 0 }
      };
    }
  }
}
