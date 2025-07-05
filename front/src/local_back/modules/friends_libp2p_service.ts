import { CHANNEL_NAMES } from "../../core/broadcast_channel/constants/CHANNEL_NAMES";
import { FrontMiddlewareActions } from "../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
import type { PostMessageParamAddAccounts } from "../../core/broadcast_channel/front_middleware_channel";
import { connectionLibp2p } from "../../api/libp2p/createLibp2pNode";
import { get_account_by_id } from "../../indexdb/main_les_store_v1/accounts/get_account_by_id";
import { add_friend, type FriendEntity, type FriendEntityFull } from "../../indexdb/main_les_store_v1/friends/add_friend";
import { get_friends } from "../../indexdb/main_les_store_v1/friends/get_friends";
import { get_friend_by_id } from "../../indexdb/main_les_store_v1/friends/get_friend_by_id";
import { delete_friend } from "../../indexdb/main_les_store_v1/friends/delete_friend";
import { privateKeyStringToPeerId } from "../../libs/libp2p";
import { back_store, type Libp2pNodeInstance } from "../back_store/back_store";

const channel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);

export interface FriendsLibp2pServiceOptions {
  accId: string;
  libp2pApi?: any; // Optional custom libp2p API
}

export interface FriendConnectionStatus {
  friendId: string;
  peerId: string;
  isConnected: boolean;
  lastSeen?: Date;
  multiaddrs: string[];
}

export interface MessagePayload {
  type: 'text' | 'file' | 'system';
  content: string;
  timestamp: Date;
  fromPeerId: string;
  toPeerId: string;
}

