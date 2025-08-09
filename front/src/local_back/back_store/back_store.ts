import type { AccountEntityFull } from "../../indexdb/main_les_store_v1/entities/accounts/types/full_account_entity";
import type { FriendEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/types";
import type { FriendIdsEntity } from "../../indexdb/main_les_store_v1/entities/friends/types/FriendIdsEntity";
import type { FriendIdsEntityFull } from "../../indexdb/main_les_store_v1/entities/friends/types/FriendIdsEntityFull";
import type { RoomEntityFull } from "../../indexdb/main_les_store_v1/entities/rooms/types";

export interface Libp2pNodeInstance {
  peerId: string;
  multiaddrs: string[];
  isStarted: boolean;
  node: any; // actual libp2p node instance
}

export const back_store = {
  accounts_by_id: {} as Record<string, AccountEntityFull>,
  friends_by_id: {} as Record<string, FriendIdsEntityFull>,
  friends_ids_by_accounts_id: {} as Record<string, FriendIdsEntityFull>,
  rooms_by_id: {} as Record<string, RoomEntityFull>,
}
