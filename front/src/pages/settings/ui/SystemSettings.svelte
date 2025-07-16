<script lang="ts">
    import { Button, StatusIndicator, ThemeSelector } from "../../../components/ui";
    import { theme } from "../../../stores/theme";
    import styles from "./SettingsPage.module.css";

    // Используем $props для объявления пропсов
    let { systemStatus } = $props();

    const handleSystemDiagnostics = () => {
        alert("Диагностика системы будет реализована в следующих версиях");
    };
</script>

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
            Выберите тему интерфейса для персонализации внешнего вида приложения. Изменения применяются мгновенно.
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
            <Button variant="outline" size="sm" onclick={handleSystemDiagnostics}>
                🔍 Диагностика
            </Button>
        </div>
    </div>
</div>
