import { toJson } from "../../../core";
import { EVENT_TYPES } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";


self.onconnect = function (event) {

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

    if (
      (props.idRequest || props.idRequest === 0)
      && props.payload
    ) {
      if (props.type === EVENT_TYPES.FETCH) {
        port.postMessage(JSON.stringify({
          idRequest: props.idRequest,
          payload: await backMiddleware(props),
        }));
      }
      else if(props.type === EVENT_TYPES.SUBSCRIBE) {

      }
    }
  }
  catch (err) {
    return null;
  }
};