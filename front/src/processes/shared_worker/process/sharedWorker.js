// @ts-check
import { toJson } from "../../../core";
import { EVENT_TYPES } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";
import { subscribeItemByPath } from "../../../local_back/subscribeItemByPath";
import { subscriptionMiddleware } from "../../../local_back/subscription_middleware";
import { sharedWorkerLastPortsRef } from "./sharedWorkerLastPortsRef";


self.onconnect = function (event) {

  sharedWorkerLastPortsRef.current = event.ports;

  event.ports.forEach(port => {
    port.onmessage = function (e) {
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
        (sharedWorkerLastPortsRef.current||[]).forEach(port => {
          try {
            port.postMessage(JSON.stringify({
              type: EVENT_TYPES.SUBSCRIBE,
              payload: data.payload,
              data: dataSended,
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