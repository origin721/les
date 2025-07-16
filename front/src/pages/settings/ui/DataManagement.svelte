<script lang="ts">
    import { Button } from "../../../components/ui";
    import {
        clearAllAppData,
        clearServiceWorkersOnly,
        clearStorageOnly,
        clearIndexedDBOnly,
    } from "../../../core/clear_app_data";
    import styles from "./SettingsPage.module.css";

    let showClearOptions = false;

    function toggleClearOptions() {
        showClearOptions = !showClearOptions;
    }

    async function handleClearAll() {
        if (confirm("Вы уверены, что хотите очистить ВСЕ данные приложения? Это действие нельзя отменить.")) {
            await clearAllAppData();
        }
    }

    async function handleClearServiceWorkers() {
        if (confirm("Очистить только Service Workers?")) {
            await clearServiceWorkersOnly();
        }
    }

    function handleClearStorage() {
        if (confirm("Очистить только локальное хранилище?")) {
            clearStorageOnly();
        }
    }

    async function handleClearIndexedDB() {
        if (confirm("Очистить только IndexedDB базы данных?")) {
            await clearIndexedDBOnly();
        }
    }
</script>

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
            <Button variant="outline" size="sm" onclick={toggleClearOptions}>
                {showClearOptions ? "Скрыть опции" : "Показать опции очистки"}
            </Button>
        </div>
        {#if showClearOptions}
            <div class={styles.clearOptions}>
                <Button variant="danger" size="sm" onclick={handleClearAll}>
                    🗑️ Очистить все данные
                </Button>
                <Button variant="outline" size="sm" onclick={handleClearServiceWorkers}>
                    🔧 Очистить Service Workers
                </Button>
                <Button variant="outline" size="sm" onclick={handleClearStorage}>
                    💾 Очистить локальное хранилище
                </Button>
                <Button variant="outline" size="sm" onclick={handleClearIndexedDB}>
                    🗄️ Очистить IndexedDB
                </Button>
            </div>
        {/if}
    </div>
</div>
