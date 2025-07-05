import type { Account } from "../../indexdb/main_les_store_v1/entities/accounts/get_accounts";
import type { FriendEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/add_friend";
import type { RoomEntityFull } from "../../indexdb/main_les_store_v1/entities/rooms/add_room";

export interface Libp2pNodeInstance {
  peerId: string;
  multiaddrs: string[];
  isStarted: boolean;
  node: any; // actual libp2p node instance
}

export const back_store = {
  accounts_by_id: {} as Record<string, Account>,
  friends_by_id: {} as Record<string, FriendEntityFull>,
  rooms_by_id: {} as Record<string, RoomEntityFull>,
}
