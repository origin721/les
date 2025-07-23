<script lang="ts">
    import { Button } from "../../../components/ui";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { ConnectionManager } from "../../../indexdb/main_les_store_v1/connection_manager";
    import { AllUsersChecker } from "../../../indexdb/main_les_store_v1/all_users_checker";
    import { VersionManager } from "../../../indexdb/main_les_store_v1/version_manager";
    import { back_store } from "../../../local_back/back_store/back_store";
    import { ROUTES, Link } from "../../../routing";
    import styles from "./SettingsPage.module.css";

    let showVersionInfo = $state(false);
    let versionCheckInProgress = $state(false);
    let versionCheckResults = $state(null);
    let versionCheckError = $state(null);
    let isNotAuthorized = $state(false);

    async function handleVersionCheck() {
        versionCheckInProgress = true;
        versionCheckError = null;
        versionCheckResults = null;
        isNotAuthorized = false;

        try {
            const authStore = $appAuthStore;
            const authIds = Object.keys(authStore.byId);

            if (authIds.length === 0) {
                isNotAuthorized = true;
                showVersionInfo = true;
                return;
            }

            const db = await ConnectionManager.getConnection();
            const userStats = await AllUsersChecker.getUserReadinessStats(db, 2);
            const versionStats = await VersionManager.getVersionStats(db);
            const allUserIds = await AllUsersChecker.scanAllUserIds(db);

            const friendsEntries = Object.values(back_store.friends_by_id);
            const roomsEntries = Object.values(back_store.rooms_by_id);

            const friendsStats = {
                total: friendsEntries.length,
                withVersion: friendsEntries.filter(f => f.version !== undefined).length,
                withoutVersion: friendsEntries.filter(f => f.version === undefined).length,
            };

            const roomsStats = {
                total: roomsEntries.length,
                withVersion: roomsEntries.filter(r => r.version !== undefined).length,
                withoutVersion: roomsEntries.filter(r => r.version === undefined).length,
            };

            versionCheckResults = {
                userStats,
                versionStats,
                allUserIds: Array.from(allUserIds),
                entitiesStats: {
                    friends: friendsStats,
                    rooms: roomsStats,
                },
            };

            showVersionInfo = true;
        } catch (error) {
            versionCheckError = error instanceof Error ? error.message : String(error);
        } finally {
            versionCheckInProgress = false;
        }
    }
</script>

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
            Проверка версий всех пользователей и сущностей в базе данных. Показывает ID пользователей и их текущие версии.
        </div>
        <div class={styles.settingActions}>
            <Button variant="outline" size="sm" onclick={handleVersionCheck} disabled={versionCheckInProgress}>
                {versionCheckInProgress ? "⏳ Проверка..." : "🔍 Проверить версии"}
            </Button>
        </div>
        {#if versionCheckError}
            <div class={styles.errorMessage}>
                ❌ Ошибка: {versionCheckError}
            </div>
        {/if}
        {#if showVersionInfo && isNotAuthorized}
            <div class={styles.authRequired}>
                <div class={styles.authMessage}>
                    🔐 Для просмотра версий необходимо авторизоваться
                </div>
                <div class={styles.authDescription}>
                    Данные версий зашифрованы и требуют авторизации для доступа.
                </div>
                <div class={styles.authActions}>
                    <Link href={'#'+ROUTES.AUTH}>
                        <Button variant="primary" size="sm">
                            Перейти к авторизации
                        </Button>
                    </Link>
                </div>
            </div>
        {/if}
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
                                User ID: {userId} | Version: {versionCheckResults.userStats.completedUsers > 0 ? "2" : "1"}
                            </div>
                        {/each}
                    {/if}
                </div>
                <h4>📈 Статистика пользователей:</h4>
                <div class={styles.statsGrid}>
                    <div>
                        Всего пользователей: {versionCheckResults.userStats.totalUsers}
                    </div>
                    <div>
                        Завершили миграцию: {versionCheckResults.userStats.completedUsers}
                    </div>
                    <div>
                        Готовность: {versionCheckResults.userStats.completionPercentage}%
                    </div>
                </div>
                <h4>👥 Статистика Friends (в памяти):</h4>
                <div class={styles.statsGrid}>
                    <div>
                        Всего friends: {versionCheckResults.entitiesStats.friends.total}
                    </div>
                    <div>
                        С версией: {versionCheckResults.entitiesStats.friends.withVersion}
                    </div>
                    <div>
                        Без версии: {versionCheckResults.entitiesStats.friends.withoutVersion}
                    </div>
                    <div>
                        Готовность: {versionCheckResults.entitiesStats.friends.total > 0 ? Math.round((versionCheckResults.entitiesStats.friends.withVersion / versionCheckResults.entitiesStats.friends.total) * 100) : 100}%
                    </div>
                </div>
                <h4>🏠 Статистика Rooms (в памяти):</h4>
                <div class={styles.statsGrid}>
                    <div>
                        Всего rooms: {versionCheckResults.entitiesStats.rooms.total}
                    </div>
                    <div>
                        С версией: {versionCheckResults.entitiesStats.rooms.withVersion}
                    </div>
                    <div>
                        Без версии: {versionCheckResults.entitiesStats.rooms.withoutVersion}
                    </div>
                    <div>
                        Готовность: {versionCheckResults.entitiesStats.rooms.total > 0 ? Math.round((versionCheckResults.entitiesStats.rooms.withVersion / versionCheckResults.entitiesStats.rooms.total) * 100) : 100}%
                    </div>
                </div>
            </div>
        {/if}
    </div>
</div>
