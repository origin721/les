import { sharedWorkerLastPortsActive, sharedWorkerLastPortsAll } from "../../processes/shared_worker/process/sharedWorkerLastPortsRef";
import type { ReturnSubscriptionMiddleware, SubscriptionMiddlewareProps } from "../subscription_middleware";


let update = null as null|(()=> void);

let prevResult: null|number = null;

let lastUpdateTime: null | number = null;
const DELAY_UPDATE_MS = 3000;

/**
 * Обработчик подписки на количество активных вкладок
 */
export function handleActiveTabsCountSubscription(
  props: SubscriptionMiddlewareProps,
): ReturnSubscriptionMiddleware {
  const result = {
    onDestroy: () => {

    },
    update: () => {
      const newResult = sharedWorkerLastPortsActive.size;
      if (
        prevResult === newResult && 
        lastUpdateTime !== null &&
        (lastUpdateTime + DELAY_UPDATE_MS) < Date.now()

      ) return;

      lastUpdateTime = Date.now();

      prevResult = newResult;
      props.sendAll({ count: newResult });
    },
  }
  update = result.update;

  return result;
}


export function updateActiveTabsCountSubscription() {
  if(update) {
    update();
  }
}