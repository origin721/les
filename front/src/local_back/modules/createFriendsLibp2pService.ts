import { add_friend, type FriendEntity, type FriendEntityFull } from "../../indexdb/friends/add_friend";
import { get_friends } from "../../indexdb/friends/get_friends";
import { get_account_by_id } from "../../indexdb/accounts/get_account_by_id";
import { privateKeyStringToPeerId } from "../../libs/libp2p";
import { connectionLibp2p } from "../../api/libp2p/createLibp2pNode";

export interface CreateFriendsLibp2pServiceOptions {
  accId: string;
}

export const createFriendsLibp2pService = async (options: CreateFriendsLibp2pServiceOptions) => {
  const account = await get_account_by_id(options.accId);
  return await connectionLibp2p({ keyPair: account._libp2p_keyPair });
};
