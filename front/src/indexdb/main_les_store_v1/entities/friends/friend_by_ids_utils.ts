import { arrayRemove } from "../../../../core/array_utils/arrayRemove";
import { back_store } from "../../../../local_back/back_store";
import { friend_ids_store_utils } from "../../../../local_back/back_store/friend_ids_store_utils";
import { put_accounts } from "../accounts/put_accounts";
import { TABLE_NAMES } from "../constats/TABLE_NAMES";
import { entity_service } from "../entity_service/entity_service"
import { source_entity_service } from "../entity_service/source_entity_service";
import { add_friend_ids } from "./add_friend_ids";
import { FRIEND_IDS_VERSION } from "./constants";
import { delete_friend } from "./delete_friend";
import type { FriendIdsEntityFull } from "./types/FriendIdsEntityFull";

export const friend_by_ids_utils = {
  put: put_utils,
  recovery: recovery_by_ids_friends,
  delete: delete_by_id,
  delete_friend: _delete_friend,
}

/**
 * 
 * @param ids friend
 */
async function _delete_friend(ids: string[]) {
  for(const idItem of ids) {
    const friend = back_store.friends_by_id[idItem];

    const friendIds = back_store.friends_ids_by_accounts_id[friend.explicitMyAccId];

    friendIds.ids = arrayRemove(friendIds.ids, idItem);

    await put_utils([friendIds]);
  }

}

async function delete_by_id(friendIds: string[]) {
  for(const idItem of friendIds) {
    if(Array.isArray(back_store.friends_by_id[idItem].ids)) {
      await delete_friend(back_store.friends_by_id[idItem].ids);
    }
    else console.error('ошибка потом добавить уведомление если не так что то');
  }

  await entity_service.delete_entities({
    ids: friendIds,
    table_name: TABLE_NAMES.friends_ids,
  });

  await friend_ids_store_utils.delete(friendIds);
}

async function put_utils(
    list: FriendIdsEntityFull[],
) {

    const replaced_entities = await entity_service.put_entities<FriendIdsEntityFull>({
      table_name: TABLE_NAMES.friends_ids,
      new_list: list,
      entityVersion: FRIEND_IDS_VERSION,
    });

    for(const item of replaced_entities) {
      friend_ids_store_utils.add([item], item.explicitMyAccId);
    }
}

async function recovery_by_ids_friends() {
  const accs = Object.values(back_store.accounts_by_id);
  let countNotFount = 0;

  for (const acc of accs) {
    if (!acc.friendsIdJoin) {
      const [friendIdJoin] = await add_friend_ids({
        list: [{ ids: [] }],
        explicitMyAccId: acc.id,
      });

      await put_accounts([{
        ...acc,
        friendsIdJoin: friendIdJoin.id,
      }]);
    }
  }

  await source_entity_service.get_all_entities({
    table_name: TABLE_NAMES.friends,
    on: async ({entity, onNext}) => {
      for (const acc of accs) {
        const decryptedEntity = await entity_service.decrypt_by_explicitMyAccId({
          cipherText: entity.data,
          explicitMyAccId: acc.id,
        });

        if(decryptedEntity) {
          const prevFriendIds = back_store.friends_ids_by_accounts_id[acc.id];

          if(!prevFriendIds.ids.includes(decryptedEntity.id)) {
            prevFriendIds.ids = [
              ...prevFriendIds.ids,
              decryptedEntity.id,
            ];

            await put_utils([
              back_store.friends_ids_by_accounts_id[acc.id]
            ]);
          }

          break;
        }
        else ++countNotFount;
      }

      onNext();
    }
  });

  return {
    countNotFount,
  }
}
