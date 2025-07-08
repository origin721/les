/**
 * Вспомогательные функции для работы с аккаунтами в тестах
 */

import { encrypt_curve25519_from_pass, decrypt_curve25519_from_pass } from '../../../../../core/crypt'
import { putRecordToStore, getRecordFromStore } from './database-helpers'

export interface TestAccountData {
  id: string
  namePub: string
  pass?: string
  httpServers?: Array<{ id: string; url: string; isActive: boolean }>
  friendsByIds?: string[]
  date_created: Date
  date_updated: Date
  _pass: string
  _libp2p_keyPair?: string
  version?: number
}

export async function createLegacyAccount(
  db: IDBDatabase,
  userData: TestAccountData, 
  userPass: string
): Promise<void> {
  const encryptedData = await encrypt_curve25519_from_pass({
    pass: userPass,
    message: JSON.stringify(userData)
  })

  const record = { id: userData.id, data: encryptedData }
  await putRecordToStore(db, 'accounts', record)
}

export async function readAndDecryptAccount(
  db: IDBDatabase, 
  accountId: string, 
  userPass: string
): Promise<TestAccountData | null> {
  const record = await getRecordFromStore(db, 'accounts', accountId)
  
  if (!record) {
    return null
  }

  const decryptedData = await decrypt_curve25519_from_pass({
    pass: userPass,
    cipherText: record.data
  })

  if (!decryptedData) {
    return null
  }

  return JSON.parse(decryptedData)
}

export function verifyAccountIntegrity(
  before: TestAccountData, 
  after: TestAccountData,
  expect: any
): void {
  // Проверяем что все поля кроме version и date_updated одинаковые
  expect(after.id).toBe(before.id)
  expect(after.namePub).toBe(before.namePub)
  expect(after.pass).toBe(before.pass)
  expect(after.httpServers).toEqual(before.httpServers)
  expect(after.friendsByIds).toEqual(before.friendsByIds)
  expect(after.date_created).toEqual(before.date_created)
  expect(after._pass).toBe(before._pass)
  expect(after._libp2p_keyPair).toBe(before._libp2p_keyPair)
  
  // version должна быть добавлена
  expect(after.version).toBeDefined()
  
  // date_updated должна быть обновлена
  expect(new Date(after.date_updated).getTime()).toBeGreaterThan(
    new Date(before.date_updated).getTime()
  )
}

export function createTestAccountData(overrides: Partial<TestAccountData> = {}): TestAccountData {
  return {
    id: 'test-user-123',
    namePub: 'Test User',
    pass: 'user-password-123',
    httpServers: [
      { id: 'server-1', url: 'http://localhost:3000', isActive: true }
    ],
    friendsByIds: ['friend-1', 'friend-2'],
    date_created: '2024-01-01T00:00:00.000Z' as any,
    date_updated: '2024-01-01T00:00:00.000Z' as any,
    _pass: 'internal-pass-456',
    _libp2p_keyPair: 'mock-keypair-data',
    ...overrides
  }
}
