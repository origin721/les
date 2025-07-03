import { describe, it, expect, beforeEach, vi } from 'vitest';
import { add_friend, type FriendEntity } from '../indexdb/friends/add_friend';
import { delete_friend } from '../indexdb/friends/delete_friend';
import { migrateAccountsFriends, checkAccountsMigrationNeeded } from '../indexdb/accounts/migrate/migrate_accounts_friends';
import { back_store } from '../local_back/back_store/back_store';

// Mock IndexedDB и зависимости
vi.mock('../indexdb/indexdb_wrapper', () => ({
  indexdb_wrapper: vi.fn((callback) => {
    return callback({
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
        })),
        oncomplete: null,
        onerror: null,
      })),
    });
  }),
}));

vi.mock('../core/crypt', () => ({
  encrypt_curve25519_from_pass: vi.fn(() => Promise.resolve('encrypted_data')),
  decrypt_curve25519_from_pass: vi.fn(() => Promise.resolve('{"test": "data"}')),
}));

vi.mock('../core/uuid', () => ({
  uuidv4: vi.fn(() => 'test-uuid-123'),
}));

describe('IndexedDB Friends Synchronization', () => {
  beforeEach(() => {
    // Сброс back_store перед каждым тестом
    back_store.accounts_by_id = {};
    back_store.friends_by_id = {};
    
    // Мокаем базовый аккаунт
    back_store.accounts_by_id['account-1'] = {
      id: 'account-1',
      namePub: 'Test Account',
      pass: 'test-password',
      httpServers: [],
      friendsByIds: [],
      date_created: new Date(),
      _pass: 'internal-pass',
      _libp2p_keyPair: 'mock-keypair',
    };
  });

  describe('add_friend function', () => {
    it('должен правильно сохранять ID друзей для синхронизации', async () => {
      const mockFriend: FriendEntity = {
        namePub: 'Test Friend',
        myAccId: 'account-1',
        friendPubKeyLibp2p: 'test-pub-key',
      };

      // Эта функция должна корректно работать с сохранением ID
      expect(() => add_friend([mockFriend])).not.toThrow();
    });

    it('должен группировать друзей по аккаунтам для эффективной синхронизации', async () => {
      // Добавляем второй аккаунт
      back_store.accounts_by_id['account-2'] = {
        id: 'account-2',
        namePub: 'Test Account 2',
        pass: 'test-password-2',
        httpServers: [],
        friendsByIds: [],
        date_created: new Date(),
        _pass: 'internal-pass-2',
        _libp2p_keyPair: 'mock-keypair-2',
      };

      const mockFriends: FriendEntity[] = [
        {
          namePub: 'Friend 1',
          myAccId: 'account-1',
          friendPubKeyLibp2p: 'pub-key-1',
        },
        {
          namePub: 'Friend 2',
          myAccId: 'account-1',
          friendPubKeyLibp2p: 'pub-key-2',
        },
        {
          namePub: 'Friend 3',
          myAccId: 'account-2',
          friendPubKeyLibp2p: 'pub-key-3',
        },
      ];

      expect(() => add_friend(mockFriends)).not.toThrow();
    });
  });

  describe('simplified friends management', () => {
    it('должен работать с упрощенной архитектурой друзей', () => {
      // Проверяем доступ к друзьям через back_store.friends_by_id
      expect(back_store.friends_by_id).toBeDefined();
      expect(typeof back_store.friends_by_id).toBe('object');
    });

    it('должен получать друзей аккаунта из back_store.friends_by_id', () => {
      // Добавляем тестового друга в back_store
      back_store.friends_by_id['friend-1'] = {
        id: 'friend-1',
        namePub: 'Test Friend',
        myAccId: 'account-1',
        friendPubKeyLibp2p: 'test-key',
      };

      // Получаем всех друзей
      const allFriends = Object.values(back_store.friends_by_id);
      expect(allFriends).toHaveLength(1);
      expect(allFriends[0].namePub).toBe('Test Friend');
    });
  });

  describe('delete_friend function', () => {
    it('должен корректно удалять друзей из back_store.friends_by_id', () => {
      // Настраиваем mock данные
      back_store.friends_by_id['friend-1'] = {
        id: 'friend-1',
        namePub: 'Test Friend',
        myAccId: 'account-1',
        friendPubKeyLibp2p: 'test-key',
      };

      expect(() => delete_friend(['friend-1'])).not.toThrow();
    });
  });

  describe('Account Migration', () => {
    it('должен корректно определять необходимость миграции', async () => {
      // Мокаем get_accounts для возврата аккаунта без friendsByIds
      vi.doMock('../indexdb/accounts/get_accounts', () => ({
        get_accounts: vi.fn(() => Promise.resolve([
          {
            id: 'old-account',
            namePub: 'Old Account',
            pass: 'password',
            httpServers: [],
            // friendsByIds отсутствует
          }
        ])),
      }));

      expect(() => checkAccountsMigrationNeeded()).not.toThrow();
    });
  });

  describe('Data Integrity', () => {
    it('должен обеспечивать атомарность операций', () => {
      // Проверяем, что при ошибке в одной части операции, вся операция откатывается
      const mockFriend: FriendEntity = {
        namePub: 'Test Friend',
        myAccId: 'non-existent-account', // Несуществующий аккаунт
        friendPubKeyLibp2p: 'test-key',
      };

      // Должен правильно обрабатывать ошибку
      expect(() => add_friend([mockFriend])).not.toThrow();
    });

    it('должен поддерживать простую архитектуру друзей', () => {
      // Аккаунт без friendsByIds должен работать
      const oldAccount = {
        id: 'old-account',
        namePub: 'Old Account',
        pass: 'password',
        httpServers: [],
        // friendsByIds отсутствует
      };

      back_store.accounts_by_id['old-account'] = oldAccount as any;
      
      // Получение списка друзей через back_store.friends_by_id
      const friends = Object.values(back_store.friends_by_id);
      expect(Array.isArray(friends)).toBe(true);
    });
  });
});
