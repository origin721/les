import { CHANNEL_NAMES } from "../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddAccounts } from "../core/broadcast_channel/front_middleware_channel";
import { add_accounts, type AccountEntity } from "../indexdb/accounts/add_accounts";
import { delete_accounts } from "../indexdb/accounts/delete_accounts";
import { get_accounts, type Account } from "../indexdb/accounts/get_accounts";
import { login } from "../indexdb/accounts/login";
import { put_accounts, type AccountEntityPut } from "../indexdb/accounts/put_accounts";
import { back_store } from "./back_store";
import { EVENT_TYPES, PATHS } from "./constant";
import { accounts_service } from "./modules/accounts_service";

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

export type AddAccountsPayload = {
  path: typeof PATHS['ADD_ACCOUNTS'];
  body: {
    list: AccountEntity[];
  };
}

export type DeleteAccountsPayload = {
  path: typeof PATHS['DELETE_ACCOUNTS'];
  body: {
    ids: string[];
  };
}

export type PutAccountsPayload = {
  path: typeof PATHS['PUT_ACCOUNTS'];
  body: {
    list: AccountEntityPut[];
  };
}

export type PutFriendsPayload = {
  path: typeof PATHS['PUT_FRIENDS'];
  body: {
    list: AccountEntityPut[];
  };
}

export type LoginPayload = {
  path: typeof PATHS['LOGIN'];
  body: {
    pass: string;
  };
}

export type GetAccountsPayload = {
  path: typeof PATHS['GET_ACCOUNTS'];
}

export type GetPeerIdByAccIdForLibp2pPayload = {
  path: typeof PATHS['GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P'];
  body: {
    accId: string;
  }
}

export type ResultByPath = {
  [key in typeof PATHS['GET_ACCOUNTS']]: ReturnType<typeof get_accounts>;
};

export type BackMiddlewarePayload = Extract<
  GetAccountsPayload
  |DeleteAccountsPayload
  |PutAccountsPayload
  |AddAccountsPayload
  |GetPeerIdByAccIdForLibp2pPayload
  |LoginPayload
,{
  path: keyof typeof PATHS;
  body?: any;
}>;

export type BackMiddlewareEvent = {
  idRequest: IdRequest;
  type: typeof EVENT_TYPES['FETCH'];
  payload: BackMiddlewarePayload;
}



export async function backMiddleware(
  props: BackMiddlewareProps
 ): ResultByPath[typeof props['payload']['path']] {
  //console.log('worker-shared',{props});

  try {
    if (props.payload.path === PATHS.LOGIN) {
      return await accounts_service.onLogin(props.payload);
    }
    if (props.payload.path === PATHS.GET_PEER_ID_BY_ACC_ID_FOR_LIBP2P) {
      return await accounts_service.getPeerIdForLibp2p(props.payload.body.accId);
    }
    if (props.payload.path === PATHS.GET_ACCOUNTS) {
      return await accounts_service.getList();
    }
    if (props.payload.path === PATHS.DELETE_ACCOUNTS) {
      return await accounts_service.delete(props.payload.body.ids);
    }
    if (props.payload.path === PATHS.ADD_ACCOUNTS) {
      // TODO: вынести в сервис
      return await add_accounts(props.payload.body.list);
    }
    if (props.payload.path === PATHS.PUT_ACCOUNTS) {
      return await accounts_service.put(props.payload.body.list);
    }
  }
  catch (err) {
    console.error(err);
  }

  return null;

 //return new Promise((res, rej) => {
 //  setTimeout(() => {
 //    res({aaa:'vvvv', props});
 //    channel.postMessage({ action: 'notify', data: 'Hello, tabs!2' });
 //  }, 5000);
 //});
}