import { debugLog, prodError } from '../../core/debug/logger';
import { ConnectionManager } from './connection_manager';

const counterInfo = {
  open: 0,
  close: 0,
  success: 0,
  error: 0,
}

const isDebugMode = false;

/**
 * Упрощенный wrapper для IndexedDB, использующий ConnectionManager
 * Все сложная логика управления соединениями вынесена в ConnectionManager
 * 
 * Простая схема:
 * - Первый запрос инициализирует БД через ConnectionManager
 * - Остальные ждут пока она попадет в кэш на 5 минут  
 * - Никаких очередей - только простое ожидание Promise
 */
export async function indexdb_wrapper(
  onChange: (db: IDBDatabase) => Promise<void>,
) {
  let result;
  if(isDebugMode) {
    ++counterInfo.open;
    debugLog({counterInfo});
  }

  // Увеличиваем счетчик активных запросов при начале запроса
  ConnectionManager.incrementActiveRequests();

  try {
    // Используем ConnectionManager для получения соединения
    // Вся логика миграций, восстановления и кеширования находится в ConnectionManager
    // ConnectionManager.getConnection() возвращает Promise, параллельные запросы ждут тот же Promise
    const db = await ConnectionManager.getConnection();
    
    // Вызываем пользовательский callback
    result = await onChange(db);
    
    // НЕ закрываем соединение - оно управляется ConnectionManager
    
    if(isDebugMode) {
      ++counterInfo.close;
      ++counterInfo.success;
      debugLog({counterInfo});
    }
    
  } catch (error) {
    if(isDebugMode) {
      ++counterInfo.close;
      ++counterInfo.error;
      debugLog({counterInfo});
    }
    
    prodError('Ошибка в indexdb_wrapper:', error);
    throw error;
  } finally {
    // Уменьшаем счетчик активных запросов при завершении (успех или ошибка)
    ConnectionManager.decrementActiveRequests();

    return result;
  }
}

// Делегируем функции состояния ConnectionManager'у
export function getConnectionInfo() {
  return ConnectionManager.getConnectionInfo();
}

export function forceCloseConnection() {
  return ConnectionManager.forceCloseConnection();
}

// Функция для создания менеджера соединений
export function create_indexdb_wrapper() {
  return indexdb_wrapper;
}
