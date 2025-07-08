import { test, expect, beforeEach, afterEach, describe } from 'vitest'
import { migrationData, migrationInfo } from './2_accounts_versioning'
import { ACCOUNTS_VERSION } from '../../entities/accounts/constants'
import type { MigrationContext } from '../../../db_state_manager_v1/constants'

describe('Миграция 2_accounts_versioning (упрощенная)', () => {
  let testDb: IDBDatabase

  beforeEach(async () => {
    // Создаем тестовую базу данных
    testDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('simple-test-db', 1)
      
      request.onupgradeneeded = function() {
        const db = request.result
        if (!db.objectStoreNames.contains('accounts')) {
          db.createObjectStore('accounts', { keyPath: 'id' })
        }
      }
      
      request.onsuccess = function() {
        resolve(request.result)
      }
      
      request.onerror = function() {
        reject(request.error)
      }
    })
  })

  afterEach(async () => {
    if (testDb) {
      testDb.close()
    }
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase('simple-test-db')
      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    })
  })

  test('должна запускаться без ошибок на пустой БД', async () => {
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: 'test-user', pass: 'test-pass' },
      oldVersion: 1,
      newVersion: 2
    }

    // Должно выполниться без ошибок
    await expect(migrationData(context)).resolves.toBeUndefined()
  })

  test('должна проверить метаданные миграции', () => {
    expect(migrationInfo.version).toBe(2)
    expect(migrationInfo.name).toBe('accounts_versioning')
    expect(migrationInfo.description).toContain('version')
    expect(migrationInfo.fileName).toBe('2_accounts_versioning.ts')
  })

  test('должна работать с пустой базой данных', async () => {
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: 'test-user', pass: 'test-pass' },
      oldVersion: 1,
      newVersion: 2
    }

    // Не должно быть исключений
    await migrationData(context)
    
    // Проверяем что база данных все еще доступна
    expect(testDb.objectStoreNames.contains('accounts')).toBe(true)
  })

  test('должна создать объект store для тестирования работы с БД', async () => {
    // Создаем простую тестовую запись (без шифрования)
    const transaction = testDb.transaction(['accounts'], 'readwrite')
    const store = transaction.objectStore('accounts')
    
    const testRecord = { 
      id: 'test-user', 
      data: 'test-encrypted-data' 
    }
    
    await new Promise<void>((resolve, reject) => {
      const request = store.put(testRecord)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })

    // Проверяем что запись создалась
    const getResult = await new Promise<any>((resolve, reject) => {
      const getTransaction = testDb.transaction(['accounts'], 'readonly')
      const getStore = getTransaction.objectStore('accounts')
      const getRequest = getStore.get('test-user')
      getRequest.onsuccess = () => resolve(getRequest.result)
      getRequest.onerror = () => reject(getRequest.error)
    })

    expect(getResult).toBeDefined()
    expect(getResult.id).toBe('test-user')
    expect(getResult.data).toBe('test-encrypted-data')
  })
})
