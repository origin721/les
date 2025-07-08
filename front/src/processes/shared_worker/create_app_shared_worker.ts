import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store } from "./shared_worker_store";
import SharedWorkerConstructor from './process/sharedWorker.js?sharedworker';
import { devLog, prodError, prodWarn } from "../../core/debug/logger";
import { EVENT_TYPES } from "../../local_back/constant";

type SendProps = BackMiddlewareEvent | {
  idRequest: string | number;
  type: typeof EVENT_TYPES['SUBSCRIBE'];
  payload: any;
};

export async function createAppSharedWorker() {
  devLog('createAppSharedWorker инициализация SharedWorker...');
  
  try {
    const sharedWorker = new SharedWorkerConstructor();
    
    const promiseResolves: PromiseResolves = {};
    
    // Храним текущее значение store для доступа из listener
    let currentStoreValue: any = null;
    
    const storeValue = {
      sendMessage: (event: SendProps) => {
        devLog('Отправка в SharedWorker:', event.type, 'idRequest:', event.idRequest);
        
        const result = new Promise<any>(async(res, rej) => {
          const timeout = setTimeout(() => {
            prodError('SharedWorker TIMEOUT idRequest:', event.idRequest);
            rej(new Error('SharedWorker sendMessage timeout'));
          }, 300000);
          
          promiseResolves[event.idRequest] = (value) => {
            devLog('SharedWorker ответ idRequest:', event.idRequest);
            clearTimeout(timeout);
            res(value);
          };
        });
        
        sharedWorker.port.postMessage({ message: JSON.stringify(event) });
        return result;
      },
      onSubscriptionMessage: {}
    };
    
    currentStoreValue = storeValue;
    shared_worker_store.set(storeValue);

    sharedWorker.port.onmessage = function (event) {
      devLog('SharedWorker получен ответ');
      try {
        listener(event.data, promiseResolves, currentStoreValue);
      } catch (error) {
        prodError('Ошибка обработки ответа SharedWorker:', error);
      }
    };

    sharedWorker.onerror = function(error) {
      prodError('SharedWorker error:', error);
    };

    sharedWorker.port.start();
    devLog('SharedWorker запущен');
    
    // КРИТИЧНО: отправляем disconnect при закрытии/обновлении страницы
    const handleBeforeUnload = () => {
      try {
        devLog('Отправка disconnect в SharedWorker перед закрытием страницы');
        sharedWorker.port.postMessage({ 
          message: JSON.stringify({ type: 'disconnect' }) 
        });
      } catch (error) {
        prodError('Ошибка отправки disconnect:', error);
      }
    };
    
    // Добавляем обработчики только для реального закрытия страницы
    window.addEventListener('beforeunload', handleBeforeUnload);
    
  } catch (error) {
    prodError('Ошибка создания SharedWorker:', error);
    throw error;
  }
}

type PromiseResolves = Record<
  string,
  (p: BackMiddlewareProps | Error) => void
>;

async function listener(
  param: string,
  promiseResolves: PromiseResolves,
  currentStoreValue: any
) {
  try {
    devLog('Обработка ответа от SharedWorker, raw param:', param);
    
    const props = toJson(param) as BackMiddlewareProps & { error?: string; stack?: string };
    devLog('Распарсенный ответ от SharedWorker:', props);

    if (props.error) {
      prodError('SharedWorker вернул ошибку:', props.error);
      prodError('Stack trace:', props.stack);
      
      if (promiseResolves[props.idRequest]) {
        // Отклоняем Promise с ошибкой
        const error = new Error(props.error);
        if (props.stack) {
          error.stack = props.stack;
        }
        promiseResolves[props.idRequest](error);
        delete promiseResolves[props.idRequest];
      }
      return;
    }

    if (promiseResolves[props.idRequest]) {
      devLog('Найден resolver для idRequest:', props.idRequest);
      promiseResolves[props.idRequest](props);
      delete promiseResolves[props.idRequest];
    } else {
      // Проверяем, это ли уведомление от подписки
      if (currentStoreValue?.onSubscriptionMessage?.[props.idRequest]) {
        devLog('Найден subscription callback для idRequest:', props.idRequest);
        currentStoreValue.onSubscriptionMessage[props.idRequest](props.payload);
      } else {
        prodWarn('Не найден resolver или subscription callback для idRequest:', props.idRequest);
      }
    }
  } catch (err) {
    prodError('Ошибка обработки ответа от SharedWorker:', err);
    return null;
  }
}
