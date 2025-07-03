import { connectionLibp2p } from "../../api/libp2p/createLibp2pNode";
import { back_store } from "../back_store/back_store";

export interface CreateFriendsLibp2pServiceOptions {
  accId: string;
}

export const createFriendsLibp2pService = async (options: CreateFriendsLibp2pServiceOptions) => {
  const account = back_store.accounts_by_id[options.accId];
  if (!account) {
    throw new Error(`Account with id ${options.accId} not found in back_store`);
  }
  return await connectionLibp2p({ keyPair: account._libp2p_keyPair });
};
