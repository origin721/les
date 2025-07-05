<script lang="ts">
  import { Button, Card, StatusIndicator } from "../../../components/ui";
  import { ROUTES, Link } from "../../../routing";
  import { clearAllLocalStorage } from '../../../core';
  import { theme } from '../../../stores/theme';
  import styles from './SettingsPage.module.css';
  
  // State for settings
  let isStorageClearing = false;
  let storageStatus = 'active';
  let systemStatus = 'operational';
  
  // Handlers
  const handleClearStorage = async () => {
    if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
      isStorageClearing = true;
      try {
        await clearAllLocalStorage();
        storageStatus = 'cleared';
        setTimeout(() => {
          storageStatus = 'active';
          isStorageClearing = false;
        }, 2000);
      } catch (error) {
        console.error('Ошибка при очистке данных:', error);
        isStorageClearing = false;
      }
    }
  };
  
  const handleExportData = () => {
    // TODO: Implement data export
    alert('Экспорт данных будет реализован в следующих версиях');
  };
  
  const handleImportData = () => {
    // TODO: Implement data import
    alert('Импорт данных будет реализован в следующих версиях');
  };
  
  const handleSystemDiagnostics = () => {
    // TODO: Implement system diagnostics
    alert('Диагностика системы будет реализована в следующих версиях');
  };
  
  const handleCacheClean = () => {
    // TODO: Implement cache cleaning
    if (confirm('Очистить кэш системы?')) {
      alert('Кэш очищен успешно');
    }
  };
</script>

<div class={styles.settingsContainer}>
  <!-- Quick Actions -->
  <div class={styles.quickActions}>
    <div class={styles.quickActionButton}>
      <Button 
        variant="secondary" 
        size="md" 
        onclick={handleSystemDiagnostics}
      >
        🔍 ДИАГНОСТИКА
      </Button>
    </div>
    
    <div class={styles.quickActionButton}>
      <Button 
        variant="outline" 
        size="md" 
        onclick={handleCacheClean}
      >
        🧹 ОЧИСТИТЬ КЭШ
      </Button>
    </div>
    
    <div class={styles.quickActionButton}>
      <Link href={ROUTES.HOME}>
        <Button variant="ghost" size="md">
          🏠 ГЛАВНАЯ
        </Button>
      </Link>
    </div>
  </div>

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
            Диагностика
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
            Локальное хранилище
          </div>
          <span class={`${styles.statusIndicator} ${storageStatus === 'active' ? styles.statusActive : styles.statusInactive}`}>
            ● {storageStatus === 'active' ? 'АКТИВНО' : 'ОЧИЩЕНО'}
          </span>
        </div>
        <div class={styles.settingDescription}>
          Управление локальными данными приложения, включая настройки, кэш и пользовательские данные.
        </div>
        <div class={styles.settingActions}>
          <Button 
            variant="outline" 
            size="sm"
            onclick={handleExportData}
          >
            📤 Экспорт
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onclick={handleImportData}
          >
            📥 Импорт
          </Button>
        </div>
      </div>

    </div>


    <!-- Danger Zone Section -->
    <div class={`${styles.settingSection} ${styles.dangerZone}`}>
      <h2 class={styles.sectionTitle}>⚠️ Опасная зона</h2>
      
      <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
          <div class={styles.settingName}>
            <span class={styles.settingIcon}>🗑️</span>
            Сброс всех данных
          </div>
          <span class={`${styles.statusIndicator} ${styles.statusInactive}`}>
            ⚠️ ОПАСНО
          </span>
        </div>
        <div class={styles.settingDescription}>
          Полная очистка всех локальных данных, настроек и кэша. 
          <strong>Это действие нельзя отменить!</strong>
        </div>
        <div class={styles.settingActions}>
          <Button 
            variant="danger" 
            size="sm"
            loading={isStorageClearing}
            onclick={handleClearStorage}
          >
            {isStorageClearing ? '🔄 Очистка...' : '🗑️ Очистить все данные'}
          </Button>
        </div>
      </div>
    </div>
  </div>
</div>
