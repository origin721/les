import { sharedWorkerLastPortsActive } from "../../processes/shared_worker/process/sharedWorkerLastPortsRef";
import type { ReturnSubscriptionMiddleware, SubscriptionMiddlewareProps } from "../subscription_middleware";


let update = null as null|(()=> void);

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
      props.sendAll({ count: sharedWorkerLastPortsActive.size });
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