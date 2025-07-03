import { toJson } from "../../../core";
import { EVENT_TYPES } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";


self.onconnect = function (event) {
  console.log('🔌 SharedWorker: onconnect вызван, ports:', event.ports.length);
  
  event.ports.forEach((port, index) => {
    console.log('🔌 SharedWorker: настройка port', index);
    
    port.onmessage = function (e) {
      console.log("🔄 SharedWorker received:", e.data);
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
    console.log("🔄 SharedWorker listener starting, data:", data);
    
    /**
     * @type {import("../../../local_back/middleware").BackMiddlewareProps}
     */
    const props = toJson(data.message);
    console.log("🔄 SharedWorker parsed props:", props);
    
    // Проверить значения
    console.log("🔍 SharedWorker: EVENT_TYPES.FETCH =", EVENT_TYPES.FETCH);
    console.log("🔍 SharedWorker: props.type =", props?.type);
    console.log("🔍 SharedWorker: props.idRequest =", props?.idRequest);
    console.log("🔍 SharedWorker: props.payload =", props?.payload);

    if (
      props && 
      (props.idRequest || props.idRequest === 0)
      && props.payload
    ) {
      console.log("✅ SharedWorker: условие idRequest + payload выполнено");
      
      if (props.type === EVENT_TYPES.FETCH) {
        console.log("✅ SharedWorker: тип FETCH совпал, вызываем backMiddleware...");
        
        const result = await backMiddleware(props);
        console.log("✅ SharedWorker: результат от backMiddleware:", result);
        
        const response = {
          idRequest: props.idRequest,
          payload: result,
        };
        console.log("📤 SharedWorker: отправляем ответ:", response);
        
        port.postMessage(JSON.stringify(response));
        console.log("✅ SharedWorker: ответ отправлен успешно");
      }
      else if(props.type === EVENT_TYPES.SUBSCRIBE) {

      }
      else {
        console.log("❌ SharedWorker: тип НЕ FETCH, props.type =", props.type);
      }
    } else {
      console.log("❌ SharedWorker: условие НЕ выполнено:");
      console.log("   - idRequest:", props?.idRequest);
      console.log("   - payload:", props?.payload);
    }
  }
  catch (err) {
    console.error("❌ SharedWorker listener ОШИБКА:", err);
    console.error("❌ SharedWorker error stack:", err.stack);
    
    // 🚨 КРИТИЧНО: отправить ошибку обратно!
    try {
      const errorResponse = {
        idRequest: data.message ? JSON.parse(data.message).idRequest : 'unknown',
        error: err.message,
        stack: err.stack
      };
      console.log("📤 SharedWorker: отправляем ошибку:", errorResponse);
      port.postMessage(JSON.stringify(errorResponse));
    } catch (sendError) {
      console.error("❌ SharedWorker: не удалось отправить ошибку:", sendError);
    }
  }
};
