/**
 * Clear all IndexedDB databases using the modern databases() API when available,
 * fallback to clearing known database names for older browsers
 */
async function clearAllIndexedDBDatabases(): Promise<void> {
  try {
    // Try modern databases() API first (supported in newer browsers)
    if ('databases' in indexedDB) {
      const databases = await (indexedDB as any).databases();
      console.log(`Found ${databases.length} IndexedDB database(s) to delete`);
      
      for (const db of databases) {
        if (db.name) {
          try {
            // Close any open connections to the database
            const deleteRequest = (indexedDB as any).deleteDatabase(db.name);
            await new Promise<void>((resolve, reject) => {
              deleteRequest.onsuccess = () => {
                console.log(`✓ IndexedDB database deleted: ${db.name}`);
                resolve();
              };
              deleteRequest.onerror = (event: any) => {
                console.error(`Error deleting IndexedDB database: ${db.name}`, event);
                reject(new Error(`Failed to delete database: ${db.name}`));
              };
              deleteRequest.onblocked = () => {
                console.warn(`IndexedDB database deletion blocked: ${db.name}`);
                // Still resolve as the deletion will happen when connections close
                resolve();
              };
            });
          } catch (error) {
            console.error(`Error deleting IndexedDB database: ${db.name}`, error);
          }
        }
      }
    } else {
      // Fallback for older browsers - delete known database names
      console.log('Modern databases() API not available, using fallback method');
      const knownDatabaseNames = [
        'store_v3', // From indexdb_wrapper.ts
        'store_v2',
        'store_v1',
        'store',
        // Add any other known database names from your app
      ];
      
      for (const dbName of knownDatabaseNames) {
        try {
          const deleteRequest = (indexedDB as any).deleteDatabase(dbName);
          await new Promise<void>((resolve, reject) => {
            deleteRequest.onsuccess = () => {
              console.log(`✓ IndexedDB database deleted: ${dbName}`);
              resolve();
            };
            deleteRequest.onerror = () => {
              // Don't reject for databases that don't exist
              console.log(`IndexedDB database not found or already deleted: ${dbName}`);
              resolve();
            };
            deleteRequest.onblocked = () => {
              console.warn(`IndexedDB database deletion blocked: ${dbName}`);
              resolve();
            };
          });
        } catch (error) {
          console.error(`Error deleting IndexedDB database: ${dbName}`, error);
        }
      }
    }
    
    console.log('✓ IndexedDB databases cleared');
  } catch (error) {
    console.error('Error clearing IndexedDB databases:', error);
    throw error;
  }
}

/**
 * Utility function to clear all app data including Service Workers and localStorage
 * Based on patterns from https://s.scripton.app
 */

export async function clearAllAppData(): Promise<void> {
  try {
    // Clear localStorage
    localStorage.clear();
    console.log('✓ localStorage cleared');

    // Clear sessionStorage as well
    sessionStorage.clear();
    console.log('✓ sessionStorage cleared');

    // Clear Service Workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`Found ${registrations.length} service worker(s) to unregister`);
        
        for (const registration of registrations) {
          try {
            await registration.unregister();
            console.log('✓ Service worker unregistered:', registration.scope);
          } catch (error) {
            console.error('Error unregistering service worker:', error);
          }
        }
      } else {
        console.log('No service workers found');
      }
    } else {
      console.log('Service Workers not supported in this browser');
    }

    // Clear all IndexedDB databases
    if ('indexedDB' in window) {
      try {
        await clearAllIndexedDBDatabases();
      } catch (error) {
        console.error('Error clearing IndexedDB:', error);
      }
    }

    // Clear all caches
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        if (cacheNames.length > 0) {
          console.log(`Found ${cacheNames.length} cache(s) to delete`);
          
          for (const cacheName of cacheNames) {
            await caches.delete(cacheName);
            console.log('✓ Cache deleted:', cacheName);
          }
        } else {
          console.log('No caches found');
        }
      } catch (error) {
        console.error('Error clearing caches:', error);
      }
    }

    console.log('🧹 App data clearing completed');
    
    // Show success message to user
    alert('Все данные приложения очищены! Страница будет перезагружена.');
    
    // Reload the page to ensure clean state
    window.location.reload();
    
  } catch (error) {
    console.error('Error during app data clearing:', error);
    alert('Ошибка при очистке данных: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Clear only Service Workers without affecting other data
 */
export async function clearServiceWorkersOnly(): Promise<void> {
  try {
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      if (registrations.length > 0) {
        console.log(`Found ${registrations.length} service worker(s) to unregister`);
        
        for (const registration of registrations) {
          try {
            await registration.unregister();
            console.log('✓ Service worker unregistered:', registration.scope);
          } catch (error) {
            console.error('Error unregistering service worker:', error);
          }
        }
        
        alert('Service Workers очищены! Страница будет перезагружена.');
        window.location.reload();
      } else {
        alert('Service Workers не найдены');
      }
    } else {
      alert('Service Workers не поддерживаются в этом браузере');
    }
  } catch (error) {
    console.error('Error clearing service workers:', error);
    alert('Ошибка при очистке Service Workers: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Clear only localStorage and sessionStorage
 */
export function clearStorageOnly(): void {
  try {
    localStorage.clear();
    sessionStorage.clear();
    console.log('✓ Storage cleared');
    alert('Локальное хранилище очищено!');
  } catch (error) {
    console.error('Error clearing storage:', error);
    alert('Ошибка при очистке хранилища: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Clear only IndexedDB databases without affecting other data
 */
export async function clearIndexedDBOnly(): Promise<void> {
  try {
    if ('indexedDB' in window) {
      await clearAllIndexedDBDatabases();
      alert('IndexedDB базы данных очищены!');
    } else {
      alert('IndexedDB не поддерживается в этом браузере');
    }
  } catch (error) {
    console.error('Error clearing IndexedDB:', error);
    alert('Ошибка при очистке IndexedDB: ' + (error instanceof Error ? error.message : String(error)));
  }
}
