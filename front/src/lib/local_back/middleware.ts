import { CHANNEL_NAMES } from "../core/broadcast_channel/constants/CHANNEL_NAMES";
import { get_accounts } from "../core/indexdb/accounts/get_accounts";
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

export type GetAccountsPayload = {
  path: typeof PATHS['GET_ACCOUNTS'];
  body: {
    pass: string;
  };
}

export type ResultByPath = {
  [key in typeof PATHS['GET_ACCOUNTS']]: ReturnType<typeof get_accounts>;
};

export type BackMiddlewarePayload = Extract<GetAccountsPayload,{
  path: keyof typeof PATHS;
  body: any;
}>;

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: typeof EVENT_TYPES['FETCH'];
  payload: BackMiddlewarePayload;
}

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export async function backMiddleware(
  props: BackMiddlewareProps
 ): ResultByPath[typeof props['payload']['path']] {
  //console.log('worker-shared',{props});
  
  try {
    if (props.payload.path === PATHS.GET_ACCOUNTS) {
      return await get_accounts(props.payload.body.pass);
    }
  }
  catch (err) {
    console.error(err);
  }
  
  return null;
 //channel.postMessage({ action: 'notify', data: 'Hello, tabs!1' });
 //return new Promise((res, rej) => {
 //  setTimeout(() => {
 //    res({aaa:'vvvv', props});
 //    channel.postMessage({ action: 'notify', data: 'Hello, tabs!2' });
 //  }, 5000);
 //});
}