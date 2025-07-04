import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store } from "./shared_worker_store";
import SharedWorkerConstructor from './process/sharedWorker.js?sharedworker';
import { devLog, prodError, prodWarn } from "../../core/debug/logger";

export async function createAppSharedWorker() {
  devLog('createAppSharedWorker инициализация SharedWorker...');
  
  try {
    const sharedWorker = new SharedWorkerConstructor();
    
    const promiseResolves: PromiseResolves = {};
    
    shared_worker_store.set({
      sendMessage: (event: BackMiddlewareEvent) => {
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
    });

    sharedWorker.port.onmessage = function (event) {
      devLog('SharedWorker получен ответ');
      try {
        listener(event.data, promiseResolves);
      } catch (error) {
        prodError('Ошибка обработки ответа SharedWorker:', error);
      }
    };

    sharedWorker.onerror = function(error) {
      prodError('SharedWorker error:', error);
    };

    sharedWorker.port.start();
    devLog('SharedWorker запущен');
    
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
      prodWarn('Не найден resolver для idRequest:', props.idRequest);
    }
  } catch (err) {
    prodError('Ошибка обработки ответа от SharedWorker:', err);
    return null;
  }
}
