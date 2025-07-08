import { test, expect, beforeEach, afterEach, describe } from 'vitest'
import { migrationData, migrationInfo } from './2_accounts_versioning'
import { ACCOUNTS_VERSION } from '../../entities/accounts/constants'
import type { MigrationContext } from '../../../db_state_manager_v1/constants'
import { 
  createTestDatabase, 
  deleteTestDatabase 
} from './test-utils/database-helpers'
import { 
  createLegacyAccount, 
  readAndDecryptAccount, 
  verifyAccountIntegrity,
  createTestAccountData,
  type TestAccountData
} from './test-utils/account-helpers'

describe('Миграция 2_accounts_versioning', () => {
  let testDb: IDBDatabase
  let testUserId: string
  let testUserPass: string

  beforeEach(async () => {
    testUserId = 'test-user-123'
    testUserPass = 'test-password-456'
    testDb = await createTestDatabase()
  })

  afterEach(async () => {
    if (testDb) {
      testDb.close()
    }
    await deleteTestDatabase()
  })

  test('должна добавить version к legacy аккаунтам', async () => {
    // Arrange: создаем legacy аккаунт БЕЗ поля version
    const legacyAccountData = createTestAccountData({ id: testUserId })
    delete legacyAccountData.version // убираем version для legacy

    await createLegacyAccount(testDb, legacyAccountData, testUserPass)

    // Act: выполняем миграцию
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: testUserId, pass: testUserPass },
      oldVersion: 1,
      newVersion: 2
    }

    await migrationData(context)

    // Assert: проверяем что поле version добавлено
    const migratedAccount = await readAndDecryptAccount(testDb, testUserId, testUserPass)
    
    expect(migratedAccount).toBeDefined()
    expect(migratedAccount!.version).toBe(ACCOUNTS_VERSION)
    expect(migratedAccount!.version).toBe(1)
  })

  test('должна сохранить все данные аккаунта', async () => {
    // Arrange
    const originalAccountData = createTestAccountData({
      id: testUserId,
      httpServers: [
        { id: 'server-1', url: 'http://localhost:3000', isActive: true },
        { id: 'server-2', url: 'http://localhost:3001', isActive: false }
      ],
      friendsByIds: ['friend-1', 'friend-2', 'friend-3']
    })
    delete originalAccountData.version

    await createLegacyAccount(testDb, originalAccountData, testUserPass)

    // Act
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: testUserId, pass: testUserPass },
      oldVersion: 1,
      newVersion: 2
    }

    await migrationData(context)

    // Assert
    const migratedAccount = await readAndDecryptAccount(testDb, testUserId, testUserPass)
    verifyAccountIntegrity(originalAccountData, migratedAccount!, expect)
  })

  test('должна обновить date_updated', async () => {
    // Arrange
    const oldDateStr = '2024-01-01T00:00:00.000Z'
    const legacyAccountData = createTestAccountData({
      id: testUserId,
      date_created: oldDateStr as any,
      date_updated: oldDateStr as any
    })
    delete legacyAccountData.version

    await createLegacyAccount(testDb, legacyAccountData, testUserPass)

    // Act
    const beforeMigration = Date.now()
    
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: testUserId, pass: testUserPass },
      oldVersion: 1,
      newVersion: 2
    }

    await migrationData(context)
    
    const afterMigration = Date.now()

    // Assert
    const migratedAccount = await readAndDecryptAccount(testDb, testUserId, testUserPass)
    
    expect(migratedAccount).not.toBeNull()
    const updatedTime = new Date(migratedAccount!.date_updated).getTime()
    expect(updatedTime).toBeGreaterThanOrEqual(beforeMigration)
    expect(updatedTime).toBeLessThanOrEqual(afterMigration)
    expect(migratedAccount!.date_created).toEqual(oldDateStr)
  })

  test('должна пропустить аккаунты с existing version', async () => {
    // Arrange: создаем аккаунт УЖЕ с полем version
    const accountWithVersion = createTestAccountData({
      id: testUserId,
      version: 1
    })

    await createLegacyAccount(testDb, accountWithVersion, testUserPass)

    // Act
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: testUserId, pass: testUserPass },
      oldVersion: 1,
      newVersion: 2
    }

    await migrationData(context)

    // Assert: данные не должны измениться
    const unchangedAccount = await readAndDecryptAccount(testDb, testUserId, testUserPass)
    
    expect(unchangedAccount!.version).toBe(1)
    expect(unchangedAccount!.date_updated).toEqual(accountWithVersion.date_updated)
  })

  test('должна работать с несколькими аккаунтами', async () => {
    // Arrange: создаем несколько аккаунтов
    const accounts = [
      createTestAccountData({ id: 'user-1', namePub: 'User One' }),
      createTestAccountData({ id: 'user-2', namePub: 'User Two' }),
      createTestAccountData({ id: 'user-3', namePub: 'User Three', version: 1 })
    ]

    // Убираем version у первых двух
    delete accounts[0].version
    delete accounts[1].version

    // Создаем все аккаунты
    for (const account of accounts) {
      await createLegacyAccount(testDb, account, testUserPass)
    }

    // Act: мигрируем только для user-1
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: 'user-1', pass: testUserPass },
      oldVersion: 1,
      newVersion: 2
    }

    await migrationData(context)

    // Assert: проверяем результаты для всех аккаунтов
    const user1 = await readAndDecryptAccount(testDb, 'user-1', testUserPass)
    const user2 = await readAndDecryptAccount(testDb, 'user-2', testUserPass)
    const user3 = await readAndDecryptAccount(testDb, 'user-3', testUserPass)

    // user-1 должен быть мигрирован
    expect(user1!.version).toBe(ACCOUNTS_VERSION)
    expect(new Date(user1!.date_updated).getTime()).toBeGreaterThan(new Date('2024-01-01').getTime())

    // user-2 НЕ должен быть мигрирован (другой пользователь)
    expect(user2!.version).toBeUndefined()
    expect(user2!.date_updated).toEqual(accounts[1].date_updated)

    // user-3 НЕ должен быть изменен (уже имел version)
    expect(user3!.version).toBe(1)
    expect(user3!.date_updated).toEqual(accounts[2].date_updated)
  })

  test('должна корректно работать на пустой БД', async () => {
    // Arrange: пустая БД (никаких аккаунтов нет)

    // Act
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: testUserId, pass: testUserPass },
      oldVersion: 1,
      newVersion: 2
    }

    // Assert: не должно быть ошибок
    await expect(migrationData(context)).resolves.toBeUndefined()
  })

  test('должна корректно обрабатывать ошибки дешифровки', async () => {
    // Arrange: создаем аккаунт с неверным паролем
    const legacyAccountData = createTestAccountData({ id: testUserId })
    delete legacyAccountData.version

    const wrongPassword = 'wrong-password'
    await createLegacyAccount(testDb, legacyAccountData, wrongPassword)

    // Act: пытаемся мигрировать с правильным паролем
    const context: MigrationContext = {
      db: testDb,
      currentUser: { id: testUserId, pass: testUserPass }, // правильный пароль
      oldVersion: 1,
      newVersion: 2
    }

    // Assert: миграция должна завершиться без ошибок, просто пропустив аккаунт
    await expect(migrationData(context)).resolves.toBeUndefined()
  })

  test('должна проверить метаданные миграции', () => {
    expect(migrationInfo.version).toBe(2)
    expect(migrationInfo.name).toBe('accounts_versioning')
    expect(migrationInfo.description).toContain('version')
    expect(migrationInfo.fileName).toBe('2_accounts_versioning.ts')
  })
})
