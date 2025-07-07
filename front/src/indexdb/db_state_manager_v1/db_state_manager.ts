import { DB_NAMES, DB_UPDATE_STATUS } from '../constants';
import { prodInfo, prodError, debugLog } from '../../core/debug/logger';
import type { DbStateRecord, DbUpdateStatus } from './constants';


/**
 * Версия схемы базы состояний
 */
const DB_STATE_MANAGER_VERSION = 1;

/**
 * Открывает базу данных состояний
 */
function openStateDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAMES.DB_STATE_MANAGER_V1, DB_STATE_MANAGER_VERSION);
    
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

/**
 * Записать начало миграции с временной меткой
 */
export async function startMigrationTimer(
  dbName: string, 
  fromVersion: number, 
  toVersion: number
): Promise<void> {
  try {
    let stateRecord = await getDbState(dbName);
    
    if (!stateRecord) {
      stateRecord = {
        id: dbName,
        dbName,
        version: fromVersion,
        status: DB_UPDATE_STATUS.UPDATE_STARTED,
        lastUpdated: Date.now()
      };
    }
    
    stateRecord.migrationStartTime = Date.now();
    stateRecord.targetVersion = toVersion;
    stateRecord.executedMigrations = [];
    stateRecord.migratedTables = [];
    
    await updateDbState(stateRecord);
    prodInfo('⏱️ Начат таймер миграции:', { dbName, fromVersion, toVersion });
  } catch (error) {
    prodError('❌ Ошибка записи начала миграции:', error);
    throw error;
  }
}

/**
 * Записать окончание миграции и вычислить общее время
 */
export async function endMigrationTimer(dbName: string): Promise<void> {
  try {
    const stateRecord = await getDbState(dbName);
    if (!stateRecord || !stateRecord.migrationStartTime) {
      prodError('❌ Не найдено начало миграции для расчета времени:', dbName);
      return;
    }
    
    const endTime = Date.now();
    stateRecord.migrationEndTime = endTime;
    stateRecord.migrationDurationMs = endTime - stateRecord.migrationStartTime;
    
    await updateDbState(stateRecord);
    prodInfo('✅ Завершен таймер миграции:', { 
      dbName, 
      durationMs: stateRecord.migrationDurationMs,
      durationSec: Math.round(stateRecord.migrationDurationMs / 1000)
    });
  } catch (error) {
    prodError('❌ Ошибка записи окончания миграции:', error);
    throw error;
  }
}

/**
 * Записать время выполнения конкретной миграции
 */
export async function recordMigrationStep(
  dbName: string,
  stepInfo: {
    version: number;
    fileName: string; 
    schemaDuration: number;
    dataDuration: number;
  }
): Promise<void> {
  try {
    const stateRecord = await getDbState(dbName);
    if (!stateRecord) {
      prodError('❌ Не найдено состояние БД для записи шага миграции:', dbName);
      return;
    }
    
    if (!stateRecord.executedMigrations) {
      stateRecord.executedMigrations = [];
    }
    
    const now = Date.now();
    stateRecord.executedMigrations.push({
      version: stepInfo.version,
      fileName: stepInfo.fileName,
      schemaDuration: stepInfo.schemaDuration,
      dataDuration: stepInfo.dataDuration,
      startTime: now - stepInfo.schemaDuration - stepInfo.dataDuration,
      endTime: now
    });
    
    await updateDbState(stateRecord);
    prodInfo('📝 Записан шаг миграции:', stepInfo);
  } catch (error) {
    prodError('❌ Ошибка записи шага миграции:', error);
    throw error;
  }
}

/**
 * Проверка зависших миграций (старше 10 минут)
 */
export async function detectStuckMigrations(dbName: string): Promise<boolean> {
  try {
    const stateRecord = await getDbState(dbName);
    if (!stateRecord || stateRecord.status !== DB_UPDATE_STATUS.UPDATE_STARTED) {
      return false;
    }
    
    const STUCK_TIMEOUT_MS = 10 * 60 * 1000; // 10 минут
    const now = Date.now();
    const migrationAge = stateRecord.migrationStartTime ? 
      now - stateRecord.migrationStartTime : 
      now - stateRecord.lastUpdated;
    
    const isStuck = migrationAge > STUCK_TIMEOUT_MS;
    
    if (isStuck) {
      prodInfo('⚠️ Обнаружена зависшая миграция:', {
        dbName,
        ageMinutes: Math.round(migrationAge / 60000),
        lastUpdated: new Date(stateRecord.lastUpdated).toISOString()
      });
    }
    
    return isStuck;
  } catch (error) {
    prodError('❌ Ошибка проверки зависших миграций:', error);
    return false;
  }
}

/**
 * Сброс статуса зависшей миграции
 */
export async function resetStuckMigration(dbName: string): Promise<void> {
  try {
    const stateRecord = await getDbState(dbName);
    if (!stateRecord) {
      prodInfo('ℹ️ Состояние БД не найдено, сброс не требуется:', dbName);
      return;
    }
    
    // Сбрасываем статус на IDLE
    stateRecord.status = DB_UPDATE_STATUS.IDLE;
    stateRecord.errorMessage = 'Миграция была сброшена из-за зависания';
    
    // Очищаем временные данные миграции
    delete stateRecord.migrationStartTime;
    delete stateRecord.migrationEndTime;
    delete stateRecord.migrationDurationMs;
    delete stateRecord.targetVersion;
    
    await updateDbState(stateRecord);
    prodInfo('🔄 Сброшена зависшая миграция:', dbName);
  } catch (error) {
    prodError('❌ Ошибка сброса зависшей миграции:', error);
    throw error;
  }
}

/**
 * Обновление информации о мигрированных таблицах
 */
export async function updateMigratedTables(dbName: string, tables: string[]): Promise<void> {
  try {
    const stateRecord = await getDbState(dbName);
    if (!stateRecord) {
      prodError('❌ Не найдено состояние БД для обновления таблиц:', dbName);
      return;
    }
    
    if (!stateRecord.migratedTables) {
      stateRecord.migratedTables = [];
    }
    
    // Добавляем уникальные таблицы
    tables.forEach(table => {
      if (!stateRecord.migratedTables!.includes(table)) {
        stateRecord.migratedTables!.push(table);
      }
    });
    
    await updateDbState(stateRecord);
    prodInfo('📊 Обновлен список мигрированных таблиц:', { dbName, tables });
  } catch (error) {
    prodError('❌ Ошибка обновления мигрированных таблиц:', error);
    throw error;
  }
}

/**
 * Получить статистику времени выполнения для UI
 */
export async function getMigrationStats(dbName: string): Promise<{
  totalDuration: number;
  lastMigrationDate: Date | null;
  executedMigrations: Array<{
    version: number;
    fileName: string;
    schemaDuration: number;
    dataDuration: number;
    startTime: number;
    endTime: number;
  }>;
}> {
  try {
    const stateRecord = await getDbState(dbName);
    
    if (!stateRecord) {
      return {
        totalDuration: 0,
        lastMigrationDate: null,
        executedMigrations: []
      };
    }
    
    return {
      totalDuration: stateRecord.migrationDurationMs || 0,
      lastMigrationDate: stateRecord.migrationEndTime ? new Date(stateRecord.migrationEndTime) : null,
      executedMigrations: stateRecord.executedMigrations || []
    };
  } catch (error) {
    prodError('❌ Ошибка получения статистики миграций:', error);
    return {
      totalDuration: 0,
      lastMigrationDate: null,
      executedMigrations: []
    };
  }
}
