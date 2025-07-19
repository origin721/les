import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewarePayloadFetch,
  type BackMiddlewarePayloadSubscribe,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store, type SubscribeParam, type SubscribeUtilsParam } from "./shared_worker_store";
import SharedWorkerConstructor from './process/sharedWorker.js?sharedworker';
import { EVENT_TYPES } from "../../local_back/constant";
import type { ObjectValues } from "../../types/utils";

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
  const subscribeUtils: SubscribeUtils = {};

  shared_worker_store.set({
    subscribeMessage: (
      event,
      utils,
    ) => {
      //else if (event.type === EVENT_TYPES.SUBSCRIBE) {
        sharedWorker.port.postMessage({ message: JSON.stringify(event) })

        if(!subscribeUtils[event.path]) {
          subscribeUtils[event.path] = new Set();
        };


        const newParam: SubscribeItem<typeof event> = {
          param: event,
          utils: utils,
        };

        subscribeUtils[event.path].add(newParam);

        return () => {
          // unsubscribe
          subscribeUtils[event.path].delete(newParam);
        }
      //}

      return () => {};
    },
    sendMessage: (
      event,
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
    listener({
      param: event.data, 
      promiseResolves,
      subscribeUtils,
  });
  };


  // Открываем порт, чтобы начать взаимодействие
  sharedWorker.port.start();
}



async function listener({
  param,
  promiseResolves,
  subscribeUtils,
}:{
  param: string,
  promiseResolves: PromiseResolves,
  subscribeUtils: SubscribeUtils,
}) {
  try {
    const props = toJson(param) as BackMiddlewareProps;

    if(props.type === EVENT_TYPES.FETCH) {
      if (promiseResolves[props.idRequest]) {
        promiseResolves[props.idRequest](props);
        delete promiseResolves[props.idRequest];
      }
    }
    else if(props.type === EVENT_TYPES.SUBSCRIBE) {
      (subscribeUtils[props.payload.path]||[]).forEach(subItem => {
        subItem.utils.callback(props.payload);
      });
    }
  }
  catch(err) {
    return null;
  }
};

type PromiseResolves = Record<
  string,
  (p: BackMiddlewareProps) => void
>;

type SubscribeItem<P extends SubscribeParam> = {
  param: P;
  utils: SubscribeUtilsParam<P>;
};

type SubscribeUtils<P extends SubscribeParam = SubscribeParam> = Record<
  string,
  Set<SubscribeItem<P>>
>;