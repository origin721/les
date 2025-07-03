import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddAccounts, PostMessageParamDeleteAccounts } from "../../core/broadcast_channel/front_middleware_channel";
import type { AccountEntity } from "../../indexdb/accounts/add_accounts";
import { delete_accounts } from "../../indexdb/accounts/delete_accounts";
import { get_account_by_id } from "../../indexdb/accounts/get_account_by_id";
import { get_accounts, type Account } from "../../indexdb/accounts/get_accounts";
import { login } from "../../indexdb/accounts/login";
import { put_accounts, type AccountEntityPut } from "../../indexdb/accounts/put_accounts";
import { privateKeyStringToPeerId } from "../../libs/libp2p";
import { back_store } from "../back_store/back_store";
import type { LoginPayload } from "../middleware";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const accounts_service = {
  async put(list: AccountEntityPut[]) {
    await put_accounts(list);

    await accounts_service.getList();
  },
  async delete(ids: string[]) {
      try {
        await delete_accounts(ids);
        for(let id of ids) {
          delete back_store.accounts_by_id[id];
        }
        // broadcast delete
        const broadcast_event: PostMessageParamDeleteAccounts = {
          action: FrontMiddlewareActions.DELETE_ACCOUNTS,
          data: {
            ids: ids,
          }
        }
        channel.postMessage(broadcast_event);
      }
      catch(err) {}
  },
  async getList() {

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
  },
  async onLogin(props: LoginPayload) {
      const accounts = await login(props.body.pass);
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
  },
  async getPeerIdForLibp2p(accId: string) {
    const acc = await get_account_by_id(accId);
    const peerId = privateKeyStringToPeerId(acc._libp2p_keyPair);

    return peerId.toString();
  },
}

export type AccountDto = Omit<Account, 'pass'|'_libp2p_keyPair'>;
function accountToDto(a: Account): AccountDto {
  return {
    namePub: a.namePub,
    id: a.id,
    httpServers: a.httpServers,
    date_created: a.date_created,
    date_updated: a.date_updated,
  }

}