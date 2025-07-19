import { PATHS } from "../../local_back/constant/PATHS";
import { shared_worker_store } from "../../processes/shared_worker/shared_worker_store";
import { devLog } from "../../core/debug/logger";

export const tabs = {
  /**
   * Подписка на изменения количества активных вкладок
   * @param callback - функция обратного вызова для получения количества вкладок
   * @returns функция для отписки
   */
  subscribeActiveTabsCount(callback: (count: number) => void): () => void {
    //devLog("tabs.subscribeActiveTabsCount ВЫЗОВ");

    return shared_worker_store.subscribeWorker({
      reqParam: {
        path: PATHS.GET_ACTIVE_TABS_COUNT,
      },
      utils: {
        callback: (data) => callback(data.count),
      }
    });

    return () => {};

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
};
