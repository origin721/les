import type { FriendIdsEntity } from "../../indexdb/main_les_store_v1/entities/friends/types/FriendIdsEntity";
import type { FriendIdsEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/types/FriendIdsEntityFull";
import { back_store } from "./back_store";

export const friend_ids_store_utils = {
  add(friends: FriendIdsEntityFull[]) {
    for (let friendIds of friends) {
      back_store.friend_ids[friendIds.id] = friendIds
    };
  },

  delete(ids: string[]) {
    for (let id of ids) {
      delete back_store.rooms_by_id[id];
    }
  },

  getById(id: string) {
    return back_store.rooms_by_id[id] || null;
  },

}