import type { FriendIdsEntity } from "../../indexdb/main_les_store_v1/entities/friends/types/FriendIdsEntity";
import { back_store } from "./back_store";

export const room_ids_store_utils = {
  add(friends: FriendIdsEntity[], explicitMyAccId: string) {
    for (let friendIds of friends) {
      back_store.friends_ids_by_accounts_id[explicitMyAccId] = friendIds
    };
  },

  delete(ids: string[]) {
    for (let id of ids) {
      delete back_store.friends_ids_by_accounts_id[id];
    }
  },

  getById(id: string) {
    return back_store.friends_ids_by_accounts_id[id] || null;
  },

}