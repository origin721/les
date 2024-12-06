import type { AccountDto } from "../../local_back/middleware";
import type { FrontMiddlewareActions } from "./constants/FRONT_MIDDLEWARE_ACTIONS";

export type PostMessageParamDeleteAccounts = {
  action: typeof FrontMiddlewareActions['DELETE_ACCOUNTS'],
  data: {
    ids: string[];
  },
}

export type PostMessageParamAddAccounts = {
  action: typeof FrontMiddlewareActions['ADD_ACCOUNTS'],
  data: {
    list: AccountDto[];
  },
}

export type PostMessageParam = Extract<
  PostMessageParamAddAccounts
  | PostMessageParamDeleteAccounts
  ,
  {
    action: string;
    data: any;
  }
>