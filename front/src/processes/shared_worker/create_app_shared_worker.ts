import { sleep, toJson } from "../../core";
import { 
  type BackMiddlewareEvent,
  type BackMiddlewarePayloadFetch,
  type BackMiddlewarePayloadSubscribe,
  type BackMiddlewareProps
} from "../../local_back/middleware";
import { shared_worker_store, type SubscribeParam, type SubscribeUtilsParam } from "./shared_worker_store";
import SharedWorkerConstructor from './process/sharedWorker.js?sharedworker';
import { EVENT_TYPES, PATHS } from "../../local_back/constant";
import type { ObjectValues } from "../../types/utils";
import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";

const channelPing = new BroadcastChannel(CHANNEL_NAMES.SERVICE_WORKER_PING);

const subscribeCallBackByEvents: Record<
  keyof typeof PATHS,
  Set<()=>void>
> = {}

let lastPingDate: null|number = null;

const MS_PING_SLEEP = 2000;

export async function createAppSharedWorker() {
  // TODO: DEBUG MODE
  await sleep(3000);
  //const workerUrl = new URL('./process/sharedWorker.js', import.meta.url);
  // Создаем общий воркер
  //const sharedWorker = new SharedWorker(workerUrl, { type: 'module' });
  //const sharedWorker = new SharedWorker(workerUrl, { type: 'module' });
  const sharedWorker = new SharedWorkerConstructor();

  // Отправляем сообщение общему воркеру
  //sharedWorker.port.postMessage({ message: "Hello, shared worker!" });
  const promiseResolves: PromiseResolves = {};
  const subscribeUtils: SubscribeUtils = {};

  // Прослушивание сообщений
  channelPing.onmessage = (event) => {
    // console.log('Получено сообщение:', event.data);

    sharedWorker.port.postMessage({
      message: JSON.stringify({
        type: EVENT_TYPES.PING,
        response: {
          ...event.data,
          pageDate: Date.now(),
        },
      })
    });
  };

  shared_worker_store.set({
    subscribeMessage: (param) => {

      //else if (event.type === EVENT_TYPES.SUBSCRIBE) {
        sharedWorker.port.postMessage({ 
          message: JSON.stringify({
            type: EVENT_TYPES.SUBSCRIBE,
            payload: param.reqParam,
          })
        });

        if(!subscribeUtils[param.reqParam.path]) {
          subscribeUtils[param.reqParam.path] = new Set();
        };


        const newParam: SubscribeItem<typeof param.reqParam> = param;

        subscribeUtils[param.reqParam.path].add(newParam);

        return () => {
          // unsubscribe
          subscribeUtils[param.reqParam.path].delete(newParam);
        }
      //}
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
      sharedWorker,
  });
  };


  // Открываем порт, чтобы начать взаимодействие
  sharedWorker.port.start();
}



async function listener({
  param,
  promiseResolves,
  subscribeUtils,
  sharedWorker,
}:{
  param: string,
  promiseResolves: PromiseResolves;
  subscribeUtils: SubscribeUtils;
  sharedWorker: SharedWorker;
}) {
  try {
    // TODO: не тот тип BackMiddlewareProps по сути это контракт из sharedWorker
    const props = toJson(param) as BackMiddlewareProps;

    if(props.type === EVENT_TYPES.FETCH) {
      if (promiseResolves[props.idRequest]) {
        promiseResolves[props.idRequest](props);
        delete promiseResolves[props.idRequest];
      }
    }
    else if(props.type === EVENT_TYPES.SUBSCRIBE) {

      (subscribeUtils[props.payload.path] || []).forEach(subItem => {
        subItem.utils.callback(props.data);
      });
    }
    //else console.log('TODO: tmp debug 3288h9f4', props);
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
  reqParam: P;
  utils: SubscribeUtilsParam<P>;
};

type SubscribeUtils<P extends SubscribeParam = SubscribeParam> = Record<
  string,
  Set<SubscribeItem<P>>
>;
