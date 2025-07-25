import type { FriendEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/types";
import { updateAccById } from "../subscribeModules/accounts_by_id_subscribe";
import { updateFriendsById } from "../subscribeModules/friends_by_id_subscribe";
import { back_store } from "./back_store";

export const friends_store_utils = create_friends_service_utils();

function create_friends_service_utils() {
  return ({
    add(friends: FriendEntityFull[]) {
      for (let friend of friends) {
        back_store.friends_by_id[friend.id] = friend
      };
      updateFriendsById();
    },

    delete(ids: string[]) {
      for (let id of ids) {
        delete back_store.friends_by_id[id];
      }
      updateFriendsById();
    },

    getById(id: string) {
      return back_store.friends_by_id[id] || null;
    },

   //put(rooms: RoomEntityFull[]) {
   //  for (let room of rooms) {
   //    back_store.rooms_by_id[room.id] = room;
   //  }
   //}
  })
};
