<script lang="ts">
  import { Button, StatusIndicator, ThemeSelector } from "../../../components/ui";
  import { ROUTES, Link } from "../../../routing";
  import { clearAllAppData, clearServiceWorkersOnly, clearStorageOnly, clearIndexedDBOnly } from '../../../core/clear_app_data';
  import { theme } from '../../../stores/theme';
  import { VersionManager } from '../../../indexdb/main_les_store_v1/version_manager';
  import { AllUsersChecker } from '../../../indexdb/main_les_store_v1/all_users_checker';
  import { ConnectionManager } from '../../../indexdb/main_les_store_v1/connection_manager';
  import { appAuthStore } from '../../../stores/app_auth_store/app_auth_store';
  import { TabManagement } from '../../../core/broadcast_channel/tab_management';
  import styles from './SettingsPage.module.css';
  
  // State for settings
  let systemStatus = 'operational';
  let showClearOptions = false;
  
  // State for version management
  let showVersionInfo = false;
  let versionCheckInProgress = false;
  let versionCheckResults: {
    userStats: any;
    versionStats: any;
    allUserIds: string[];
  } | null = null;
  let versionCheckError: string | null = null;
  let isNotAuthorized = false;
  
  // Clear data handlers from AuthPage
  function toggleClearOptions() {
    showClearOptions = !showClearOptions;
  }

  async function handleClearAll() {
    if (confirm('Вы уверены, что хотите очистить ВСЕ данные приложения? Это действие нельзя отменить.')) {
      await clearAllAppData();
    }
  }

  async function handleClearServiceWorkers() {
    if (confirm('Очистить только Service Workers?')) {
      await clearServiceWorkersOnly();
    }
  }

  function handleClearStorage() {
    if (confirm('Очистить только локальное хранилище?')) {
      clearStorageOnly();
    }
  }

  async function handleClearIndexedDB() {
    if (confirm('Очистить только IndexedDB базы данных?')) {
      await clearIndexedDBOnly();
    }
  }
  
  const handleSystemDiagnostics = () => {
    // TODO: Implement system diagnostics
    alert('Диагностика системы будет реализована в следующих версиях');
  };

  // Tab management handlers
  function handleCloseAllOtherTabs() {
    if (confirm('Закрыть все остальные вкладки приложения? Текущая вкладка останется открытой.')) {
      TabManagement.closeAllOtherTabs();
    }
  }

  function handleCloseAllTabs() {
    if (confirm('Закрыть ВСЕ вкладки приложения включая текущую? Это действие закроет все открытые вкладки приложения.')) {
      TabManagement.closeAllTabsIncludingCurrent();
    }
  }

  async function handleVersionCheck() {
    versionCheckInProgress = true;
    versionCheckError = null;
    versionCheckResults = null;
    isNotAuthorized = false;
    
    try {
      // Проверяем авторизацию
      const authStore = $appAuthStore;
      const authIds = Object.keys(authStore.byId);
      
      if (authIds.length === 0) {
        isNotAuthorized = true;
        showVersionInfo = true;
        return;
      }
      
      // Получить соединение с БД
      const db = await ConnectionManager.getConnection();
      
      // Получить статистику пользователей
      const userStats = await AllUsersChecker.getUserReadinessStats(db, 2); // версия 2
      
      // Получить общую статистику версий
      const versionStats = await VersionManager.getVersionStats(db);
      
      // Получить список всех пользователей с ID
      const allUserIds = await AllUsersChecker.scanAllUserIds(db);
      
      versionCheckResults = {
        userStats,
        versionStats,
        allUserIds: Array.from(allUserIds)
      };
      
      showVersionInfo = true;
      
    } catch (error) {
      versionCheckError = error instanceof Error ? error.message : String(error);
    } finally {
      versionCheckInProgress = false;
    }
  }
</script>

