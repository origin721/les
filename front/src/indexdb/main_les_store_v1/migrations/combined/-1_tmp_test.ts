import { prodInfo, prodError, devMigration, devDB } from '../../../../core/debug/logger';

/**
 * Информация о миграции
 */
export const migrationInfo = {
  version: 2,
  name: 'tmp_test',
  description: 'Тестовая миграция: создание таблицы tmp_test и примеры работы',
  fileName: '-1_tmp_test.ts'
};

/**
 * Миграция схемы: Создание тестовой таблицы tmp_test
 */
export function migrationScheme(db: IDBDatabase): void {
  prodInfo('📦 Выполняем миграцию схемы tmp_test: Создание тестовой таблицы');
  
  // Создание хранилища tmp_test
  if (!db.objectStoreNames.contains('tmp_test')) {
    const store = db.createObjectStore('tmp_test', { keyPath: 'id', autoIncrement: true });
    
    // Добавляем индексы для примеров работы
    store.createIndex('message', 'message', { unique: false });
    store.createIndex('timestamp', 'timestamp', { unique: false });
    store.createIndex('type', 'type', { unique: false });
    
    devDB('✅ Хранилище tmp_test создано с индексами: message, timestamp, type');
    prodInfo('✅ Таблица tmp_test создана успешно');
  } else {
    // Если таблица уже существует, добавляем недостающие индексы
    prodInfo('📋 Таблица tmp_test уже существует, проверяем индексы');
  }
  
  prodInfo('✅ Миграция схемы tmp_test завершена успешно');
}

/**
 * Миграция данных: добавление тестовых записей в таблицу tmp_test
 * Демонстрирует различные операции с IndexedDB
 */
export async function migrationData(db: IDBDatabase): Promise<void> {
  prodInfo('🔄 Начинаем миграцию данных tmp_test: добавление тестовых записей');
  
  return new Promise<void>((resolve, reject) => {
    try {
      const transaction = db.transaction(["tmp_test"], "readwrite");
      const store = transaction.objectStore("tmp_test");
      
      // Сначала проверяем, есть ли уже данные
      const countRequest = store.count();
      
      countRequest.onsuccess = function() {
        const existingCount = countRequest.result;
        
        if (existingCount > 0) {
          prodInfo(`📋 В таблице tmp_test уже есть ${existingCount} записей, пропускаем добавление`);
          resolve();
          return;
        }
        
        // Создаем тестовые данные
        const testData = [
          {
            message: 'hi',
            type: 'greeting',
            timestamp: new Date('2025-01-01T10:00:00'),
            metadata: { source: 'migration', version: 1 }
          },
          {
            message: 'hi',
            type: 'greeting',
            timestamp: new Date('2025-01-01T11:00:00'),
            metadata: { source: 'migration', version: 1, additional: 'second record' }
          },
          {
            message: 'hi',
            type: 'greeting',
            timestamp: new Date('2025-01-01T12:00:00'),
            metadata: { source: 'migration', version: 1, additional: 'third record', special: true }
          },
          // Дополнительные примеры для демонстрации возможностей
          {
            message: 'hello world',
            type: 'example',
            timestamp: new Date(),
            metadata: { source: 'migration', description: 'Пример другого типа записи' }
          },
          {
            message: 'test record',
            type: 'test',
            timestamp: new Date(),
            metadata: { source: 'migration', description: 'Тестовая запись для демонстрации поиска' }
          }
        ];
        
        let addedCount = 0;
        let hasError = false;
        
        // Добавляем записи по одной
        testData.forEach((data, index) => {
          const addRequest = store.add(data);
          
          addRequest.onsuccess = function() {
            addedCount++;
            devDB(`✅ Добавлена запись ${index + 1}: "${data.message}" (ID: ${addRequest.result})`);
            
            // Если все записи добавлены, выполняем демонстрационные операции
            if (addedCount === testData.length && !hasError) {
              performDemoOperations(store, resolve, reject);
            }
          };
          
          addRequest.onerror = function() {
            if (!hasError) {
              hasError = true;
              prodError(`❌ Ошибка при добавлении записи ${index + 1}:`, addRequest.error);
              reject(addRequest.error);
            }
          };
        });
      };
      
      countRequest.onerror = function() {
        prodError("❌ Ошибка при проверке количества записей:", countRequest.error);
        reject(countRequest.error);
      };

    } catch (error) {
      prodError('❌ Критическая ошибка в migrationData:', error);
      reject(error);
    }
  });
}

