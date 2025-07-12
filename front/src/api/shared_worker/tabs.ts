import { PATHS } from "../../local_back/constant/PATHS";
import { shared_worker_store } from "../../processes/shared_worker/shared_worker_store";
import { devLog } from "../../core/debug/logger";
import { ReactiveSubscription } from "../../core/utils";

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
    devLog("tabs.subscribeActiveTabsCount ВЫЗОВ");

    return shared_worker_store.subscribeToWorker({
      payload: {
        path: PATHS.GET_ACTIVE_TABS_COUNT,
      },
      callback: (data) => {
        devLog("tabs.subscribeActiveTabsCount получены данные:", data);
        callback(data.count);
      },
    });
  },

  /**
   * 🆕 ENHANCED REACTIVE API - теперь использует ReactiveSubscription утилиту
   * Предоставляет дополнительные возможности: проверка соединения, получение текущего значения
   * @returns объект с методами для работы с счетчиком вкладок
   */
  createReactiveTabsCounter(): TabsCounter {
    devLog(
      "tabs.createReactiveTabsCounter СОЗДАНИЕ с использованием ReactiveSubscription",
    );

    const subscription = new ReactiveSubscription<{ count: number }>(
      (callback) => {
        devLog(
          "tabs.createReactiveTabsCounter создание подписки через shared_worker_store",
        );
        return shared_worker_store.subscribeToWorker({
          payload: {
            path: PATHS.GET_ACTIVE_TABS_COUNT,
          },
          callback,
        });
      },
      { count: 0 }, // значение по умолчанию
    );

    return {
      subscribe: (callback: (count: number) => void) => {
        devLog("tabs.createReactiveTabsCounter.subscribe ВЫЗОВ");
        return subscription.subscribe((data) => {
          devLog(
            "tabs.createReactiveTabsCounter.subscribe получены данные:",
            data,
          );
          callback(data.count);
        });
      },

      getCurrentCount: async (): Promise<number> => {
        devLog("tabs.createReactiveTabsCounter.getCurrentCount ВЫЗОВ");
        const data = await subscription.getCurrentValue();
        devLog(
          "tabs.createReactiveTabsCounter.getCurrentCount результат:",
          data.count,
        );
        return data.count;
      },

      isConnected: (): boolean => {
        const connected = subscription.isConnected();
        devLog("tabs.createReactiveTabsCounter.isConnected:", connected);
        return connected;
      },

      onConnectionChange: (callback: (connected: boolean) => void) => {
        devLog("tabs.createReactiveTabsCounter.onConnectionChange ПОДПИСКА");
        return subscription.onConnectionChange(callback);
      },
    };
  },
};
