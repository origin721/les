import { writable } from "svelte/store";
import type { BackMiddlewareEvent, BackMiddlewarePayload, BackMiddlewareProps, ResultByPath } from "../../local_back/middleware";
import { create_counter_generator } from "../../core/create_counter_generator";
import { EVENT_TYPES } from "../../local_back/constant";

const workerGeneratorIds = create_counter_generator();

export const shared_worker_store = create_shared_worker_store();

function create_shared_worker_store() {
  const store = writable<Store>();

  const requestBefore: _SendProps[] = [];
  const result = {
    subscribe: store.subscribe,
    set: store.set,
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
    result.fetch = (
      p: FetchParams
    ): ResultByPath[typeof p['path']] => {
      return newStore.sendMessage({
        payload: p,
        idRequest: workerGeneratorIds(),
        type: EVENT_TYPES.FETCH,
      }).then(v => v.payload);
    };
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
type Store = {
  sendMessage: (p: SendProps) => Promise<ResultByPath[typeof p['payload']['path']]>;
}