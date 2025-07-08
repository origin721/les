import { toJson } from "../../../core/toJson";
import { EVENT_TYPES, PATHS } from "../../../local_back/constant";
import { backMiddleware } from "../../../local_back/middleware";
import { devLog, prodError, prodWarn } from "../../../core/debug/logger";

// Глобальный реестр активных подключений
const activeTabs = new Set();
const subscribers = {
  activeTabsCount: new Map() // subscriptionId -> {port, params}
};

// Функция для уведомления всех подписчиков об изменении количества вкладок
function notifyActiveTabsSubscribers() {
  const count = activeTabs.size;
  devLog('SharedWorker: уведомление подписчиков о количестве вкладок:', count);
  
  subscribers.activeTabsCount.forEach((subscription, subscriptionId) => {
    try {
      const response = {
        idRequest: subscriptionId,
        payload: { count: count }
      };
      subscription.port.postMessage(JSON.stringify(response));
      devLog('SharedWorker: отправлено уведомление подписчику:', subscriptionId, 'count:', count);
    } catch (error) {
      prodError('SharedWorker: ошибка при отправке уведомления подписчику:', subscriptionId, error);
      // Удаляем неработающую подписку
      subscribers.activeTabsCount.delete(subscriptionId);
    }
  });
}

self.onconnect = function (event) {
  devLog('SharedWorker: onconnect вызван, ports:', event.ports.length);
  
  event.ports.forEach((port, index) => {
    devLog('SharedWorker: настройка port', index);
    
    // Регистрируем активную вкладку
    activeTabs.add(port);
    devLog('SharedWorker: добавлена активная вкладка, всего:', activeTabs.size);
    
    // Уведомляем подписчиков об изменении количества
    notifyActiveTabsSubscribers();
    
    port.onmessage = function (e) {
      devLog("SharedWorker received:", e.data);
      listener(e.data, port);
    };

    // Обработка закрытия порта
    port.addEventListener('close', () => {
      devLog('SharedWorker: порт закрыт');
      activeTabs.delete(port);
      
      // Удаляем все подписки этого порта
      subscribers.activeTabsCount.forEach((subscription, subscriptionId) => {
        if (subscription.port === port) {
          subscribers.activeTabsCount.delete(subscriptionId);
        }
      });
      
      devLog('SharedWorker: удалена активная вкладка, всего:', activeTabs.size);
      notifyActiveTabsSubscribers();
    });
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
        devLog("SharedWorker: тип SUBSCRIBE совпал");
        
        if (props.payload.path === PATHS.GET_ACTIVE_TABS_COUNT) {
          const subscriptionId = props.idRequest;
          devLog("SharedWorker: подписка на активные вкладки, subscriptionId:", subscriptionId);
          
          // Сохраняем подписку
          subscribers.activeTabsCount.set(subscriptionId, {
            port: port,
            params: props.payload
          });
          
          // Сразу отправляем текущее значение
          const response = {
            idRequest: subscriptionId,
            payload: { count: activeTabs.size }
          };
          port.postMessage(JSON.stringify(response));
          devLog("SharedWorker: отправлено начальное значение count:", activeTabs.size, "для subscriptionId:", subscriptionId);
        }
        else {
          prodWarn("SharedWorker: неизвестный path для SUBSCRIBE:", props.payload.path);
        }
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
