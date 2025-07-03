import { toJson } from "../../../core";
import { EVENT_TYPES } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";
import { devLog, prodError, prodWarn } from "../../../core/debug/logger";

self.onconnect = function (event) {
  devLog('SharedWorker: onconnect вызван, ports:', event.ports.length);
  
  event.ports.forEach((port, index) => {
    devLog('SharedWorker: настройка port', index);
    
    port.onmessage = function (e) {
      devLog("SharedWorker received:", e.data);
      listener(e.data, port);
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
    devLog("SharedWorker listener starting, data:", data);
    
    /**
     * @type {import("../../../local_back/middleware").BackMiddlewareProps}
     */
    const props = toJson(data.message);
    devLog("SharedWorker parsed props:", props);
    
    // Проверить значения
    devLog("SharedWorker: EVENT_TYPES.FETCH =", EVENT_TYPES.FETCH);
    devLog("SharedWorker: props.type =", props?.type);
    devLog("SharedWorker: props.idRequest =", props?.idRequest);
    devLog("SharedWorker: props.payload =", props?.payload);

    if (
      props && 
      (props.idRequest || props.idRequest === 0)
      && props.payload
    ) {
      devLog("SharedWorker: условие idRequest + payload выполнено");
      
      if (props.type === EVENT_TYPES.FETCH) {
        devLog("SharedWorker: тип FETCH совпал, вызываем backMiddleware...");
        
        const result = await backMiddleware(props);
        devLog("SharedWorker: результат от backMiddleware:", result);
        
        const response = {
          idRequest: props.idRequest,
          payload: result,
        };
        devLog("SharedWorker: отправляем ответ:", response);
        
        port.postMessage(JSON.stringify(response));
        devLog("SharedWorker: ответ отправлен успешно");
      }
      else if(props.type === EVENT_TYPES.SUBSCRIBE) {

      }
      else {
        prodWarn("SharedWorker: тип НЕ FETCH, props.type =", props.type);
      }
    } else {
      prodWarn("SharedWorker: условие НЕ выполнено:");
      devLog("   - idRequest:", props?.idRequest);
      devLog("   - payload:", props?.payload);
    }
  }
  catch (err) {
    prodError("SharedWorker listener ОШИБКА:", err);
    prodError("SharedWorker error stack:", err.stack);
    
    // 🚨 КРИТИЧНО: отправить ошибку обратно!
    try {
      const errorResponse = {
        idRequest: data.message ? JSON.parse(data.message).idRequest : 'unknown',
        error: err.message,
        stack: err.stack
      };
      devLog("SharedWorker: отправляем ошибку:", errorResponse);
      port.postMessage(JSON.stringify(errorResponse));
    } catch (sendError) {
      prodError("SharedWorker: не удалось отправить ошибку:", sendError);
    }
  }
};
