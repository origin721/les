<script lang="ts">
    import { Button } from "../../../components/ui";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { sharedWorkerApi } from "../../../api/shared_worker";
    import { shared_worker_store } from "../../../processes/shared_worker/shared_worker_store";
    import { back_store } from "../../../local_back/back_store/back_store";
    import { getEntityVersionsSummary, getEntityVersions } from "../../../indexdb/entity_versions_v1/entity_versions_manager";
    import { Link, ROUTES } from "../../../routing";
    import styles from "./SettingsPage.module.css";

    let showEntityVersions = $state(false);
    let entityVersionsLoading = $state(false);
    let entityVersions = $state(null);
    let isNotAuthorized = $state(false);

    async function handleEntityVersionsCheck() {
        entityVersionsLoading = true;
        try {
            const authStore = $appAuthStore;
            const authIds = Object.keys(authStore.byId);

            if (authIds.length === 0) {
                isNotAuthorized = true;
                showEntityVersions = true;
                return;
            }

            const currentUserId = authIds[0];
            isNotAuthorized = false;

            console.log("📊 Загрузка данных в back_store...");
            await sharedWorkerApi.friends.getList();
            await shared_worker_store.fetch({ path: "GET_ROOMS" });
            console.log("✅ Данные загружены в back_store");

            const versionsAnalysis = getEntityVersions();
            const versions = await getEntityVersionsSummary(currentUserId);

            const accountsCount = Object.keys(back_store.accounts_by_id).length;
            const roomsCount = Object.keys(back_store.rooms_by_id).length;
            const friendsCount = Object.keys(back_store.friends_by_id).length;

            const accountsWithVersion = versionsAnalysis.accounts.filter(stat => stat.version > 0).reduce((sum, stat) => sum + stat.count, 0);
            const roomsWithVersion = versionsAnalysis.rooms.filter(stat => stat.version > 0).reduce((sum, stat) => sum + stat.count, 0);
            const friendsWithVersion = versionsAnalysis.friends.filter(stat => stat.version > 0).reduce((sum, stat) => sum + stat.count, 0);

            entityVersions = {
                accounts: versions.accounts,
                rooms: versions.rooms,
                friends: versions.friends,
                accountsCount,
                roomsCount,
                friendsCount,
                accountsWithVersion,
                roomsWithVersion,
                friendsWithVersion,
                versionsAnalysis,
            };

            showEntityVersions = true;
        } catch (error) {
            console.error("Ошибка получения версий сущностей:", error);
            alert("Не удалось загрузить версии сущностей");
        } finally {
            entityVersionsLoading = false;
        }
    }
</script>

