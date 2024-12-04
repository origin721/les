import { CHANNEL_NAMES } from "../core/broadcast_channel/constants/CHANNEL_NAMES";
import { EVENT_TYPES, PATHS } from "./constant";

type IdRequest = string | number;
export type BackMiddlewareProps = {
  type: typeof EVENT_TYPES['FETCH'];
  payload: BackMiddlewarePayload;
  /**
   * Индификатор который вернётся в ответе
   * например для shared worker что бы было понятно
   * что это ответ для этого запроса
   */
  idRequest: IdRequest;
}
type BackMiddlewarePayload = {
  path: keyof typeof PATHS;
  body: any;
}

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: typeof EVENT_TYPES['FETCH'];
  payload: any;
}

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export function backMiddleware(
  props: BackMiddlewareProps
) {
  console.log('worker-shared',{props});
  
  channel.postMessage({ action: 'notify', data: 'Hello, tabs!1' });
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({aaa:'vvvv', props});
  channel.postMessage({ action: 'notify', data: 'Hello, tabs!2' });
    }, 5000);
  });
}