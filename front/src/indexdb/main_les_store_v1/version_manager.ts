import { prodInfo, prodError, debugLog } from '../../core/debug/logger';

/**
 * Менеджер версионирования записей в IndexedDB
 */
export class VersionManager {
  
  /**
   * Добавление поля version ко всем записям в store
   */
  static async addVersionToAllRecords(
    db: IDBDatabase, 
    storeName: string, 
    version: number
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        prodInfo(`🔄 Добавление версии ${version} ко всем записям в ${storeName}...`);
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        let processedCount = 0;
        let updatedCount = 0;
        
        // Получаем все записи
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;
          processedCount = records.length;
          
          if (records.length === 0) {
            prodInfo(`✅ Store ${storeName} пуст, версионирование не требуется`);
            resolve();
            return;
          }
          
          // Обрабатываем каждую запись
          let pendingUpdates = 0;
          
          records.forEach(record => {
            // Добавляем версию только если ее еще нет
            if (!record.hasOwnProperty('version')) {
              record.version = version;
              pendingUpdates++;
              
              const putRequest = store.put(record);
              
              putRequest.onsuccess = () => {
                updatedCount++;
                pendingUpdates--;
                
                // Если все обновления завершены
                if (pendingUpdates === 0) {
                  prodInfo(`✅ Версионирование ${storeName} завершено:`, {
                    processed: processedCount,
                    updated: updatedCount,
                    version
                  });
                  resolve();
                }
              };
              
              putRequest.onerror = () => {
                prodError(`❌ Ошибка обновления записи в ${storeName}:`, putRequest.error);
                reject(putRequest.error);
              };
            }
          });
          
          // Если не было записей для обновления
          if (pendingUpdates === 0) {
            prodInfo(`✅ Все записи в ${storeName} уже имеют версию`);
            resolve();
          }
        };
        
        getAllRequest.onerror = () => {
          prodError(`❌ Ошибка получения записей из ${storeName}:`, getAllRequest.error);
          reject(getAllRequest.error);
        };
        
