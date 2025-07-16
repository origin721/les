<script lang="ts">
    import { onMount } from "svelte";
    import { theme } from "../../../stores/theme";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { sharedWorkerApi } from "../../../api/shared_worker";
    import { TabManagement } from "../../../core/broadcast_channel/tab_management";
    import { routingStore } from "../../../routing/stores";
    import { ROUTES } from "../../../routing";
    import SystemSettings from "./SystemSettings.svelte";
    import LanguageSettings from "./LanguageSettings.svelte";
    import DataManagement from "./DataManagement.svelte";
    import TabManagementSection from "./TabManagementSection.svelte";
    import MigrationStatistics from "./MigrationStatistics.svelte";
    import VersionManagement from "./VersionManagement.svelte";
    import EntityVersionsDebug from "./EntityVersionsDebug.svelte";
    import NavigationSection from "./NavigationSection.svelte";
    import styles from "./SettingsPage.module.css";

    let systemStatus = $state("operational");
    let activeTabsCount = $state(0);

    onMount(() => {
        const unsubscribe = sharedWorkerApi.tabs.subscribeActiveTabsCount((count) => {
            activeTabsCount = count;
        });
        return unsubscribe;
    });
</script>

<div class={styles.settingsContainer}>
    <div class={styles.settingsGrid}>
        <SystemSettings {systemStatus} />
        <LanguageSettings />
        <DataManagement />
        <TabManagementSection {activeTabsCount} />
        <MigrationStatistics />
        <VersionManagement />
        <EntityVersionsDebug />
        <NavigationSection />
    </div>
</div>
