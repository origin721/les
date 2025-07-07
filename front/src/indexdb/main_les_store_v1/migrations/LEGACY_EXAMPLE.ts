/**
 * 📦 Пример использования системы Legacy миграций
 * 
 * Этот файл демонстрирует как использовать новую систему
 * асинхронной загрузки legacy миграций в реальных сценариях.
 */

import { 
  preloadMigrations,
  runSchemaMigrations,
  runDataMigrations,
  getCombinedAvailableMigrations,
  hasCombinedMigration,
  getCurrentDbVersion
} from './migrations';
import { DB_NAMES } from '../../constants';
import { prodInfo } from '../../../core/debug/logger';

/**
 * 🎯 Пример 1: Полный цикл миграции с legacy поддержкой
 */
export async function exampleFullMigrationCycle(): Promise<void> {
  const dbName = DB_NAMES.MAIN_LES_STORE_V1;
  
  try {
    // 1. Получаем текущую версию БД
    const oldVersion = await getCurrentDbVersion(dbName);
    const newVersion = 10; // Предположим, хотим обновиться до версии 10
    
    prodInfo('🎯 Пример: Полный цикл миграции', {
      oldVersion,
      newVersion
    });
    
    // 2. Предзагружаем миграции (автоматически определит нужность legacy)
    const preloadedMigrations = await preloadMigrations(oldVersion, newVersion);
    
    // 3. В реальном коде здесь была бы работа с IndexedDB transaction
    // Но для примера просто логируем
    prodInfo('✅ Миграции предзагружены:', {
      count: preloadedMigrations.size,
      versions: Array.from(preloadedMigrations.keys())
    });
    
    // 4. Выполнение миграций было бы здесь:
    // runSchemaMigrations(db, oldVersion, newVersion, preloadedMigrations);
    // await runDataMigrations(db, oldVersion, newVersion, preloadedMigrations, dbName);
    
    prodInfo('🏁 Пример завершен успешно');
    
  } catch (error) {
    console.error('❌ Ошибка в примере полного цикла миграции:', error);
    throw error;
  }
}

/**
 * 🔍 Пример 2: Проверка доступности миграций
 */
export async function exampleCheckMigrationAvailability(): Promise<void> {
  try {
    prodInfo('🔍 Пример: Проверка доступности миграций');
    
    // Проверяем конкретные версии
    const versions = [0, 1, 5, 7, 10];
    
    for (const version of versions) {
      const available = await hasCombinedMigration(version);
      prodInfo(`Версия ${version}: ${available ? '✅ доступна' : '❌ недоступна'}`);
    }
    
    // Получаем полный список доступных миграций
    const allMigrations = await getCombinedAvailableMigrations();
    prodInfo('📋 Все доступные миграции:', allMigrations);
    
  } catch (error) {
    console.error('❌ Ошибка в примере проверки доступности:', error);
    throw error;
  }
}

/**
 * ⚡ Пример 3: Сценарии оптимизации
 */
export async function exampleOptimizationScenarios(): Promise<void> {
  try {
    prodInfo('⚡ Пример: Сценарии оптимизации');
    
    // Сценарий 1: Новый пользователь (версия 0 → 2)
    prodInfo('📦 Сценарий 1: Новый пользователь (быстрая загрузка)');
    const newUserMigrations = await preloadMigrations(0, 2);
    prodInfo(`Загружено миграций: ${newUserMigrations.size} (только актуальные)`);
    
    // Сценарий 2: Старый пользователь (версия 3 → 8)  
    // ВНИМАНИЕ: Сейчас MIN_CURRENT_VERSION = 0, поэтому legacy не загрузится
    // В реальном сценарии нужно установить MIN_CURRENT_VERSION = 7
    prodInfo('📦 Сценарий 2: Старый пользователь (с legacy)');
    const oldUserMigrations = await preloadMigrations(3, 8);
    prodInfo(`Загружено миграций: ${oldUserMigrations.size} (включая legacy)`);
    
    // Сценарий 3: Актуальный пользователь (версия 7 → 10)
    prodInfo('📦 Сценарий 3: Актуальный пользователь (только новые)');
    const currentUserMigrations = await preloadMigrations(7, 10);
    prodInfo(`Загружено миграций: ${currentUserMigrations.size} (только актуальные)`);
    
  } catch (error) {
    console.error('❌ Ошибка в примере сценариев оптимизации:', error);
    throw error;
  }
}

/**
 * 🧪 Функция для запуска всех примеров
 */
export async function runAllLegacyExamples(): Promise<void> {
  try {
    prodInfo('🧪 Запуск всех примеров системы Legacy миграций');
    
    await exampleFullMigrationCycle();
    await exampleCheckMigrationAvailability();
    await exampleOptimizationScenarios();
    
    prodInfo('🎉 Все примеры выполнены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении примеров:', error);
    throw error;
  }
}

/**
 * 📊 Демо функция для отладки (можно вызвать из консоли)
 */
export async function debugLegacySystem(): Promise<void> {
  console.log('🐛 Debug: Система Legacy миграций');
  
  try {
    // Базовая информация о системе
    const allMigrations = await getCombinedAvailableMigrations();
    console.log('📋 Доступные миграции:', allMigrations);
    
    // Проверка разных версий
    const testVersions = [0, 1, 2, 5, 7, 10, 15];
    for (const version of testVersions) {
      const exists = await hasCombinedMigration(version);
      console.log(`🔍 Версия ${version}: ${exists ? '✅' : '❌'}`);
    }
    
    // Тест предзагрузки для разных сценариев
    const scenarios = [
      { old: 0, new: 2, name: 'Новый пользователь' },
      { old: 1, new: 5, name: 'Обновление с legacy' },
      { old: 7, new: 10, name: 'Только актуальные' },
    ];
    
    for (const scenario of scenarios) {
      try {
        const migrations = await preloadMigrations(scenario.old, scenario.new);
        console.log(`🎯 ${scenario.name} (${scenario.old}→${scenario.new}): ${migrations.size} миграций`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.log(`❌ ${scenario.name}: Ошибка - ${errorMessage}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка в debug функции:', error);
  }
}

// Экспорт для использования в консоли браузера
if (typeof window !== 'undefined') {
  (window as any).debugLegacySystem = debugLegacySystem;
  (window as any).runAllLegacyExamples = runAllLegacyExamples;
}
