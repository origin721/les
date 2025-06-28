import { writable } from 'svelte/store';
import { apiKeysStorage } from '../core/local-storage';

export interface KeyPair {
  id: string;
  publicKey: string;
  privateKey: string;
  name: string;
  createdAt: Date;
}

export interface PartnerKey {
  id: string;
  publicKey: string;
  name: string;
  description?: string;
  createdAt: Date;
}

interface ApiKeysState {
  myKeys: KeyPair[];
  partnerKeys: PartnerKey[];
}

// Загружаем данные из localStorage при инициализации
const loadInitialState = (): ApiKeysState => {
  if (typeof window === 'undefined') {
    // SSR защита
    return { myKeys: [], partnerKeys: [] };
  }
  
  return {
    myKeys: apiKeysStorage.loadMyKeys(),
    partnerKeys: apiKeysStorage.loadPartnerKeys()
  };
};

function createApiKeysStore() {
  const { subscribe, set, update } = writable<ApiKeysState>(loadInitialState());

  // Автосохранение при изменениях
  const saveToStorage = (state: ApiKeysState) => {
    if (typeof window !== 'undefined') {
      apiKeysStorage.saveMyKeys(state.myKeys);
      apiKeysStorage.savePartnerKeys(state.partnerKeys);
    }
  };

  // Подписываемся на изменения для автосохранения
  subscribe(saveToStorage);

  return {
    subscribe,
    
    // Методы для работы с моими ключами
    addMyKey: (keyPair: Omit<KeyPair, 'id'>) => {
      const newKey: KeyPair = {
        ...keyPair,
        id: crypto.randomUUID()
      };
      
      update(state => ({
        ...state,
        myKeys: [...state.myKeys, newKey]
      }));
      
      return newKey;
    },

    removeMyKey: (id: string) => {
      update(state => ({
        ...state,
        myKeys: state.myKeys.filter(key => key.id !== id)
      }));
    },

    getMyKeyById: (id: string) => {
      let result: KeyPair | undefined;
      subscribe(state => {
        result = state.myKeys.find(key => key.id === id);
      })();
      return result;
    },

    // Методы для работы с ключами собеседников
    addPartnerKey: (partnerKey: Omit<PartnerKey, 'id'>) => {
      const newKey: PartnerKey = {
        ...partnerKey,
        id: crypto.randomUUID()
      };
      
      update(state => ({
        ...state,
        partnerKeys: [...state.partnerKeys, newKey]
      }));
      
      return newKey;
    },

    removePartnerKey: (id: string) => {
      update(state => ({
        ...state,
        partnerKeys: state.partnerKeys.filter(key => key.id !== id)
      }));
    },

    getPartnerKeyById: (id: string) => {
      let result: PartnerKey | undefined;
      subscribe(state => {
        result = state.partnerKeys.find(key => key.id === id);
      })();
      return result;
    },

    // Проверка дублирования ключей
    hasPartnerKey: (publicKey: string) => {
      let result = false;
      subscribe(state => {
        result = state.partnerKeys.some(key => key.publicKey === publicKey);
      })();
      return result;
    },

    // Очистка всех данных
    clearAll: () => {
      const emptyState = { myKeys: [], partnerKeys: [] };
      set(emptyState);
      if (typeof window !== 'undefined') {
        apiKeysStorage.clearAllKeys();
      }
    },

    // Получение статистики
    getStats: () => {
      let stats = { myKeysCount: 0, partnerKeysCount: 0 };
      subscribe(state => {
        stats = {
          myKeysCount: state.myKeys.length,
          partnerKeysCount: state.partnerKeys.length
        };
      })();
      return stats;
    }
  };
}

export const apiKeysStore = createApiKeysStore();
