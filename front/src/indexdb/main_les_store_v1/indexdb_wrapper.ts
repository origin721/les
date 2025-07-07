import { indexdb_order } from "./indexdb_order";
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
 */
export async function indexdb_wrapper(
  onChange: (db: IDBDatabase) => Promise<void>,
) {
  if(isDebugMode) {
    ++counterInfo.open;
    debugLog({counterInfo});
  }

  // Увеличиваем счетчик активных запросов при начале запроса
  ConnectionManager.incrementActiveRequests();

  const resultPromise = new Promise(async (_res, _rej) => {
    const res = (_data: any) => {
      // Уменьшаем счетчик активных запросов при завершении
      ConnectionManager.decrementActiveRequests();
      _res(_data);
      
      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.success;
      debugLog({counterInfo});
    }
    const rej = (_err: any) => {
      // Уменьшаем счетчик активных запросов при ошибке
      ConnectionManager.decrementActiveRequests();
      _rej(_err);

      if(!isDebugMode) return

      ++counterInfo.close;
      ++counterInfo.error;
      debugLog({counterInfo});
    }

    try {
      indexdb_order(async (onFinishOrder) => {
        resultPromise.finally(onFinishOrder);

        try {
          // Используем ConnectionManager для получения соединения
          // Вся логика миграций, восстановления и кеширования находится в ConnectionManager
          const db = await ConnectionManager.getConnection();
          
          // Вызываем пользовательский callback
          await onChange(db);
          
          // НЕ закрываем соединение - оно управляется ConnectionManager
          res(undefined);
          
        } catch (error) {
          prodError('Ошибка в indexdb_wrapper:', error);
          rej(error);
        }
      });
      
    } catch (error) {
      prodError('Критическая ошибка в indexdb_wrapper:', error);
      rej(error);
    }
  });

  return resultPromise;
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
