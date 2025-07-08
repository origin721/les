/**
 * Вспомогательные функции для работы с IndexedDB в тестах
 */

export async function createTestDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('test-accounts-migration', 1)
    
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
}

export async function deleteTestDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase('test-accounts-migration')
    deleteRequest.onsuccess = () => resolve()
    deleteRequest.onerror = () => reject(deleteRequest.error)
  })
}

export async function putRecordToStore(
  db: IDBDatabase, 
  storeName: string, 
  record: any
): Promise<void> {
  const transaction = db.transaction([storeName], 'readwrite')
  const store = transaction.objectStore(storeName)
  
  return new Promise((resolve, reject) => {
    const request = store.put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getRecordFromStore(
  db: IDBDatabase, 
  storeName: string, 
  key: string
): Promise<any> {
  const transaction = db.transaction([storeName], 'readonly')
  const store = transaction.objectStore(storeName)
  
  return new Promise((resolve, reject) => {
    const request = store.get(key)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
