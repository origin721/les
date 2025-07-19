import { writable } from "svelte/store";
import type { BackMiddlewareEvent, BackMiddlewareEventFetch, BackMiddlewarePayload, BackMiddlewarePayloadFetch, BackMiddlewarePayloadSubscribe, BackMiddlewareProps, ResultByPath } from "../../local_back/middleware";
import { create_counter_generator } from "../../core/create_counter_generator";
import { EVENT_TYPES } from "../../local_back/constant";
import { generateRandomString } from "../../core/random/generateRandomString";
import { getRandomInRange } from "../../core/random/getRandomInRange";

const _workerGeneratorIds = create_counter_generator();

const workerGeneratorIds = () => {
  return `${Date.now()}_${_workerGeneratorIds()}_${getRandomString()}`;

  function getRandomString() {
    return generateRandomString(getRandomInRange(8, 14))
  }
}

export const shared_worker_store = create_shared_worker_store();

function create_shared_worker_store() {
  const store = writable<Store>();

  const requestBefore: _SendProps[] = [];
  const requestBeforeSubscribe: Set<Parameters<Store['subscribeMessage']>> = new Set();
  const unsubscribeMap: Map<
    Parameters<Store['subscribeMessage']>,
    (() => void)
  > = new Map();

  const result = {
    subscribe: store.subscribe,
    set: store.set,
    subscribeWorker: (
      ...args: Parameters<Store['subscribeMessage']>
    ) => {
      requestBeforeSubscribe.add(args);

      return () => {
        if(requestBeforeSubscribe.has(args)) {
          requestBeforeSubscribe.delete(args);
        }
        else {
          if(unsubscribeMap.has(args)) {
            unsubscribeMap.get(args)!();
            unsubscribeMap.delete(args);
          };
        }
      };
    },
    fetch: (
      params: FetchParams
    ): ResultByPath[typeof params['path']] => {
      return new Promise((res, rej) => {

        const idRequest = workerGeneratorIds();
        requestBefore.push({
          data: {
            ...params,
            idRequest,
            type: EVENT_TYPES.FETCH,
          },
          res,
        });
      });
    }
  }

  store.subscribe(async (newStore) => {
    if(!newStore) return;
    result.subscribeWorker = (
      ...args
    ) => {
      return newStore.subscribeMessage(...args);
    };
    result.fetch = (
      p: FetchParams
    ): ResultByPath[typeof p['path']] => {
      return newStore.sendMessage({
        payload: p,
        idRequest: workerGeneratorIds(),
        type: EVENT_TYPES.FETCH,
      }).then(v => v.payload);
    };
    const tmpListSubscribeArgs = Array.from(requestBeforeSubscribe);
    for (
      let _item = tmpListSubscribeArgs.pop();
      _item;
      _item = tmpListSubscribeArgs.pop()
    ) {
      const item = _item;
      requestBeforeSubscribe.delete(item);

      unsubscribeMap.set(
        item, 
        result.subscribe(...item),
      );
    }

    for (
      let _item = requestBefore.pop();
      _item;
      _item = requestBefore.pop()
    ) {
      const item = _item;
      result.fetch(item.data)
        .then((param) => {
          item.res(param as SendProps)
          //requestBefore[item.idRequest]
        });
    }
  });

  return result;
}

type FetchParams = BackMiddlewarePayload;
type _SendProps = {
  data: SendProps;
  res: (p: SendProps) => void;
}
type SendProps = BackMiddlewareEvent;
export type SubscribeParam = BackMiddlewarePayloadSubscribe;
export type SubscribeUtilsParam<P extends SubscribeParam> = {
  callback: (p: ResultByPath[P['path']]) => void;
};
type Store = {
  sendMessage: <F extends BackMiddlewareEventFetch = BackMiddlewareEventFetch>(p: BackMiddlewarePayloadFetch) => Promise<ResultByPath[F['payload']['path']]>;
  subscribeMessage: <P extends SubscribeParam = SubscribeParam>(
    p: P,
    utils: SubscribeUtilsParam<P>
  /** Функция отписки */
  ) => () => void;
}