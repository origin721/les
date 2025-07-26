import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type {
  PostMessageParamAddAccounts,
  PostMessageParamDeleteAccounts,
} from "../../core/broadcast_channel/front_middleware_channel";
import type {
  AccountEntity,
  AccountEntityPut,
} from "../../indexdb/main_les_store_v1/entities/accounts/types";
import { delete_accounts } from "../../indexdb/main_les_store_v1/entities/accounts/delete_accounts";
import { get_account_by_id } from "../../indexdb/main_les_store_v1/entities/accounts/get_account_by_id";
import {
  get_accounts,
  type Account,
} from "../../indexdb/main_les_store_v1/entities/accounts/get_accounts";
import { login } from "../../indexdb/main_les_store_v1/entities/accounts/login";
import { put_accounts } from "../../indexdb/main_les_store_v1/entities/accounts/put_accounts";
import { privateKeyStringToPeerId } from "../../libs/libp2p";
import { back_store } from "../back_store/back_store";
import type { LoginPayload } from "../middleware";
import { UserMigrationManager } from "../../indexdb/main_les_store_v1/user_migration_manager";
import { UserStateManager } from "../../indexdb/db_state_manager_v1/user_state_manager";
import { MIGRATIONS_REGISTRY } from "../../indexdb/main_les_store_v1/migrations/MIGRATIONS_REGISTRY";
import { ConnectionManager } from "../../indexdb/main_les_store_v1/connection_manager";
import { updateAccById } from "../subscribeModules/accounts_by_id_subscribe";
import { accounts_store_utils } from "../back_store/accounts_store_utils";
import { get_friend_by_id } from "../../indexdb/main_les_store_v1/entities/friends/get_friend_by_id";
import type { AccountEntityFull } from "../../indexdb/main_les_store_v1/entities/accounts/types/full_account_entity";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export const accounts_service = {
  async put(list: AccountEntityPut[]) {
    await put_accounts(list);
    //await accounts_service.getList();

// TODO: put не такой как другие не тут меняется back_store
    updateAccById();
  },
  async delete(ids: string[]) {
    try {
      await delete_accounts(ids);
     //for (let id of ids) {
     //  delete back_store.accounts_by_id[id];
     //}
      // broadcast delete
     //const broadcast_event: PostMessageParamDeleteAccounts = {
     //  action: FrontMiddlewareActions.DELETE_ACCOUNTS,
     //  data: {
     //    ids: ids,
     //  },
     //};
     //channel.postMessage(broadcast_event);
    } catch (err) {}
  },
  async getList() {
    return back_store.accounts_by_id;
   //const accounts = await get_accounts();

   //const broadcast_event: PostMessageParamAddAccounts = {
   //  action: FrontMiddlewareActions.ADD_ACCOUNTS,
   //  data: {
   //    list: accounts.map(accountToDto),
   //  },
   //};
   //channel.postMessage(broadcast_event);

    //back_store.accounts_by_id = {};
   //accounts.forEach(el => {
   //  back_store.accounts_by_id[el.id] = el;
   //});
  },
  async onLogin(props: LoginPayload) {
    const accounts = await login(props.body.pass);

    // Выполняем пользовательские миграции для каждого аккаунта
    for (const account of accounts) {
      try {
        const userState = await UserStateManager.getUserState(account.id);
        const oldVersion = userState?.currentVersion || 0;
        const newVersion = Math.max(
          ...Object.keys(MIGRATIONS_REGISTRY).map(Number),
        );

        if (oldVersion < newVersion) {
          await UserMigrationManager.migrateUser({
            db: await ConnectionManager.getConnection(),
            currentUser: { id: account.id, pass: props.body.pass },
            oldVersion,
            newVersion,
          });
        }
      } catch (error) {
        console.error(`❌ Ошибка миграции пользователя ${account.id}:`, error);
        // Не блокируем вход при ошибке миграции конкретного пользователя
      }
    }

            accounts_store_utils.add(accounts);

            accounts.forEach((acc) => {
              (acc.friendsByIds||[]).forEach((friendId) => {
                get_friend_by_id({
                  friendId: friendId,
                  explicitMyAccId: acc.id,
                });

              });
            });


   //for (let ac of accounts) {
   //  back_store.accounts_by_id[ac.id] = ac;
   //}
   //updateAccById();
   //const broadcast_event: PostMessageParamAddAccounts = {
   //  action: FrontMiddlewareActions.ADD_ACCOUNTS,
   //  data: {
   //    list: accounts.map(accountToDto),
   //  },
   //};
    //channel.postMessage(broadcast_event);
  },
  async getPeerIdForLibp2p(accId: string) {
    const acc = await get_account_by_id(accId);
    const peerId = privateKeyStringToPeerId(acc._libp2p_keyPair);

    return peerId.toString();
  },
};

export type AccountDto = Omit<Account, "_pass" | "pass" | "_libp2p_keyPair">;
export function accountToDto(a: Account): AccountDto {
  return {
    namePub: a.namePub,
    id: a.id,
    httpServers: a.httpServers,
    date_created: a.date_created,
    date_updated: a.date_updated,
    friendsByIds: a.friendsByIds,
    version: a.version,
  };
}
