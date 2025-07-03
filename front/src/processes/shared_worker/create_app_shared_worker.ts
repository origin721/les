import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store } from "./shared_worker_store";
import SharedWorkerConstructor from './process/sharedWorker.js?sharedworker';

export async function createAppSharedWorker() {
  console.log('🔄 createAppSharedWorker инициализация SharedWorker...');
  
  try {
    const sharedWorker = new SharedWorkerConstructor();
    
    const promiseResolves: PromiseResolves = {};
    
    shared_worker_store.set({
      sendMessage: (event: BackMiddlewareEvent) => {
        console.log('📤 Отправка в SharedWorker:', event.type, 'idRequest:', event.idRequest);
        
        const result = new Promise<any>(async(res, rej) => {
          const timeout = setTimeout(() => {
            console.log('⏰ SharedWorker TIMEOUT idRequest:', event.idRequest);
            rej(new Error('SharedWorker sendMessage timeout'));
          }, 12000);
          
          promiseResolves[event.idRequest] = (value) => {
            console.log('✅ SharedWorker ответ idRequest:', event.idRequest);
            clearTimeout(timeout);
            res(value);
          };
        });
        
        sharedWorker.port.postMessage({ message: JSON.stringify(event) });
        return result;
      },
    });

    sharedWorker.port.onmessage = function (event) {
      console.log('📥 SharedWorker получен ответ');
      try {
        listener(event.data, promiseResolves);
      } catch (error) {
        console.error('❌ Ошибка обработки ответа SharedWorker:', error);
      }
    };

    sharedWorker.onerror = function(error) {
      console.error('❌ SharedWorker error:', error);
    };

    sharedWorker.port.start();
    console.log('✅ SharedWorker запущен');
    
  } catch (error) {
    console.error('❌ Ошибка создания SharedWorker:', error);
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
    console.log('📥 Обработка ответа от SharedWorker, raw param:', param);
    
    const props = toJson(param) as BackMiddlewareProps & { error?: string; stack?: string };
    console.log('📥 Распарсенный ответ от SharedWorker:', props);

    if (props.error) {
      console.error('❌ SharedWorker вернул ошибку:', props.error);
      console.error('❌ Stack trace:', props.stack);
      
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
      console.log('✅ Найден resolver для idRequest:', props.idRequest);
      promiseResolves[props.idRequest](props);
      delete promiseResolves[props.idRequest];
    } else {
      console.log('⚠️ Не найден resolver для idRequest:', props.idRequest);
    }
  } catch (err) {
    console.error('❌ Ошибка обработки ответа от SharedWorker:', err);
    return null;
  }
}
