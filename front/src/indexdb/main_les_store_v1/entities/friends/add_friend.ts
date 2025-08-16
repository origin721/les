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
import { friend_by_ids_utils } from "./friend_by_ids_utils";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";

type ServiceParams = {
  list: FriendEntity[];
  myAccId: string,
}

// 1. нужно получать myId из аргумента
export async function add_friend({
  list,
  myAccId,
}:ServiceParams): Promise<FriendEntityFull[]> {
  const acc = back_store.accounts_by_id[myAccId];

  const newFriends = await entity_service.addEntities<
    FriendEntity,
    FriendEntityFull
  >({
    table_name: TABLE_NAMES.friends,
    new_list: list.map(el => {
      return {
        ...el,
        explicitMyAccId: el.explicitMyAccId||el.myAccId,
        joinFriendId: acc.friendsIdJoin
      };
    }),
    explicitMyAccId: myAccId,
    entityVersion: FRIENDS_VERSION,
  });

  friends_store_utils.add(newFriends);

  newFriends.forEach((friendEl) => {
    //acc.friendsByIds.push(friendEl.id);

    const prev_friends_by_ids = back_store
      .friends_ids_by_accounts_id[friendEl.explicitMyAccId];
    if (prev_friends_by_ids) prev_friends_by_ids.ids.push(friendEl.id);
  });


  await friend_by_ids_utils.put(Object.values(
    back_store.friends_ids_by_accounts_id
  ));

  //friends_store_utils.add(newFriends);

  return newFriends;
}
