import type { AccountEntityFull } from "../../indexdb/main_les_store_v1/entities/accounts/types/full_account_entity";
import { updateAccById } from "../subscribeModules/accounts_by_id_subscribe";
import { back_store } from "./back_store";

export const accounts_store_utils = create_accounts_service_utils();

function create_accounts_service_utils() {
  return ({
    add(accs: AccountEntityFull[]) {
      for (let acc of accs) {
        back_store.accounts_by_id[acc.id] = acc
      };
      updateAccById();
    },

    delete(ids: string[]) {
      for (let id of ids) {
        delete back_store.accounts_by_id[id];
      }
      updateAccById();
    },

    getById(roomId: string) {
      return back_store.accounts_by_id[roomId] || null;
    },

   //put(rooms: RoomEntityFull[]) {
   //  for (let room of rooms) {
   //    back_store.rooms_by_id[room.id] = room;
   //  }
   //}
  })
};