<div class={styles.settingSection}>
    <h2 class={styles.sectionTitle}>🔢 ВЕРСИИ СУЩНОСТЕЙ</h2>
    <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
            <div class={styles.settingName}>
                <span class={styles.settingIcon}>🗂️</span>
                <span class={entityVersionsLoading ? "⏳ Проверка версий..." : "🗂️ Версии сущностей"}>Версии сущностей</span>
            </div>
        </div>
        <div class={styles.settingDescription}>
            Отображает текущие версии сущностей для отладки и мониторинга миграций
        </div>
        <div class={styles.settingActions}>
            <Button variant="outline" size="sm" disabled={entityVersionsLoading} onclick={handleEntityVersionsCheck}>
                {entityVersionsLoading ? "⏳ Проверка..." : "🔍 Проверить версии"}
            </Button>
        </div>
        {#if showEntityVersions && isNotAuthorized}
            <div class={styles.authRequired}>
                <div class={styles.authMessage}>
                    Для проверки версий сущностей требуется авторизация
                </div>
                <div class={styles.authDescription}>
                    Авторизуйтесь для просмотра версий ваших данных
                </div>
                <div class={styles.authActions}>
                    <Link href={'#'+ROUTES.AUTH}>
                        <Button variant="primary" size="sm">
                            🔑 Авторизоваться
                        </Button>
                    </Link>
                </div>
            </div>
        {/if}
        {#if showEntityVersions && entityVersions && !isNotAuthorized}
            <div class={styles.versionResults}>
                <h4>📊 Статистика версий сущностей</h4>
                <h4>🔢 Количество сущностей</h4>
                <div class={styles.statsGrid}>
                    <div>
                        <strong>🏠 Accounts:</strong>
                        {entityVersions.accountsCount} записей
                    </div>
                    <div>
                        <strong>💬 Rooms:</strong>
                        {entityVersions.roomsCount} записей
                    </div>
                    <div>
                        <strong>👥 Friends:</strong>
                        {entityVersions.friendsCount} записей
                    </div>
                </div>
                <h4>📝 Версии сущностей</h4>
                <div class={styles.statsGrid}>
                    <div>
                        <strong>🏠 Accounts version:</strong>
                        {entityVersions.accounts}
                    </div>
                    <div>
                        <strong>💬 Rooms version:</strong>
                        {entityVersions.rooms}
                    </div>
                    <div>
                        <strong>👥 Friends version:</strong>
                        {entityVersions.friends}
                    </div>
                </div>
                <h4>✅ Записи с версиями</h4>
                <div class={styles.statsGrid}>
                    <div>
                        <strong>🏠 Accounts с версиями:</strong>
                        {entityVersions.accountsWithVersion} из {entityVersions.accountsCount} ({entityVersions.accountsCount > 0 ? ((entityVersions.accountsWithVersion / entityVersions.accountsCount) * 100).toFixed(1) : 0}%)
                    </div>
                    <div>
                        <strong>💬 Rooms с версиями:</strong>
                        {entityVersions.roomsWithVersion} из {entityVersions.roomsCount} ({entityVersions.roomsCount > 0 ? ((entityVersions.roomsWithVersion / entityVersions.roomsCount) * 100).toFixed(1) : 0}%)
                    </div>
                    <div>
                        <strong>👥 Friends с версиями:</strong>
                        {entityVersions.friendsWithVersion} из {entityVersions.friendsCount} ({entityVersions.friendsCount > 0 ? ((entityVersions.friendsWithVersion / entityVersions.friendsCount) * 100).toFixed(1) : 0}%)
                    </div>
                </div>
                {#if entityVersions.versionsAnalysis}
                    <h4>📈 Детальная статистика по версиям</h4>
                    <div class={styles.versionDetailSection}>
                        <h5>🏠 Accounts - распределение по версиям:</h5>
                        <div class={styles.versionStats}>
                            {#if entityVersions.versionsAnalysis.accounts.length === 0}
                                <div class={styles.emptyMessage}>
                                    Нет записей аккаунтов
                                </div>
                            {:else}
                                {#each entityVersions.versionsAnalysis.accounts as stat}
                                    <div class={styles.versionItem}>
                                        <strong>Версия {stat.version}:</strong>
                                        {stat.count} записей
                                        {#if entityVersions.accountsCount > 0}
                                            ({((stat.count / entityVersions.accountsCount) * 100).toFixed(1)}%)
                                        {/if}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                    <div class={styles.versionDetailSection}>
                        <h5>💬 Rooms - распределение по версиям:</h5>
                        <div class={styles.versionStats}>
                            {#if entityVersions.versionsAnalysis.rooms.length === 0}
                                <div class={styles.emptyMessage}>
                                    Нет записей комнат
                                </div>
                            {:else}
                                {#each entityVersions.versionsAnalysis.rooms as stat}
                                    <div class={styles.versionItem}>
                                        <strong>Версия {stat.version}:</strong>
                                        {stat.count} записей
                                        {#if entityVersions.roomsCount > 0}
                                            ({((stat.count / entityVersions.roomsCount) * 100).toFixed(1)}%)
                                        {/if}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                    <div class={styles.versionDetailSection}>
                        <h5>👥 Friends - распределение по версиям:</h5>
                        <div class={styles.versionStats}>
                            {#if entityVersions.versionsAnalysis.friends.length === 0}
                                <div class={styles.emptyMessage}>
                                    Нет записей друзей
                                </div>
                            {:else}
                                {#each entityVersions.versionsAnalysis.friends as stat}
                                    <div class={styles.versionItem}>
                                        <strong>Версия {stat.version}:</strong>
                                        {stat.count} записей
                                        {#if entityVersions.friendsCount > 0}
                                            ({((stat.count / entityVersions.friendsCount) * 100).toFixed(1)}%)
                                        {/if}
                                    </div>
                                {/each}
                            {/if}
                        </div>
                    </div>
                {/if}
            </div>
        {/if}
    </div>
</div>
