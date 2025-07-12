<script lang="ts">
    import { onMount } from "svelte";
    import {
        Button,
        StatusIndicator,
        ThemeSelector,
    } from "../../../components/ui";
    import { ROUTES, Link } from "../../../routing";
    import {
        clearAllAppData,
        clearServiceWorkersOnly,
        clearStorageOnly,
        clearIndexedDBOnly,
    } from "../../../core/clear_app_data";
    import { theme } from "../../../stores/theme";
    import { VersionManager } from "../../../indexdb/main_les_store_v1/version_manager";
    import { AllUsersChecker } from "../../../indexdb/main_les_store_v1/all_users_checker";
    import { ConnectionManager } from "../../../indexdb/main_les_store_v1/connection_manager";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { TabManagement } from "../../../core/broadcast_channel/tab_management";
    import { sharedWorkerApi } from "../../../api/shared_worker";
    import { back_store } from "../../../local_back/back_store/back_store";
    import { getMigrationStats } from "../../../indexdb/db_state_manager_v1/db_state_manager";
    import { DB_NAMES } from "../../../indexdb/constants";
    import {
        getEntityVersionsSummary,
        getEntityVersions,
    } from "../../../indexdb/entity_versions_v1/entity_versions_manager";
    import { shared_worker_store } from "../../../processes/shared_worker/shared_worker_store";
    import styles from "./SettingsPage.module.css";

    // State for settings
    let systemStatus = "operational";
    let showClearOptions = false;

    // State for active tabs monitoring
    let activeTabsCount = 0;

    // State for version management
    let showVersionInfo = false;
    let versionCheckInProgress = false;
    let versionCheckResults: {
        userStats: any;
        versionStats: any;
        allUserIds: string[];
        entitiesStats: {
            friends: {
                total: number;
                withVersion: number;
                withoutVersion: number;
            };
            rooms: {
                total: number;
                withVersion: number;
                withoutVersion: number;
            };
        };
    } | null = null;
    let versionCheckError: string | null = null;
    let isNotAuthorized = false;

    // State for migration statistics
    let showMigrationStats = false;
    let migrationStatsLoading = false;
    let migrationStats: {
        totalDuration: number;
        lastMigrationDate: Date | null;
        executedMigrations: Array<{
            version: number;
            fileName: string;
            schemaDuration: number;
            dataDuration: number;
            startTime: number;
            endTime: number;
        }>;
    } | null = null;

    // State for entity versions
    let showEntityVersions = false;
    let entityVersionsLoading = false;
    let entityVersions: {
        accounts: number;
        rooms: number;
        friends: number;
        accountsCount: number;
        roomsCount: number;
        friendsCount: number;
        accountsWithVersion: number;
        roomsWithVersion: number;
        friendsWithVersion: number;
    } | null = null;

    // Initialize active tabs monitoring
    onMount(() => {
        const unsubscribe = sharedWorkerApi.tabs.subscribeActiveTabsCount(
            (count) => {
                activeTabsCount = count;
            },
        );

        return unsubscribe;
    });

    // Clear data handlers from AuthPage
    function toggleClearOptions() {
        showClearOptions = !showClearOptions;
    }

    async function handleClearAll() {
        if (
            confirm(
                "Вы уверены, что хотите очистить ВСЕ данные приложения? Это действие нельзя отменить.",
            )
        ) {
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

    const handleSystemDiagnostics = () => {
        // TODO: Implement system diagnostics
        alert("Диагностика системы будет реализована в следующих версиях");
    };

    // Tab management handlers
    function handleCloseAllOtherTabs() {
        if (
            confirm(
                "Закрыть все остальные вкладки приложения? Текущая вкладка останется открытой.",
            )
        ) {
            TabManagement.closeAllOtherTabs();
        }
    }

    function handleCloseAllTabs() {
        if (
            confirm(
                "Закрыть ВСЕ вкладки приложения включая текущую? Это действие закроет все открытые вкладки приложения.",
            )
        ) {
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
            const userStats = await AllUsersChecker.getUserReadinessStats(
                db,
                2,
            ); // версия 2

            // Получить общую статистику версий
            const versionStats = await VersionManager.getVersionStats(db);

            // Получить список всех пользователей с ID
            const allUserIds = await AllUsersChecker.scanAllUserIds(db);

            // Проверить миграции friends и rooms из back_store
            const friendsEntries = Object.values(back_store.friends_by_id);
            const roomsEntries = Object.values(back_store.rooms_by_id);

            const friendsStats = {
                total: friendsEntries.length,
                withVersion: friendsEntries.filter(
                    (f) => f.version !== undefined,
                ).length,
                withoutVersion: friendsEntries.filter(
                    (f) => f.version === undefined,
                ).length,
            };

            const roomsStats = {
                total: roomsEntries.length,
                withVersion: roomsEntries.filter((r) => r.version !== undefined)
                    .length,
                withoutVersion: roomsEntries.filter(
                    (r) => r.version === undefined,
                ).length,
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
            versionCheckError =
                error instanceof Error ? error.message : String(error);
        } finally {
            versionCheckInProgress = false;
        }
    }

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

    async function handleEntityVersionsCheck() {
        entityVersionsLoading = true;
        try {
            // Проверяем авторизацию
            const authStore = $appAuthStore;
            const authIds = Object.keys(authStore.byId);

            if (authIds.length === 0) {
                isNotAuthorized = true;
                showEntityVersions = true;
                return;
            }

            // Берем первого авторизованного пользователя
            const currentUserId = authIds[0];
            isNotAuthorized = false;

            // Загружаем все данные в back_store перед анализом версий
            console.log("📊 Загрузка данных в back_store...");

            // Загружаем друзей
            await sharedWorkerApi.friends.getList();

            // Загружаем комнаты (через middleware напрямую)
            await shared_worker_store.fetch({ path: "GET_ROOMS" });

            console.log("✅ Данные загружены в back_store");

            // Получаем детальную статистику версий из back_store
            const versionsAnalysis = getEntityVersions();

            // Получаем версии сущностей из entity_versions_manager
            const versions = await getEntityVersionsSummary(currentUserId);

            // Подсчитываем общие количества
            const accountsCount = Object.keys(back_store.accounts_by_id).length;
            const roomsCount = Object.keys(back_store.rooms_by_id).length;
            const friendsCount = Object.keys(back_store.friends_by_id).length;

            // Подсчитываем количество записей с версиями (version > 0)
            const accountsWithVersion = versionsAnalysis.accounts
                .filter((stat) => stat.version > 0)
                .reduce((sum, stat) => sum + stat.count, 0);
            const roomsWithVersion = versionsAnalysis.rooms
                .filter((stat) => stat.version > 0)
                .reduce((sum, stat) => sum + stat.count, 0);
            const friendsWithVersion = versionsAnalysis.friends
                .filter((stat) => stat.version > 0)
                .reduce((sum, stat) => sum + stat.count, 0);

            // Обновляем entityVersions с детальной статистикой
            entityVersions = {
                // Версии из entity_versions_manager
                accounts: versions.accounts,
                rooms: versions.rooms,
                friends: versions.friends,
                // Общие количества
                accountsCount,
                roomsCount,
                friendsCount,
                // Количества с версиями
                accountsWithVersion,
                roomsWithVersion,
                friendsWithVersion,
                // Детальная статистика по версиям из back_store
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

    function formatDuration(ms: number): string {
        if (ms < 1000) return `${ms}мс`;
        if (ms < 60000) return `${(ms / 1000).toFixed(1)}с`;
        return `${(ms / 60000).toFixed(1)}мин`;
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
                    Выберите тему интерфейса для персонализации внешнего вида
                    приложения. Изменения применяются мгновенно.
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
                    <span
                        class={`${styles.statusIndicator} ${styles.statusActive}`}
                    >
                        ● {systemStatus.toUpperCase()}
                    </span>
                </div>
                <div class={styles.settingDescription}>
                    Система работает в штатном режиме. Все модули функционируют
                    корректно.
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
                    <span
                        class={`${styles.statusIndicator} ${styles.statusActive}`}
                    >
                        ● ДОСТУПНО
                    </span>
                </div>
                <div class={styles.settingDescription}>
                    Управление локальными данными приложения, включая настройки,
                    кэш и пользовательские данные.
                </div>
                <div class={styles.settingActions}>
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={toggleClearOptions}
                    >
                        {showClearOptions
                            ? "Скрыть опции"
                            : "Показать опции очистки"}
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
                        <span class={styles.settingIcon}>📊</span>
                        Мониторинг активных вкладок
                    </div>
                    <span
                        class={`${styles.statusIndicator} ${styles.statusActive}`}
                    >
                        ● {activeTabsCount} АКТИВНЫХ
                    </span>
                </div>
                <div class={styles.settingDescription}>
                    Отслеживание количества активных вкладок приложения в
                    реальном времени через SharedWorker. Счетчик автоматически
                    обновляется при открытии/закрытии вкладок.
                </div>
            </div>

            <div class={styles.settingItem}>
                <div class={styles.settingHeader}>
                    <div class={styles.settingName}>
                        <span class={styles.settingIcon}>🚪</span>
                        Закрытие вкладок
                    </div>
                    <span
                        class={`${styles.statusIndicator} ${styles.statusActive}`}
                    >
                        ● ДОСТУПНО
                    </span>
                </div>
                <div class={styles.settingDescription}>
                    Управление открытыми вкладками приложения через broadcast
                    сообщения. Позволяет закрывать вкладки синхронно через все
                    экземпляры приложения.
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
                <div
                    class={styles.settingDescription}
                    style="margin-top: 8px; font-size: 0.9em; color: var(--color-text-secondary);"
                >
                    ⚠️ "Закрыть остальные вкладки" - закроет все вкладки кроме
                    текущей<br />
                    ⚠️ "Закрыть все вкладки" - закроет включая текущую вкладку
                </div>
            </div>
        </div>

        <!-- Migration Statistics Section -->
        <div class={styles.settingSection}>
            <h2 class={styles.sectionTitle}>⏱️ Статистика миграций</h2>

            <div class={styles.settingItem}>
                <div class={styles.settingHeader}>
                    <div class={styles.settingName}>
                        <span class={styles.settingIcon}>📊</span>
                        Время выполнения миграций
                    </div>
                    <span
                        class={`${styles.statusIndicator} ${styles.statusActive}`}
                    >
                        ● ДОСТУПНО
                    </span>
                </div>
                <div class={styles.settingDescription}>
                    Детальная информация о времени выполнения миграций базы
                    данных. Показывает продолжительность каждой миграции и общее
                    время.
                </div>
                <div class={styles.settingActions}>
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={handleMigrationStatsCheck}
                        disabled={migrationStatsLoading}
                    >
                        {migrationStatsLoading
                            ? "🔄 Загрузка..."
                            : "📈 Показать статистику"}
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
                                {migrationStats.lastMigrationDate
                                    ? migrationStats.lastMigrationDate.toLocaleString()
                                    : "Не выполнялась"}
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
                                            <strong
                                                >v{migration.version} - {migration.fileName}</strong
                                            >
                                        </div>
                                        <div class={styles.migrationDetails}>
                                            <span
                                                >Схема: {formatDuration(
                                                    migration.schemaDuration,
                                                )}</span
                                            >
                                            <span
                                                >Данные: {formatDuration(
                                                    migration.dataDuration,
                                                )}</span
                                            >
                                            <span
                                                >Общее: {formatDuration(
                                                    migration.schemaDuration +
                                                        migration.dataDuration,
                                                )}</span
                                            >
                                            <span
                                                >Завершена: {new Date(
                                                    migration.endTime,
                                                ).toLocaleTimeString()}</span
                                            >
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {/if}
                    </div>
                {/if}
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
                    <span
                        class={`${styles.statusIndicator} ${styles.statusActive}`}
                    >
                        ● ДОСТУПНО
                    </span>
                </div>
                <div class={styles.settingDescription}>
                    Проверка версий всех пользователей и сущностей в базе
                    данных. Показывает ID пользователей и их текущие версии.
                </div>
                <div class={styles.settingActions}>
                    <Button
                        variant="outline"
                        size="sm"
                        onclick={handleVersionCheck}
                        disabled={versionCheckInProgress}
                    >
                        {versionCheckInProgress
                            ? "⏳ Проверка..."
                            : "🔍 Проверить версии"}
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
                            Данные версий зашифрованы и требуют авторизации для
                            доступа.
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
                                        User ID: {userId} | Version: {versionCheckResults
                                            .userStats.completedUsers > 0
                                            ? "2"
                                            : "1"}
                                    </div>
                                {/each}
                            {/if}
                        </div>

                        <h4>📈 Статистика пользователей:</h4>
                        <div class={styles.statsGrid}>
                            <div>
                                Всего пользователей: {versionCheckResults
                                    .userStats.totalUsers}
                            </div>
                            <div>
                                Завершили миграцию: {versionCheckResults
                                    .userStats.completedUsers}
                            </div>
                            <div>
                                Готовность: {versionCheckResults.userStats
                                    .completionPercentage}%
                            </div>
                        </div>

                        <h4>👥 Статистика Friends (в памяти):</h4>
                        <div class={styles.statsGrid}>
                            <div>
                                Всего friends: {versionCheckResults
                                    .entitiesStats.friends.total}
                            </div>
                            <div>
                                С версией: {versionCheckResults.entitiesStats
                                    .friends.withVersion}
                            </div>
                            <div>
                                Без версии: {versionCheckResults.entitiesStats
                                    .friends.withoutVersion}
                            </div>
                            <div>
                                Готовность: {versionCheckResults.entitiesStats
                                    .friends.total > 0
                                    ? Math.round(
                                          (versionCheckResults.entitiesStats
                                              .friends.withVersion /
                                              versionCheckResults.entitiesStats
                                                  .friends.total) *
                                              100,
                                      )
                                    : 100}%
                            </div>
                        </div>

                        <h4>🏠 Статистика Rooms (в памяти):</h4>
                        <div class={styles.statsGrid}>
                            <div>
                                Всего rooms: {versionCheckResults.entitiesStats
                                    .rooms.total}
                            </div>
                            <div>
                                С версией: {versionCheckResults.entitiesStats
                                    .rooms.withVersion}
                            </div>
                            <div>
                                Без версии: {versionCheckResults.entitiesStats
                                    .rooms.withoutVersion}
                            </div>
                            <div>
                                Готовность: {versionCheckResults.entitiesStats
                                    .rooms.total > 0
                                    ? Math.round(
                                          (versionCheckResults.entitiesStats
                                              .rooms.withVersion /
                                              versionCheckResults.entitiesStats
                                                  .rooms.total) *
                                              100,
                                      )
                                    : 100}%
                            </div>
                        </div>
                    </div>
                {/if}
            </div>
        </div>

        <!-- Entity Versions Debug Section -->
        <div class={styles.settingSection}>
            <h2 class={styles.sectionTitle}>🔢 ВЕРСИИ СУЩНОСТЕЙ</h2>

            <div class={styles.settingItem}>
                <div class={styles.settingHeader}>
                    <div class={styles.settingName}>
                        <span class={styles.settingIcon}>🗂️</span>
                        <span
                            class={entityVersionsLoading
                                ? "⏳ Проверка версий..."
                                : "🗂️ Версии сущностей"}>Версии сущностей</span
                        >
                    </div>
                </div>
                <div class={styles.settingDescription}>
                    Отображает текущие версии сущностей для отладки и
                    мониторинга миграций
                </div>
                <div class={styles.settingActions}>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={entityVersionsLoading}
                        onclick={handleEntityVersionsCheck}
                    >
                        {entityVersionsLoading
                            ? "⏳ Проверка..."
                            : "🔍 Проверить версии"}
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
                            <Link href={ROUTES.AUTH}>
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
                                {entityVersions.accountsWithVersion} из {entityVersions.accountsCount}
                                ({entityVersions.accountsCount > 0
                                    ? (
                                          (entityVersions.accountsWithVersion /
                                              entityVersions.accountsCount) *
                                          100
                                      ).toFixed(1)
                                    : 0}%)
                            </div>
                            <div>
                                <strong>💬 Rooms с версиями:</strong>
                                {entityVersions.roomsWithVersion} из {entityVersions.roomsCount}
                                ({entityVersions.roomsCount > 0
                                    ? (
                                          (entityVersions.roomsWithVersion /
                                              entityVersions.roomsCount) *
                                          100
                                      ).toFixed(1)
                                    : 0}%)
                            </div>
                            <div>
                                <strong>👥 Friends с версиями:</strong>
                                {entityVersions.friendsWithVersion} из {entityVersions.friendsCount}
                                ({entityVersions.friendsCount > 0
                                    ? (
                                          (entityVersions.friendsWithVersion /
                                              entityVersions.friendsCount) *
                                          100
                                      ).toFixed(1)
                                    : 0}%)
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
                                                <strong
                                                    >Версия {stat.version}:</strong
                                                >
                                                {stat.count} записей
                                                {#if entityVersions.accountsCount > 0}
                                                    ({(
                                                        (stat.count /
                                                            entityVersions.accountsCount) *
                                                        100
                                                    ).toFixed(1)}%)
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
                                                <strong
                                                    >Версия {stat.version}:</strong
                                                >
                                                {stat.count} записей
                                                {#if entityVersions.roomsCount > 0}
                                                    ({(
                                                        (stat.count /
                                                            entityVersions.roomsCount) *
                                                        100
                                                    ).toFixed(1)}%)
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
                                                <strong
                                                    >Версия {stat.version}:</strong
                                                >
                                                {stat.count} записей
                                                {#if entityVersions.friendsCount > 0}
                                                    ({(
                                                        (stat.count /
                                                            entityVersions.friendsCount) *
                                                        100
                                                    ).toFixed(1)}%)
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
