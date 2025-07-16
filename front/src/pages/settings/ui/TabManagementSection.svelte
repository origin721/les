<script lang="ts">
    import { Button } from "../../../components/ui";
    import { TabManagement } from "../../../core/broadcast_channel/tab_management";
    import styles from "./SettingsPage.module.css";

    // Используем $props для объявления пропсов
    let { activeTabsCount } = $props();

    function handleCloseAllOtherTabs() {
        if (confirm("Закрыть все остальные вкладки приложения? Текущая вкладка останется открытой.")) {
            TabManagement.closeAllOtherTabs();
        }
    }

    function handleCloseAllTabs() {
        if (confirm("Закрыть ВСЕ вкладки приложения включая текущую? Это действие закроет все открытые вкладки приложения.")) {
            TabManagement.closeAllTabsIncludingCurrent();
        }
    }
</script>

<div class={styles.settingSection}>
    <h2 class={styles.sectionTitle}>🗂️ Управление вкладками</h2>
    <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
            <div class={styles.settingName}>
                <span class={styles.settingIcon}>📊</span>
                Мониторинг активных вкладок
            </div>
            <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
                ● {activeTabsCount} АКТИВНЫХ
            </span>
        </div>
        <div class={styles.settingDescription}>
            Отслеживание количества активных вкладок приложения в реальном времени через SharedWorker. Счетчик автоматически обновляется при открытии/закрытии вкладок.
        </div>
    </div>
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
            Управление открытыми вкладками приложения через broadcast сообщения. Позволяет закрывать вкладки синхронно через все экземпляры приложения.
        </div>
        <div class={styles.settingActions}>
            <Button variant="outline" size="sm" onclick={handleCloseAllOtherTabs}>
                🗂️ Закрыть остальные вкладки
            </Button>
            <Button variant="danger" size="sm" onclick={handleCloseAllTabs}>
                ❌ Закрыть все вкладки
            </Button>
        </div>
        <div class={styles.settingDescription} style="margin-top: 8px; font-size: 0.9em; color: var(--color-text-secondary);">
            ⚠️ "Закрыть остальные вкладки" - закроет все вкладки кроме текущей<br />
            ⚠️ "Закрыть все вкладки" - закроет включая текущую вкладку
        </div>
    </div>
</div>
