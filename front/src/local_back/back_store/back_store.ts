import type { Account } from "../../indexdb/accounts/get_accounts";
import type { FriendEntityFull } from "../../indexdb/friends/add_friend";

export interface Libp2pNodeInstance {
  peerId: string;
  multiaddrs: string[];
  isStarted: boolean;
  node: any; // actual libp2p node instance
}

export const back_store = {
  accounts_by_id: {} as Record<string, Account>,
  friends_by_id: {} as Record<string, FriendEntityFull>,
}
