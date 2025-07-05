import { PATHS } from "../../local_back/constant/PATHS";
import { shared_worker_store } from "../../processes/shared_worker/shared_worker_store";
import type { FriendEntity } from "../../indexdb/main_les_store_v1/entities/friends/add_friend";
import type { FriendEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/add_friend";
import type { FriendEntityPut } from "../../indexdb/main_les_store_v1/entities/friends/put_friends";
import type { Account } from "../../indexdb/main_les_store_v1/entities/accounts/get_accounts";
import { devAPI, prodError } from "../../core/debug/logger";
import { friends } from "./friends";
import { accounts } from "./accounts";


/**
 * Основной API для работы с backend через shared worker
 */
export const sharedWorkerApi = {
  friends: friends,
  accounts: accounts,
};

export default sharedWorkerApi;
