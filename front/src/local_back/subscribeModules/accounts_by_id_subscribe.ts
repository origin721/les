import { sharedWorkerLastPortsActive, sharedWorkerLastPortsAll } from "../../processes/shared_worker/process/sharedWorkerLastPortsRef";
import { back_store } from "../back_store";
import { accountToDto } from "../modules/accounts_service";
import type { ReturnSubscriptionMiddleware, SubscriptionMiddlewareProps } from "../subscription_middleware";


let update = null as null|(()=> void);


/**
 * Обработчик подписки на количество активных вкладок
 */
export function accounts_by_id_subscribe(
  props: SubscriptionMiddlewareProps,
): ReturnSubscriptionMiddleware {
  const result = {
    onDestroy: () => {

    },
    update: () => {
      props.sendAll({
        accounts_by_id: (
          Object.fromEntries(
            Object.entries(
              back_store.accounts_by_id
            ).map(([key, value]) => {
              return [key, accountToDto(value)];
            })
          )
        ),
      });
    },
  }
  update = result.update;

  return result;
}


export function updateAccById() {
  if(update) {
    update();
  }
}