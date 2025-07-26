//import { AES } from "../../../core/crypt";
import { encrypt_curve25519_from_pass } from "../../../../core/crypt";
import type { FriendEntity, FriendEntityFull } from "./types";
import { gen_pass } from "../../../../core/random/gen_pass";
import { uuidv4 } from "../../../../core/uuid";
import { indexdb_wrapper } from "../../indexdb_wrapper";
import {
  privateKeyToString,
  recommendedGenerateKeyPair,
} from "../../../../libs/libp2p";
import { back_store } from "../../../../local_back/back_store/back_store";
import { FRIENDS_VERSION } from "./constants";
import { entity_service } from "../entity_service/entity_service";
import { friends_store_utils } from "../../../../local_back/back_store/friends_store_utils";
import type { FriendIdsEntity } from "./types/FriendIdsEntity";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import type { FriendIdsFull } from "./types/FriendIdsFull";

type ServiceParams = {
  list: FriendIdsEntity[];
  myAccId: string,
}

// 1. нужно получать myId из аргумента
export async function add_friend_ids({
  list,
  myAccId,
}:ServiceParams): Promise<FriendIdsEntity[]> {
  const newFriends = await entity_service.addEntities<
    FriendIdsEntity,
    FriendIdsFull
  >({
    table_name: TABLE_NAMES.friends_ids,
    new_list: list,
    explicitMyAccId: myAccId,
    entityVersion: FRIENDS_VERSION,
  });

  //friends_store_utils.add(newFriends);

 //const acc = back_store.accounts_by_id[myAccId];
 //newFriends.forEach((friendEl) => {
 //  acc.friendsByIds.push(friendEl.id);
 //});

  

  return newFriends;
}