<div class={styles.settingsContainer}>
  <div class={styles.settingsGrid}>
    <!-- System Settings Section -->
    <div class={styles.settingSection}>
      <h2 class={styles.sectionTitle}>🔧 Системные настройки</h2>
      
      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>🎨</span>
            Темы интерфейса
          </div>
          <StatusIndicator 
            status="active" 
            text={$theme.toUpperCase()}
            className={`${styles.statusIndicator} ${styles.statusActive}`}
          />
        </div>
        <div class={styles.settingDescription}>
          Выберите тему интерфейса для персонализации внешнего вида приложения. 
          Изменения применяются мгновенно.
        </div>
        <div class={styles.themeSelector}>
          <ThemeSelector />
        </div>
      </div>

      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>⚡</span>
            Статус системы
          </div>
          <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
            ● {systemStatus.toUpperCase()}
          </span>
        </div>
        <div class={styles.settingDescription}>
          Система работает в штатном режиме. Все модули функционируют корректно.
        </div>
        <div class={styles.settingActions}>
          <Button 
            variant="outline" 
            size="sm"
            onclick={handleSystemDiagnostics}
          >
            🔍 Диагностика
          </Button>
        </div>
      </div>
    </div>

    <!-- Data Management Section -->
    <div class={styles.settingSection}>
      <h2 class={styles.sectionTitle}>💾 Управление данными</h2>
      
      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>💽</span>
            Очистка данных
          </div>
          <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
            ● ДОСТУПНО
          </span>
        </div>
        <div class={styles.settingDescription}>
          Управление локальными данными приложения, включая настройки, кэш и пользовательские данные.
        </div>
        <div class={styles.settingActions}>
          <Button 
            variant="outline" 
            size="sm"
            onclick={toggleClearOptions}
          >
            {showClearOptions ? 'Скрыть опции' : 'Показать опции очистки'}
          </Button>
        </div>
        
        {#if showClearOptions}
          <div class={styles.clearOptions}>
            <Button 
              variant="danger" 
              size="sm"
              onclick={handleClearAll}
            >
              🗑️ Очистить все данные
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onclick={handleClearServiceWorkers}
            >
              🔧 Очистить Service Workers
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onclick={handleClearStorage}
            >
              💾 Очистить локальное хранилище
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onclick={handleClearIndexedDB}
            >
              🗄️ Очистить IndexedDB
            </Button>
          </div>
        {/if}
      </div>
    </div>

    <!-- Tab Management Section -->
    <div class={styles.settingSection}>
      <h2 class={styles.sectionTitle}>🗂️ Управление вкладками</h2>
      
      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>🚪</span>
            Закрытие вкладок
          </div>
          <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
            ● ДОСТУПНО
          </span>
        </div>
        <div class={styles.settingDescription}>
          Управление открытыми вкладками приложения через broadcast сообщения. 
          Позволяет закрывать вкладки синхронно через все экземпляры приложения.
        </div>
        <div class={styles.settingActions}>
          <Button 
            variant="outline" 
            size="sm"
            onclick={handleCloseAllOtherTabs}
          >
            🗂️ Закрыть остальные вкладки
          </Button>
          <Button 
            variant="danger" 
            size="sm"
            onclick={handleCloseAllTabs}
          >
            ❌ Закрыть все вкладки
          </Button>
        </div>
        <div class={styles.settingDescription} style="margin-top: 8px; font-size: 0.9em; color: var(--color-text-secondary);">
          ⚠️ "Закрыть остальные вкладки" - закроет все вкладки кроме текущей<br/>
          ⚠️ "Закрыть все вкладки" - закроет включая текущую вкладку
        </div>
      </div>
    </div>

    <!-- Version Management Section -->
    <div class={styles.settingSection}>
      <h2 class={styles.sectionTitle}>🔍 Диагностика версий</h2>
      
      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>📊</span>
            Проверка версий сущностей
          </div>
          <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
            ● ДОСТУПНО
          </span>
        </div>
        <div class={styles.settingDescription}>
          Проверка версий всех пользователей и сущностей в базе данных.
          Показывает ID пользователей и их текущие версии.
        </div>
        <div class={styles.settingActions}>
          <Button 
            variant="outline" 
            size="sm"
            onclick={handleVersionCheck}
            disabled={versionCheckInProgress}
          >
            {versionCheckInProgress ? '⏳ Проверка...' : '🔍 Проверить версии'}
          </Button>
        </div>
        
        <!-- Ошибка -->
        {#if versionCheckError}
          <div class={styles.errorMessage}>
            ❌ Ошибка: {versionCheckError}
          </div>
        {/if}
        
        <!-- Требование авторизации -->
        {#if showVersionInfo && isNotAuthorized}
          <div class={styles.authRequired}>
            <div class={styles.authMessage}>
              🔐 Для просмотра версий необходимо авторизоваться
            </div>
            <div class={styles.authDescription}>
              Данные версий зашифрованы и требуют авторизации для доступа.
            </div>
            <div class={styles.authActions}>
              <Link href={ROUTES.AUTH}>
                <Button variant="primary" size="sm">
                  Перейти к авторизации
                </Button>
              </Link>
            </div>
          </div>
        {/if}
        
        <!-- Результаты проверки -->
        {#if showVersionInfo && versionCheckResults && !isNotAuthorized}
          <div class={styles.versionResults}>
            <h4>👥 Пользователи в системе:</h4>
            <div class={styles.userList}>
              {#if versionCheckResults.allUserIds.length === 0}
                <div class={styles.emptyMessage}>
                  База данных пуста
                </div>
              {:else}
                {#each versionCheckResults.allUserIds as userId}
                  <div class={styles.userItem}>
                    User ID: {userId} | Version: {versionCheckResults.userStats.completedUsers > 0 ? '2' : '1'}
                  </div>
                {/each}
              {/if}
            </div>
            
            <h4>📈 Статистика:</h4>
            <div class={styles.statsGrid}>
              <div>Всего пользователей: {versionCheckResults.userStats.totalUsers}</div>
              <div>Завершили миграцию: {versionCheckResults.userStats.completedUsers}</div>
              <div>Готовность: {versionCheckResults.userStats.completionPercentage}%</div>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Navigation Section -->
    <div class={styles.settingSection}>
      <h2 class={styles.sectionTitle}>🧭 Навигация</h2>
      
      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>🏠</span>
            Главная страница
          </div>
        </div>
        <div class={styles.settingDescription}>
          Вернуться на главную страницу приложения.
        </div>
        <div class={styles.settingActions}>
          <Link href={ROUTES.HOME}>
            <Button variant="outline" size="sm">
              Перейти на главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  </div>
</div>
