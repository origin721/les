import { sharedWorkerLastPortsActive, sharedWorkerLastPortsAll } from "../../processes/shared_worker/process/sharedWorkerLastPortsRef";
import { back_store } from "../back_store";
import { accountToDto } from "../modules/accounts_service";
import { friendToDto } from "../modules/friends_service";
import type { ReturnSubscriptionMiddleware, SubscriptionMiddlewareProps } from "../subscription_middleware";


let update = null as null|(()=> void);


/**
 * Обработчик подписки на количество активных вкладок
 */
export function friends_by_id_subscribe(
  props: SubscriptionMiddlewareProps,
): ReturnSubscriptionMiddleware {
  const result = {
    onDestroy: () => {

    },
    update: () => {
      props.sendAll({
        friends_by_id: (
          Object.fromEntries(
            Object.entries(
              back_store.friends_by_id
            ).map(([key, value]) => {
              return [key, friendToDto(value)];
            })
          )
        ),
      });
    },
  }
  update = result.update;

  return result;
}


export function updateFriendsById() {
  if(update) {
    update();
  }
}