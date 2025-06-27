import { add_friend, type FriendEntity, type FriendEntityFull } from "../../indexdb/friends/add_friend";
import { get_friends } from "../../indexdb/friends/get_friends";
import { get_account_by_id } from "../../indexdb/accounts/get_account_by_id";
import { privateKeyStringToPeerId } from "../../libs/libp2p";
import { connectionLibp2p } from "../../api/libp2p/createLibp2pNode";

export interface CreateFriendsLibp2pServiceOptions {
  accId: string;
}

export const createFriendsLibp2pService = (options: CreateFriendsLibp2pServiceOptions) => {
  const { accId } = options;

  // Локальное хранилище друзей по peerId
  let _friendsByPeerIds: Record<string, FriendEntityFull> = {};
  let nodeLibp2p: any = null;

  const initializeNodeLibp2p = async (): Promise<void> => {
    if (nodeLibp2p) return;

    const account = await get_account_by_id(accId);
    if (!account) {
      throw new Error(`Account not found: ${accId}`);
    }

    nodeLibp2p = await connectionLibp2p({
      keyPair: account._libp2p_keyPair
    });

    if (!nodeLibp2p) {
      throw new Error('Failed to create libp2p node');
    }
  };

  const loadFriendsAndMapByPeerIds = async (): Promise<void> => {
    const allFriends = await get_friends();
    const accountFriends = allFriends.filter(friend => friend.myAccId === accId);
    
    _friendsByPeerIds = {};
    
    for (const friend of accountFriends) {
      try {
        const peerId = privateKeyStringToPeerId(friend.friendPubKeyLibp2p);
        _friendsByPeerIds[peerId.toString()] = friend;
      } catch (error) {
        console.error(`Failed to parse peerId for friend ${friend.id}:`, error);
      }
    }
  };

  return {
    /**
     * Добавляет нового друга и возвращает FriendEntityFull с id
     */
    async addFriend(friendData: FriendEntity): Promise<FriendEntityFull> {
      await add_friend([{ ...friendData, myAccId: accId }]);
      
      // Перезагружаем список друзей
      await loadFriendsAndMapByPeerIds();
      
      // Находим добавленного друга по peerId
      try {
        const peerId = privateKeyStringToPeerId(friendData.friendPubKeyLibp2p);
        const addedFriend = _friendsByPeerIds[peerId.toString()];
        
        if (!addedFriend) {
          throw new Error('Failed to find added friend');
        }
        
        return addedFriend;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to add friend: ${errorMessage}`);
      }
    },

    /**
     * Словарь друзей по peerId для быстрого поиска
     */
    get _friendsByPeerIds() {
      return _friendsByPeerIds;
    },

    /**
     * Доступ к nodeLibp2p
     */
    get nodeLibp2p() {
      return nodeLibp2p;
    },

    /**
     * Инициализация сервиса - создает nodeLibp2p и загружает список друзей
     */
    async initialize(): Promise<void> {
      await initializeNodeLibp2p();
      await loadFriendsAndMapByPeerIds();
    }
  };
};

export type FriendsLibp2pService = ReturnType<typeof createFriendsLibp2pService>;
