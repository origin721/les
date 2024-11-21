import { PATHS } from "./constant";

type IdRequest = string | number;
export type BackMiddlewareProps = {
  type: 'fetch';
  payload: BackMiddlewarePayload;
  /**
   * Индификатор который вернётся в ответе
   * например для shared worker что бы было понятно
   * что это ответ для этого запроса
   */
  idRequest: IdRequest;
  listener: (cb: Listener) => void;
}
type Listener = (e: BackMiddlewareEvent) => void;
type BackMiddlewarePayload = {
  path: keyof typeof PATHS;
  body: any;
}

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: 'fetch';
  payload: any;
}

export function backMiddleware(
  props: BackMiddlewareProps
) {
  console.log('worker-shared',{props});
  
  return new Promise((res, rej) => {
    setTimeout(() => {
      res({aaa:'vvvv'});
    }, 5000);
  });
}