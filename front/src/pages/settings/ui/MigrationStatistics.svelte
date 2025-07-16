<script lang="ts">
    import { Button } from "../../../components/ui";
    import { getMigrationStats } from "../../../indexdb/db_state_manager_v1/db_state_manager";
    import { DB_NAMES } from "../../../indexdb/constants";
    import styles from "./SettingsPage.module.css";

    let showMigrationStats = $state(false);
    let migrationStatsLoading = $state(false);
    let migrationStats = $state(null);

    async function handleMigrationStatsCheck() {
        migrationStatsLoading = true;
        try {
            const stats = await getMigrationStats(DB_NAMES.MAIN_LES_STORE_V1);
            migrationStats = stats;
            showMigrationStats = true;
        } catch (error) {
            console.error("Ошибка получения статистики миграций:", error);
            alert("Не удалось загрузить статистику миграций");
        } finally {
            migrationStatsLoading = false;
        }
    }

    function formatDuration(ms: number): string {
        if (ms < 1000) return `${ms}мс`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}с`;
        return `${(ms / 60000).toFixed(1)}мин`;
    }
</script>

<div class={styles.settingSection}>
    <h2 class={styles.sectionTitle}>⏱️ Статистика миграций</h2>
    <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
            <div class={styles.settingName}>
                <span class={styles.settingIcon}>📊</span>
                Время выполнения миграций
            </div>
            <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
                ● ДОСТУПНО
            </span>
        </div>
        <div class={styles.settingDescription}>
            Детальная информация о времени выполнения миграций базы данных. Показывает продолжительность каждой миграции и общее время.
        </div>
        <div class={styles.settingActions}>
            <Button variant="outline" size="sm" onclick={handleMigrationStatsCheck} disabled={migrationStatsLoading}>
                {migrationStatsLoading ? "🔄 Загрузка..." : "📈 Показать статистику"}
            </Button>
        </div>
        {#if showMigrationStats && migrationStats}
            <div class={styles.versionResults}>
                <h4>📋 Общая информация</h4>
                <div class={styles.statsGrid}>
                    <div>
                        <strong>Общее время:</strong>
                        {formatDuration(migrationStats.totalDuration)}
                    </div>
                    <div>
                        <strong>Последняя миграция:</strong>
                        {migrationStats.lastMigrationDate ? migrationStats.lastMigrationDate.toLocaleString() : "Не выполнялась"}
                    </div>
                    <div>
                        <strong>Выполнено миграций:</strong>
                        {migrationStats.executedMigrations.length}
                    </div>
                </div>
                {#if migrationStats.executedMigrations.length > 0}
                    <h4>🔍 Детализация по миграциям</h4>
                    <div class={styles.migrationList}>
                        {#each migrationStats.executedMigrations as migration}
                            <div class={styles.migrationItem}>
                                <div class={styles.migrationHeader}>
                                    <strong>v{migration.version} - {migration.fileName}</strong>
                                </div>
                                <div class={styles.migrationDetails}>
                                    <span>Схема: {formatDuration(migration.schemaDuration)}</span>
                                    <span>Данные: {formatDuration(migration.dataDuration)}</span>
                                    <span>Общее: {formatDuration(migration.schemaDuration + migration.dataDuration)}</span>
                                    <span>Завершена: {new Date(migration.endTime).toLocaleTimeString()}</span>
                                </div>
                            </div>
                        {/each}
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
