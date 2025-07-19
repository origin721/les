import { sharedWorkerLastPortsAll } from "../../processes/shared_worker/process/sharedWorkerLastPortsRef";
import type { ReturnSubscriptionMiddleware, SubscriptionMiddlewareProps } from "../subscription_middleware";


let update = null as null|(()=> void);

let prevResult: null|number = null;

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
      const newResult = sharedWorkerLastPortsAll.size;
      if (prevResult === newResult) return;

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