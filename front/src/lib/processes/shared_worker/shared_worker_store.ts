import { writable } from "svelte/store";
import type { BackMiddlewareProps } from "../../local_back/middleware";
import { create_counter_generator } from "../../core/create_counter_generator";

const workerGeneratorIds = create_counter_generator();

export const shared_worker_store = create_shared_worker_store();

function create_shared_worker_store() {
  const store = writable<Store>();

  const requestBefore: _SendProps[] = [];
  const result = {
    subscribe: store.subscribe,
    set: store.set,
    fetch: (params: FetchParams) => {
      return new Promise((res, rej) => {

        const idRequest = workerGeneratorIds();
        requestBefore.push({
          data: {
            ...params,
            idRequest,
            type: 'fetch',
          },
          res,
        });
      });
    }
  }

  store.subscribe(async (newStore) => {
    if(!newStore) return;
    result.fetch = (p: FetchParams) => {
      return newStore.sendMessage({
        ...p,
        idRequest: workerGeneratorIds(),
        type: 'fetch',
      });
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

type FetchParams = { payload: any };
type _SendProps = {
  data: SendProps;
  res: (p: SendProps) => void;
}
type SendProps = FetchParams & {
  idRequest: any;
  type: 'fetch';
};
type Store = {
  sendMessage: (p: SendProps) => Promise<BackMiddlewareProps>;
}