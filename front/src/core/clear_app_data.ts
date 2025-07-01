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

    // Clear IndexedDB (optional - you may want to keep some data)
    if ('indexedDB' in window) {
      try {
        // Get all databases (this might not work in all browsers)
        // For now, we'll just log that we could clear IndexedDB
        console.log('IndexedDB clearing would require specific database names');
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
