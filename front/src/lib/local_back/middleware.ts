import { CHANNEL_NAMES } from "../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddAccounts } from "../core/broadcast_channel/front_middleware_channel";
import { add_accounts, type AccountEntity } from "../core/indexdb/accounts/add_accounts";
import { delete_accounts } from "../core/indexdb/accounts/delete_accounts";
import { get_accounts, type Account } from "../core/indexdb/accounts/get_accounts";
import { login } from "../core/indexdb/accounts/login";
import { put_accounts, type AccountEntityPut } from "../core/indexdb/accounts/put_accounts";
import { back_store } from "./back_store";
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

export type LoginPayload = {
  path: typeof PATHS['LOGIN'];
  body: {
    pass: string;
  };
}

export type GetAccountsPayload = {
  path: typeof PATHS['GET_ACCOUNTS'];
}

export type ResultByPath = {
  [key in typeof PATHS['GET_ACCOUNTS']]: ReturnType<typeof get_accounts>;
};

export type BackMiddlewarePayload = Extract<
  GetAccountsPayload
  |DeleteAccountsPayload
  |PutAccountsPayload
  |AddAccountsPayload
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

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export type AccountDto = Omit<Account, 'pass'>;
function accountToDto(a: Account): AccountDto {
  return {
    namePub: a.namePub,
    id: a.id,
    httpServers: a.httpServers,
    date_created: a.date_created,
    date_updated: a.date_updated,
  }

}

export async function backMiddleware(
  props: BackMiddlewareProps
 ): ResultByPath[typeof props['payload']['path']] {
  //console.log('worker-shared',{props});
  
  try {
    if (props.payload.path === PATHS.LOGIN) {
      const accounts = await login(props.payload.body.pass);
      for(let ac of accounts) {
        back_store.accounts_by_id[ac.id] = ac;
      }
      const broadcast_event:PostMessageParamAddAccounts = {
        action: FrontMiddlewareActions.ADD_ACCOUNTS,
        data: {
          list: accounts.map(accountToDto)
        }
      }
      channel.postMessage(broadcast_event);
      return;
    }
    if (props.payload.path === PATHS.GET_ACCOUNTS) {
      await getAccounts();
      return;
    }
    if (props.payload.path === PATHS.DELETE_ACCOUNTS) {
      try {
        await delete_accounts(props.payload.body.ids);
        for(let id of props.payload.body.ids) {
          delete back_store.accounts_by_id[id];
        }
      }
      catch(err) {}
    }
    if (props.payload.path === PATHS.ADD_ACCOUNTS) {
      return await add_accounts(props.payload.body.list);
    }
    if (props.payload.path === PATHS.PUT_ACCOUNTS) {
      await put_accounts(props.payload.body.list);

      await getAccounts();
      return;
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


async function getAccounts() {
  const accounts = await get_accounts();
  for (let ac of accounts) {
    back_store.accounts_by_id[ac.id] = ac;
  }
  const broadcast_event: PostMessageParamAddAccounts = {
    action: FrontMiddlewareActions.ADD_ACCOUNTS,
    data: {
      list: accounts.map(accountToDto)
    }
  }
  channel.postMessage(broadcast_event);
}