/**
 * Демонстрационные операции с данными
 * Показывает примеры того, что можно делать с IndexedDB
 */
function performDemoOperations(store: IDBObjectStore, resolve: () => void, reject: (error: any) => void): void {
  prodInfo('🎯 Выполняем демонстрационные операции с данными');
  
  // Пример 1: Получение всех записей
  const getAllRequest = store.getAll();
  getAllRequest.onsuccess = function() {
    const allRecords = getAllRequest.result;
    prodInfo(`📊 Общее количество записей: ${allRecords.length}`);
    
    // Пример 2: Поиск по индексу message
    const messageIndex = store.index('message');
    const hiRecordsRequest = messageIndex.getAll('hi');
    
    hiRecordsRequest.onsuccess = function() {
      const hiRecords = hiRecordsRequest.result;
      prodInfo(`🔍 Найдено записей с сообщением "hi": ${hiRecords.length}`);
      
      // Пример 3: Поиск по диапазону времени
      const timestampIndex = store.index('timestamp');
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      
      const rangeRequest = timestampIndex.getAll(IDBKeyRange.lowerBound(yesterday));
      
      rangeRequest.onsuccess = function() {
        const recentRecords = rangeRequest.result;
        prodInfo(`📅 Найдено записей за последние 24 часа: ${recentRecords.length}`);
        
        // Пример 4: Подсчет записей по типу
        const typeIndex = store.index('type');
        const greetingCountRequest = typeIndex.count('greeting');
        
        greetingCountRequest.onsuccess = function() {
          const greetingCount = greetingCountRequest.result;
          prodInfo(`👋 Количество приветствий: ${greetingCount}`);
          
          // Демонстрируем примеры использования
          demonstrateUsageExamples(allRecords);
          
          prodInfo('✅ Миграция данных tmp_test завершена успешно');
          resolve();
        };
        
        greetingCountRequest.onerror = function() {
          prodError("❌ Ошибка при подсчете приветствий:", greetingCountRequest.error);
          reject(greetingCountRequest.error);
        };
      };
      
      rangeRequest.onerror = function() {
        prodError("❌ Ошибка при поиске по диапазону времени:", rangeRequest.error);
        reject(rangeRequest.error);
      };
    };
    
    hiRecordsRequest.onerror = function() {
      prodError("❌ Ошибка при поиске записей 'hi':", hiRecordsRequest.error);
      reject(hiRecordsRequest.error);
    };
  };
  
  getAllRequest.onerror = function() {
    prodError("❌ Ошибка при получении всех записей:", getAllRequest.error);
    reject(getAllRequest.error);
  };
}

/**
 * Демонстрация примеров использования данных
 */
function demonstrateUsageExamples(records: any[]): void {
  prodInfo('📚 Примеры того, что можно делать с данными:');
  
  // Группировка по типу
  const groupedByType = records.reduce((acc, record) => {
    acc[record.type] = (acc[record.type] || 0) + 1;
    return acc;
  }, {});
  
  devDB('🏷️  Группировка по типам:', groupedByType);
  
  // Сортировка по времени
  const sortedByTime = [...records].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  devDB('⏰ Первая запись по времени:', {
    message: sortedByTime[0]?.message,
    timestamp: sortedByTime[0]?.timestamp
  });
  
  // Фильтрация с метаданными
  const recordsWithSpecial = records.filter(record => 
    record.metadata?.special === true
  );
  
  devDB('⭐ Записи с особыми метаданными:', recordsWithSpecial.length);
  
  // Поиск по подстроке
  const searchResults = records.filter(record => 
    record.message.toLowerCase().includes('h')
  );
  
  devDB('🔎 Записи содержащие букву "h":', searchResults.length);
  
  prodInfo('✨ Демонстрация завершена! Данные готовы для использования.');
}
