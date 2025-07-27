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
import type { FriendIdsEntityFull } from "./types/FriendIdsEntityFull";
import { friend_by_ids_utils } from "./friend_by_ids_utils";
import { put_accounts } from "../accounts/put_accounts";
import { friend_ids_store_utils } from "../../../../local_back/back_store/friend_ids_store_utils";

type ServiceParams = {
  list: FriendIdsEntity[];
  explicitMyAccId: string,
}

// 1. нужно получать myId из аргумента
export async function add_friend_ids({
  list,
  explicitMyAccId: explicitMyAccId,
}:ServiceParams): Promise<FriendIdsEntityFull[]> {
  const newFriends = await entity_service.addEntities<
    FriendIdsEntity,
    FriendIdsFull
  >({
    table_name: TABLE_NAMES.friends_ids,
    new_list: list,
    explicitMyAccId: explicitMyAccId,
    entityVersion: FRIENDS_VERSION,
  });

  friend_ids_store_utils.add(newFriends);

  for(const el of newFriends) {
    const acc = back_store.accounts_by_id[el.explicitMyAccId];
    if (acc) {
      //acc.friendsIdJoin = el.id;
      await put_accounts([{
        ...acc,
        friendsIdJoin: el.id,
      }]);
    }

  }


 //for (const friend of newFriends) {
 //  const prevFriendByIds = back_store.friends_ids_by_accounts_id[friend.explicitMyAccId];
 //  if(prevFriendByIds) {
 //    prevFriendByIds.ids = [
 //      ...prevFriendByIds.ids,
 //      friend.id
 //    ]
 //  }
 //}

 //await friend_by_ids_utils.put(
 //  Object.values(
 //    back_store.friends_ids_by_accounts_id
 //  )
 //);

 //const acc = back_store.accounts_by_id[myAccId];
 //newFriends.forEach((friendEl) => {
 //  acc.friendsByIds.push(friendEl.id);
 //});

  

  return newFriends;
}
