import type { Account } from "../indexdb/accounts/get_accounts";
import type { FriendEntityFull } from "../indexdb/friends/add_friend";

export interface Libp2pNodeInstance {
  peerId: string;
  multiaddrs: string[];
  isStarted: boolean;
  node: any; // actual libp2p node instance
}

export const back_store = {
  accounts_by_id: {} as Record<string, Account>,
  friendsLibp2p: {} as Record<string, Libp2pNodeInstance>,
  friends_by_account: {} as Record<string, Record<string, FriendEntityFull>>,
}