        transaction.onerror = () => {
          prodError(`❌ Ошибка транзакции версионирования ${storeName}:`, transaction.error);
          reject(transaction.error);
        };
        
      } catch (error) {
        prodError(`❌ Критическая ошибка версионирования ${storeName}:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Проверка версий записей при следующем открытии
   */
  static async validateRecordVersions(
    db: IDBDatabase, 
    expectedVersion: number
  ): Promise<boolean> {
    try {
      prodInfo(`🔍 Проверка версий записей, ожидаемая версия: ${expectedVersion}`);
      
      const storeNames = Array.from(db.objectStoreNames);
      let allValid = true;
      const validationResults: Array<{
        storeName: string;
        totalRecords: number;
        recordsWithoutVersion: number;
        recordsWithOldVersion: number;
        isValid: boolean;
      }> = [];
      
      for (const storeName of storeNames) {
        const result = await this.validateStoreVersions(db, storeName, expectedVersion);
        validationResults.push(result);
        
        if (!result.isValid) {
          allValid = false;
        }
      }
      
      // Логируем результаты
      if (allValid) {
        prodInfo('✅ Все записи имеют корректные версии');
      } else {
        prodInfo('⚠️ Обнаружены записи с некорректными версиями:', validationResults);
      }
      
      return allValid;
      
    } catch (error) {
      prodError('❌ Ошибка проверки версий записей:', error);
      return false;
    }
  }
  
  /**
   * Проверка версий записей в конкретном store
   */
  private static async validateStoreVersions(
    db: IDBDatabase, 
    storeName: string, 
    expectedVersion: number
  ): Promise<{
    storeName: string;
    totalRecords: number;
    recordsWithoutVersion: number;
    recordsWithOldVersion: number;
    isValid: boolean;
  }> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;
          let recordsWithoutVersion = 0;
          let recordsWithOldVersion = 0;
          
          records.forEach(record => {
            if (!record.hasOwnProperty('version')) {
              recordsWithoutVersion++;
            } else if (record.version < expectedVersion) {
              recordsWithOldVersion++;
            }
          });
          
          const isValid = recordsWithoutVersion === 0 && recordsWithOldVersion === 0;
          
          resolve({
            storeName,
            totalRecords: records.length,
            recordsWithoutVersion,
            recordsWithOldVersion,
            isValid
          });
        };
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Массовое обновление версий во всех stores
   */
  static async updateAllStoresVersions(
    db: IDBDatabase, 
    newVersion: number,
    storeNames?: string[]
  ): Promise<void> {
    try {
      const targetStores = storeNames || Array.from(db.objectStoreNames);
      
      prodInfo(`🔄 Массовое обновление версий до ${newVersion} в stores:`, targetStores);
      
      for (const storeName of targetStores) {
        await this.addVersionToAllRecords(db, storeName, newVersion);
      }
      
      prodInfo(`✅ Массовое обновление версий завершено для ${targetStores.length} stores`);
      
    } catch (error) {
      prodError('❌ Ошибка массового обновления версий:', error);
      throw error;
    }
  }
  
  /**
   * Получение статистики версий по всем stores
   */
  static async getVersionStats(db: IDBDatabase): Promise<{
    stores: Array<{
      name: string;
      totalRecords: number;
      versionsDistribution: Record<string, number>;
      recordsWithoutVersion: number;
    }>;
    summary: {
      totalStores: number;
      totalRecords: number;
      totalWithoutVersion: number;
    };
  }> {
    try {
      const storeNames = Array.from(db.objectStoreNames);
      const stores = [];
      let totalRecords = 0;
      let totalWithoutVersion = 0;
      
      for (const storeName of storeNames) {
        const stats = await this.getStoreVersionStats(db, storeName);
        stores.push(stats);
        totalRecords += stats.totalRecords;
        totalWithoutVersion += stats.recordsWithoutVersion;
      }
      
      return {
        stores,
        summary: {
          totalStores: storeNames.length,
          totalRecords,
          totalWithoutVersion
        }
      };
      
    } catch (error) {
      prodError('❌ Ошибка получения статистики версий:', error);
      return {
        stores: [],
        summary: { totalStores: 0, totalRecords: 0, totalWithoutVersion: 0 }
      };
    }
  }
  
  /**
   * Получение статистики версий для конкретного store
   */
  private static async getStoreVersionStats(
    db: IDBDatabase, 
    storeName: string
  ): Promise<{
    name: string;
    totalRecords: number;
    versionsDistribution: Record<string, number>;
    recordsWithoutVersion: number;
  }> {
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;
          const versionsDistribution: Record<string, number> = {};
          let recordsWithoutVersion = 0;
          
          records.forEach(record => {
            if (!record.hasOwnProperty('version')) {
              recordsWithoutVersion++;
            } else {
              const version = String(record.version);
              versionsDistribution[version] = (versionsDistribution[version] || 0) + 1;
            }
          });
          
          resolve({
            name: storeName,
            totalRecords: records.length,
            versionsDistribution,
            recordsWithoutVersion
          });
        };
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Удаление поля version из всех записей (для тестирования/отката)
   */
  static async removeVersionFromAllRecords(
    db: IDBDatabase, 
    storeName: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        prodInfo(`🔄 Удаление поля version из всех записей в ${storeName}...`);
        
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        
        const getAllRequest = store.getAll();
        
        getAllRequest.onsuccess = () => {
          const records = getAllRequest.result;
          let processedCount = 0;
          let updatedCount = 0;
          
          if (records.length === 0) {
            prodInfo(`✅ Store ${storeName} пуст`);
            resolve();
            return;
          }
          
          records.forEach(record => {
            if (record.hasOwnProperty('version')) {
              delete record.version;
              
              const putRequest = store.put(record);
              
              putRequest.onsuccess = () => {
                updatedCount++;
                processedCount++;
                
                if (processedCount === records.length) {
                  prodInfo(`✅ Удаление версий из ${storeName} завершено:`, {
                    updated: updatedCount
                  });
                  resolve();
                }
              };
              
              putRequest.onerror = () => {
                reject(putRequest.error);
              };
            } else {
              processedCount++;
              
              if (processedCount === records.length) {
                resolve();
              }
            }
          });
        };
        
        getAllRequest.onerror = () => {
          reject(getAllRequest.error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
}