export const friends_libp2p_service = (options: FriendsLibp2pServiceOptions) => {
  const { accId, libp2pApi } = options;

  const ensureLibp2pNode = async (): Promise<Libp2pNodeInstance> => {
    if (back_store.friendsLibp2p[accId]?.isStarted) {
      return back_store.friendsLibp2p[accId];
    }

    const account = await get_account_by_id(accId);
    if (!account) {
      throw new Error(`Account not found: ${accId}`);
    }

    const libp2pNode = await connectionLibp2p({
      keyPair: account._libp2p_keyPair
    });

    if (!libp2pNode) {
      throw new Error('Failed to create libp2p node');
    }

    const peerId = privateKeyStringToPeerId(account._libp2p_keyPair);
    
    const nodeInstance: Libp2pNodeInstance = {
      peerId: peerId.toString(),
      multiaddrs: (libp2pNode as any).getMultiaddrs?.()?.map((addr: any) => addr.toString()) || [],
      isStarted: true,
      node: libp2pNode
    };

    back_store.friendsLibp2p[accId] = nodeInstance;
    return nodeInstance;
  };

  return {
    // Core friend management
    async addFriend(friendData: FriendEntity): Promise<FriendEntityFull> {
      await add_friend([{ ...friendData, myAccId: accId }]);
      await this.loadFriendsList();
      
      // Получаем добавленного друга из памяти
      const friends = Object.values(back_store.friends_by_account[accId] || {});
      const addedFriend = friends.find(friend => 
        friend.namePub === friendData.namePub && 
        friend.friendPubKeyLibp2p === friendData.friendPubKeyLibp2p
      );
      
      if (!addedFriend) {
        throw new Error('Failed to add friend');
      }
      
      return addedFriend;
    },

    async removeFriend(friendId: string) {
      await delete_friend(friendId);
      
      // Remove from memory store
      if (back_store.friends_by_account[accId]) {
        delete back_store.friends_by_account[accId][friendId];
      }

      // Disconnect from friend if connected
      await this.disconnectFromFriend(friendId);
    },

    async loadFriendsList() {
      const friends = await get_friends();
      const accountFriends = friends.filter(friend => friend.myAccId === accId);
      
      if (!back_store.friends_by_account[accId]) {
        back_store.friends_by_account[accId] = {};
      }

      for (const friend of accountFriends) {
        back_store.friends_by_account[accId][friend.id] = friend;
      }

      return accountFriends;
    },

    async getFriendById(friendId: string): Promise<FriendEntityFull | null> {
      // Check memory store first
      if (back_store.friends_by_account[accId]?.[friendId]) {
        return back_store.friends_by_account[accId][friendId];
      }

      // Fallback to database
      const friend = await get_friend_by_id(friendId);
      if (friend && friend.myAccId === accId) {
        return friend;
      }

      return null;
    },

    async getFriendsList(): Promise<FriendEntityFull[]> {
      if (!back_store.friends_by_account[accId]) {
        await this.loadFriendsList();
      }

      return Object.values(back_store.friends_by_account[accId] || {});
    },

    // LibP2P node management
    async initializeLibp2pNode() {
      return await ensureLibp2pNode();
    },

    async startLibp2pNode() {
      const nodeInstance = await ensureLibp2pNode();
      
      if (!nodeInstance.node.isStarted()) {
        await nodeInstance.node.start();
        nodeInstance.isStarted = true;
      }

      return nodeInstance;
    },

    async stopLibp2pNode() {
      const nodeInstance = back_store.friendsLibp2p[accId];
      if (nodeInstance?.node && nodeInstance.isStarted) {
        await nodeInstance.node.stop();
        nodeInstance.isStarted = false;
      }
    },

    // Friend connection management
    async connectToFriend(friendId: string): Promise<boolean> {
      const friend = await this.getFriendById(friendId);
      if (!friend) {
        throw new Error(`Friend not found: ${friendId}`);
      }

      const nodeInstance = await ensureLibp2pNode();
      
      try {
        // Parse friend's libp2p public key to get peer ID
        const friendPeerId = privateKeyStringToPeerId(friend.friendPubKeyLibp2p);
        
        // Attempt to dial the friend
        const connection = await nodeInstance.node.dial(friendPeerId);
        
        return connection.status === 'open';
      } catch (error) {
        console.error(`Failed to connect to friend ${friendId}:`, error);
        return false;
      }
    },

    async disconnectFromFriend(friendId: string): Promise<void> {
      const friend = await this.getFriendById(friendId);
      if (!friend) return;

      const nodeInstance = back_store.friendsLibp2p[accId];
      if (!nodeInstance?.node) return;

      try {
        const friendPeerId = privateKeyStringToPeerId(friend.friendPubKeyLibp2p);
        await nodeInstance.node.hangUp(friendPeerId);
      } catch (error) {
        console.error(`Failed to disconnect from friend ${friendId}:`, error);
      }
    },

    async getConnectionStatus(friendId: string): Promise<FriendConnectionStatus | null> {
      const friend = await this.getFriendById(friendId);
      if (!friend) return null;

      const nodeInstance = back_store.friendsLibp2p[accId];
      if (!nodeInstance?.node) {
        return {
          friendId,
          peerId: friend.friendPubKeyLibp2p,
          isConnected: false,
          multiaddrs: []
        };
      }

      try {
        const friendPeerId = privateKeyStringToPeerId(friend.friendPubKeyLibp2p);
        const connections = nodeInstance.node.getConnections(friendPeerId);
        
        return {
          friendId,
          peerId: friendPeerId.toString(),
          isConnected: connections.length > 0,
          multiaddrs: connections.map((conn: any) => conn.remoteAddr.toString())
        };
      } catch (error) {
        return {
          friendId,
          peerId: friend.friendPubKeyLibp2p,
          isConnected: false,
          multiaddrs: []
        };
      }
    },

    async getAllConnectionStatuses(): Promise<FriendConnectionStatus[]> {
      const friends = await this.getFriendsList();
      const statuses = await Promise.all(
        friends.map(friend => this.getConnectionStatus(friend.id))
      );
      
      return statuses.filter(status => status !== null) as FriendConnectionStatus[];
    },

    // Messaging
    async sendMessage(friendId: string, message: MessagePayload): Promise<boolean> {
      const isConnected = await this.connectToFriend(friendId);
      if (!isConnected) {
        throw new Error(`Cannot send message: not connected to friend ${friendId}`);
      }

      const nodeInstance = back_store.friendsLibp2p[accId];
      const friend = await this.getFriendById(friendId);
      
      if (!nodeInstance?.node || !friend) {
        return false;
      }

      try {
        const friendPeerId = privateKeyStringToPeerId(friend.friendPubKeyLibp2p);
        
        // Use libp2p's pubsub or direct stream to send message
        if (nodeInstance.node.services?.pubsub) {
          const topic = `direct-${friendPeerId.toString()}`;
          await nodeInstance.node.services.pubsub.publish(topic, new TextEncoder().encode(JSON.stringify(message)));
          return true;
        }
        
        return false;
      } catch (error) {
        console.error(`Failed to send message to friend ${friendId}:`, error);
        return false;
      }
    },

    async broadcastToFriends(message: Omit<MessagePayload, 'toPeerId'>): Promise<string[]> {
      const friends = await this.getFriendsList();
      const successfulSends: string[] = [];

      for (const friend of friends) {
        try {
          const fullMessage: MessagePayload = {
            ...message,
            toPeerId: friend.friendPubKeyLibp2p
          };
          
          const success = await this.sendMessage(friend.id, fullMessage);
          if (success) {
            successfulSends.push(friend.id);
          }
        } catch (error) {
          console.error(`Failed to send broadcast to friend ${friend.id}:`, error);
        }
      }

      return successfulSends;
    },

    // Discovery and network
    async discoverPeers(): Promise<string[]> {
      const nodeInstance = await ensureLibp2pNode();
      
      if (nodeInstance.node.services?.dht) {
        const peers = nodeInstance.node.getPeers();
        return peers.map((peerId: any) => peerId.toString());
      }

      return [];
    },

    async getNetworkInfo() {
      const nodeInstance = back_store.friendsLibp2p[accId];
      if (!nodeInstance?.node) {
        return {
          peerId: null,
          multiaddrs: [],
          connections: 0,
          isStarted: false
        };
      }

      return {
        peerId: nodeInstance.peerId,
        multiaddrs: nodeInstance.multiaddrs,
        connections: nodeInstance.node.getConnections().length,
        isStarted: nodeInstance.isStarted
      };
    },

    // Event handling
    onPeerConnect(callback: (peerId: string) => void) {
      const nodeInstance = back_store.friendsLibp2p[accId];
      if (nodeInstance?.node) {
        nodeInstance.node.addEventListener('peer:connect', (event: any) => {
          callback(event.detail.toString());
        });
      }
    },

    onPeerDisconnect(callback: (peerId: string) => void) {
      const nodeInstance = back_store.friendsLibp2p[accId];
      if (nodeInstance?.node) {
        nodeInstance.node.addEventListener('peer:disconnect', (event: any) => {
          callback(event.detail.toString());
        });
      }
    },

    onMessageReceived(callback: (message: MessagePayload) => void) {
      const nodeInstance = back_store.friendsLibp2p[accId];
      if (nodeInstance?.node?.services?.pubsub) {
        nodeInstance.node.services.pubsub.addEventListener('message', (event: any) => {
          try {
            const message = JSON.parse(new TextDecoder().decode(event.detail.data));
            callback(message);
          } catch (error) {
            console.error('Failed to parse received message:', error);
          }
        });
      }
    },

    // Cleanup
    async cleanup() {
      await this.stopLibp2pNode();
      if (back_store.friendsLibp2p[accId]) {
        delete back_store.friendsLibp2p[accId];
      }
      if (back_store.friends_by_account[accId]) {
        delete back_store.friends_by_account[accId];
      }
    }
  };
};

// Export type for the service instance
export type FriendsLibp2pService = ReturnType<typeof friends_libp2p_service>;
