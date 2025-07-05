import { DB_NAMES, DB_UPDATE_STATUS, type DbStateRecord, type DbUpdateStatus } from '../constants';
import { prodInfo, prodError, debugLog } from '../../core/debug/logger';

/**
 * Версия схемы базы состояний
 */
const DB_STATE_MANAGER_VERSION = 1;

/**
 * Открывает базу данных состояний
 */
function openStateDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAMES.DB_STATE_MANAGER, DB_STATE_MANAGER_VERSION);
    
    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Создаем store для состояний баз данных
      if (!db.objectStoreNames.contains('db_states')) {
        const store = db.createObjectStore('db_states', { keyPath: 'id' });
        prodInfo('✅ Создано хранилище db_states');
      }
    };
    
    request.onsuccess = () => {
      resolve(request.result);
    };
    
    request.onerror = () => {
      prodError('❌ Ошибка открытия базы состояний:', request.error);
      reject(request.error);
    };
  });
}

/**
 * Получает состояние базы данных по имени
 */
export async function getDbState(dbName: string): Promise<DbStateRecord | null> {
  try {
    const db = await openStateDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['db_states'], 'readonly');
      const store = transaction.objectStore('db_states');
      const request = store.get(dbName);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    prodError('❌ Ошибка получения состояния БД:', error);
    return null;
  }
}

/**
 * Обновляет состояние базы данных
 */
export async function updateDbState(stateRecord: DbStateRecord): Promise<void> {
  try {
    const db = await openStateDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['db_states'], 'readwrite');
      const store = transaction.objectStore('db_states');
      
      stateRecord.lastUpdated = Date.now();
      const request = store.put(stateRecord);
      
      request.onsuccess = () => {
        prodInfo('✅ Состояние БД обновлено:', {
          dbName: stateRecord.dbName,
          version: stateRecord.version,
          status: stateRecord.status
        });
        resolve();
      };
      
      request.onerror = () => {
        prodError('❌ Ошибка обновления состояния БД:', request.error);
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    prodError('❌ Критическая ошибка обновления состояния БД:', error);
    throw error;
  }
}

/**
 * Устанавливает статус обновления базы данных
 */
export async function setUpdateStatus(
  dbName: string, 
  status: DbUpdateStatus, 
  version?: number, 
  targetVersion?: number,
  errorMessage?: string
): Promise<void> {
  try {
    // Получаем текущее состояние или создаем новое
    let stateRecord = await getDbState(dbName);
    
    if (!stateRecord) {
      stateRecord = {
        id: dbName,
        dbName,
        version: version || 0,
        status,
        lastUpdated: Date.now()
      };
    } else {
      stateRecord.status = status;
      if (version !== undefined) stateRecord.version = version;
      if (targetVersion !== undefined) stateRecord.targetVersion = targetVersion;
      if (errorMessage !== undefined) stateRecord.errorMessage = errorMessage;
    }
    
    await updateDbState(stateRecord);
  } catch (error) {
    prodError('❌ Ошибка установки статуса обновления:', error);
    throw error;
  }
}

/**
 * Получает предыдущую версию базы данных для планирования миграций
 */
export async function getPreviousDbVersion(dbName: string): Promise<number> {
  const state = await getDbState(dbName);
  return state?.version || 0;
}

/**
 * Проверяет, можно ли начать обновление базы данных
 */
export async function canStartUpdate(dbName: string): Promise<boolean> {
  const state = await getDbState(dbName);
  
  if (!state) return true; // Новая база, можно создавать
  
  // Можно обновлять если статус не "update_started"
  return state.status !== DB_UPDATE_STATUS.UPDATE_STARTED;
}

/**
 * Получает все состояния баз данных для отладки
 */
export async function getAllDbStates(): Promise<DbStateRecord[]> {
  try {
    const db = await openStateDatabase();
    
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['db_states'], 'readonly');
      const store = transaction.objectStore('db_states');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
      
      transaction.oncomplete = () => {
        db.close();
      };
    });
  } catch (error) {
    prodError('❌ Ошибка получения всех состояний БД:', error);
    return [];
  }
}
