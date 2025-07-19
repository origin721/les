// @ts-check
import { toJson } from "../../../core";
import { CHANNEL_NAMES } from "../../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import { debugLog } from "../../../core/debug/logger";
import { EVENT_TYPES } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";
import { subscribeItemByPath } from "../../../local_back/subscribeItemByPath";
import { updateActiveTabsCountSubscription } from "../../../local_back/subscribeModules/handleActiveTabsCountSubscription";
import { subscriptionMiddleware } from "../../../local_back/subscription_middleware";
import { workerGeneratorIds } from "../workerGeneratorIds";
import { sharedWorkerLastPortsActive, sharedWorkerLastPortsAll } from "./sharedWorkerLastPortsRef";


const channelPing = new BroadcastChannel(CHANNEL_NAMES.SERVICE_WORKER_PING);

serviceWorkerPing();
function serviceWorkerPing() {
  const broadcast_event = {
    serviceWorkerDate: Date.now(),
  };

  sharedWorkerLastPortsActive.clear();
  sharedWorkerLastPortsAll.forEach(port => {
    sharedWorkerLastPortsActive.add(port);
  });

  sharedWorkerLastPortsAll.clear();
  channelPing.postMessage(broadcast_event);
 
  setTimeout(() => {
    serviceWorkerPing();
  }, 3000);
 }
 
/**
 * @type {null|number}
 */
let lastPingDate = null;

const MS_PING_SLEEP = 2000;


self.onconnect = function (event) {


  event.ports.forEach(port => {
    sharedWorkerLastPortsAll.add(port);

    port.onmessage = function (e) {
      sharedWorkerLastPortsAll.add(port);
      //console.log("SharedWorker received:", e.data);

      listener(e.data, port);

      // Ответ отправляем на порт, связанный с вкладкой
      //port.postMessage((++counter) + "Shared worker response: " + e.data.message);
    };
  });

};

/**
 * 
 * @param {*} data
 * @param {*} port
 * @returns 
 */
async function listener(data, port) {
  try {
    /**
     * @type {import("../../../local_back/middleware").BackMiddlewareProps}
     */
    const props = toJson(data.message);

    if ('type' in props) {
      if (props.type === EVENT_TYPES.FETCH) {
        if (
          (props.idRequest)
          && props.payload
        ) {
          port.postMessage(JSON.stringify({
            type: EVENT_TYPES.FETCH,
            idRequest: props.idRequest,
            payload: await backMiddleware(props),
          }));
        }
      }
      else if (props.type === EVENT_TYPES.SUBSCRIBE) {
        listenerSubscribe({ data: props, port });
      }
      else if (props.type === EVENT_TYPES.PING) {
        const prevSize = sharedWorkerLastPortsAll.size;
        sharedWorkerLastPortsAll.add(port);
        // debugLog(import.meta.url, {delta: props.response.pageDate - props.response.serviceWorkerDate});
        
        updateActiveTabsCountSubscription();
      }
    }
  }
  catch (err) {
    return null;
  }
};

/**
 * 
 * @param {{
 * data: import("../../../local_back/middleware").BackMiddlewareProps
 * port: {
 *  postMessage: (p: string) => unknown;
 * };
 * }} param0 
 */
function listenerSubscribe({
  data,
  port,
}) {
  if(subscribeItemByPath.has(data.payload.path)) {
    subscribeItemByPath.get(data.payload.path)?.update();
  }
  else {
    const controllerSubscribe = subscriptionMiddleware({
      sendAll: (dataSended) => { 
       //if(
       //  lastPingDate === null 
       //  || (lastPingDate + MS_PING_SLEEP) < Date.now()
       //) {
       //  lastPingDate = Date.now();
       //}

        sharedWorkerLastPortsAll.forEach(port => {
          try {
            port.postMessage(JSON.stringify({
              type: EVENT_TYPES.SUBSCRIBE,
              payload: data.payload,
              data: dataSended,
              idRequest: workerGeneratorIds(),
            }));
          }
          catch(err) {
            console.error(err, 'Не удалось отправить в порт сообщение');
          }
        });
      },
      payload: data.payload,
    });

    if(controllerSubscribe) {
      subscribeItemByPath.set(
        data.payload.path,
        controllerSubscribe,
      );
      controllerSubscribe.update();
    }
  }
  
 //const subscribeByPathItem = subscriptionMiddleware(
 //);
}