import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewarePayloadFetch,
  type BackMiddlewarePayloadSubscribe,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store } from "./shared_worker_store";
import SharedWorkerConstructor from './process/sharedWorker.js?sharedworker';
import { EVENT_TYPES } from "../../local_back/constant";

export async function createAppSharedWorker() {
  await sleep(3000);
  //const workerUrl = new URL('./process/sharedWorker.js', import.meta.url);
  // Создаем общий воркер
  //const sharedWorker = new SharedWorker(workerUrl, { type: 'module' });
  //const sharedWorker = new SharedWorker(workerUrl, { type: 'module' });
  const sharedWorker = new SharedWorkerConstructor();

  // Отправляем сообщение общему воркеру
  sharedWorker.port.postMessage({ message: "Hello, shared worker!" });
  const promiseResolves: PromiseResolves = {};
  shared_worker_store.set({
    subscribeMessage: (
      event,
      utils,
    ) => {
      //else if (event.type === EVENT_TYPES.SUBSCRIBE) {
        sharedWorker.port.postMessage({ message: JSON.stringify(event) })

        utils.callback('hi');

        return () => {
          // unsubscribe
        }
      //}

      return () => {};
    },
    sendMessage: (
      event: BackMiddlewarePayloadFetch,
      param?: {
        /**
         * Для подписки получение новых реактивно
         */
        callback: (p: any) => void;
      }
    ) => {
        const result = new Promise(async (res, rej) => {
          promiseResolves[event.idRequest] = res;
        });
        sharedWorker.port.postMessage({ message: JSON.stringify(event) })
        return result;
    },
  });

  // Получаем ответ от общего воркера
  sharedWorker.port.onmessage = function (event) {
    //console.log('Received from shared worker:', event.data);
    listener(event.data, promiseResolves);
  };


  // Открываем порт, чтобы начать взаимодействие
  sharedWorker.port.start();
}

type PromiseResolves = Record<
  string,
  (p: BackMiddlewareProps) => void
>;
async function listener(
  param: string,
  promiseResolves: PromiseResolves,
) {
  try {
    const props = toJson(param) as BackMiddlewareProps;

    if(promiseResolves[props.idRequest]) {
      promiseResolves[props.idRequest](props);
      delete promiseResolves[props.idRequest];
    }
  }
  catch(err) {
    return null;
  }
};