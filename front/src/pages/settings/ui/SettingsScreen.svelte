<script lang="ts">
  import { Button, StatusIndicator } from "../../../components/ui";
  import { ROUTES, Link } from "../../../routing";
  import { clearAllAppData, clearServiceWorkersOnly, clearStorageOnly, clearIndexedDBOnly } from '../../../core/clear_app_data';
  import { theme } from '../../../stores/theme';
  import styles from './SettingsPage.module.css';
  
  // State for settings
  let systemStatus = 'operational';
  let showClearOptions = false;
  
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
            Текущая тема
          </div>
          <StatusIndicator 
            status="active" 
            text={$theme.toUpperCase()}
            className={`${styles.statusIndicator} ${styles.statusActive}`}
          />
        </div>
        <div class={styles.settingDescription}>
          Активная тема интерфейса: {$theme.toUpperCase()}. 
          Используйте переключатель тем в правом верхнем углу для изменения.
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
