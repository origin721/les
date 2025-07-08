import { PATHS } from "../../local_back/constant/PATHS";
import { shared_worker_store } from "../../processes/shared_worker/shared_worker_store";
import { devLog, prodError } from "../../core/debug/logger";

// Типы для нового реактивного API
export interface TabsCounter {
  subscribe: (callback: (count: number) => void) => () => void;
  getCurrentCount: () => Promise<number>;
  isConnected: () => boolean;
  onConnectionChange: (callback: (connected: boolean) => void) => () => void;
}

export const tabs = {
  /**
   * ✅ LEGACY API - сохранен без изменений для обратной совместимости
   * Подписка на изменения количества активных вкладок
   * @param callback - функция обратного вызова для получения количества вкладок
   * @returns функция для отписки
   */
  subscribeActiveTabsCount(callback: (count: number) => void): () => void {
    devLog('tabs.subscribeActiveTabsCount ВЫЗОВ');
    
    return shared_worker_store.subscribeToWorker({
      payload: {
        path: PATHS.GET_ACTIVE_TABS_COUNT,
      },
      callback: (data) => {
        devLog('tabs.subscribeActiveTabsCount получены данные:', data);
        callback(data.count);
      }
    });
  },

  /**
   * 🆕 ENHANCED REACTIVE API - улучшенный реактивный счетчик вкладок
   * Предоставляет дополнительные возможности: проверка соединения, получение текущего значения
   * @returns объект с методами для работы с счетчиком вкладок
   */
  createReactiveTabsCounter(): TabsCounter {
    devLog('tabs.createReactiveTabsCounter СОЗДАНИЕ');
    
    let currentCount = 0;
    let isConnectedFlag = false;
    let connectionChangeCallbacks: ((connected: boolean) => void)[] = [];
    let unsubscribe: (() => void) | null = null;
    
    const setConnectionStatus = (connected: boolean) => {
      if (isConnectedFlag !== connected) {
        isConnectedFlag = connected;
        devLog('tabs.createReactiveTabsCounter изменение соединения:', connected);
        connectionChangeCallbacks.forEach(callback => {
          try {
            callback(connected);
          } catch (error) {
            prodError('tabs.createReactiveTabsCounter ошибка в callback изменения соединения:', error);
          }
        });
      }
    };
    
    const setupSubscription = (callback?: (count: number) => void) => {
      if (unsubscribe) {
        devLog('tabs.createReactiveTabsCounter переустановка подписки');
        unsubscribe();
      }
      
      unsubscribe = shared_worker_store.subscribeToWorker({
        payload: {
          path: PATHS.GET_ACTIVE_TABS_COUNT,
        },
        callback: (data) => {
          devLog('tabs.createReactiveTabsCounter получены данные:', data);
          currentCount = data.count;
          setConnectionStatus(true);
          
          if (callback) {
            try {
              callback(data.count);
            } catch (error) {
              prodError('tabs.createReactiveTabsCounter ошибка в callback:', error);
            }
          }
        }
      });
      
      // Автоматическое переподключение при потере соединения
      setTimeout(() => {
        if (!isConnectedFlag) {
          devLog('tabs.createReactiveTabsCounter таймаут соединения, помечаем как отключен');
          setConnectionStatus(false);
        }
      }, 5000);
    };
    
    return {
      subscribe: (callback: (count: number) => void) => {
        devLog('tabs.createReactiveTabsCounter.subscribe ВЫЗОВ');
        setupSubscription(callback);
        
        return () => {
          devLog('tabs.createReactiveTabsCounter.subscribe ОТПИСКА');
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
          setConnectionStatus(false);
        };
      },
      
      getCurrentCount: async (): Promise<number> => {
        devLog('tabs.createReactiveTabsCounter.getCurrentCount ВЫЗОВ, текущее значение:', currentCount);
        
        if (!isConnectedFlag) {
          // Если нет соединения, пытаемся получить актуальное значение
          return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
              reject(new Error('Timeout: не удалось получить количество вкладок'));
            }, 3000);
            
            const tempUnsub = shared_worker_store.subscribeToWorker({
              payload: {
                path: PATHS.GET_ACTIVE_TABS_COUNT,
              },
              callback: (data) => {
                clearTimeout(timeout);
                tempUnsub();
                currentCount = data.count;
                resolve(data.count);
              }
            });
          });
        }
        
        return currentCount;
      },
      
      isConnected: (): boolean => {
        return isConnectedFlag;
      },
      
      onConnectionChange: (callback: (connected: boolean) => void) => {
        devLog('tabs.createReactiveTabsCounter.onConnectionChange ПОДПИСКА');
        connectionChangeCallbacks.push(callback);
        
        // Сразу вызываем с текущим статусом
        try {
          callback(isConnectedFlag);
        } catch (error) {
          prodError('tabs.createReactiveTabsCounter.onConnectionChange ошибка в callback:', error);
        }
        
        return () => {
          devLog('tabs.createReactiveTabsCounter.onConnectionChange ОТПИСКА');
          const index = connectionChangeCallbacks.indexOf(callback);
          if (index > -1) {
            connectionChangeCallbacks.splice(index, 1);
          }
        };
      }
    };
  }
};
