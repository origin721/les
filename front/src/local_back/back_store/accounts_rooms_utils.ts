import type { AccountRoomsEntityFull } from "../../indexdb/main_les_store_v1/entities/accounts_rooms/types/AccountRoomsEntityFull";
import { back_store } from "./back_store";

export const accounts_rooms_utils = {
  add(accounts_rooms: AccountRoomsEntityFull[]) {
    for (const entity of accounts_rooms) {
      back_store.accounts_rooms_by_id[entity.id] = entity;
    };
  },

  delete(ids: string[]) {
    for (let id of ids) {
      delete back_store.accounts_rooms_by_id[id];
    }
  },

  getById(id: string) {
    return back_store.accounts_rooms_by_id[id] || null;
  },
}