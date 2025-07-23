<script lang="ts">
    import { Button } from "../../../components/ui";
    import { routingStore } from "../../../routing/stores";
    import { ROUTES } from "../../../routing";
    import styles from "./SettingsPage.module.css";
</script>

<div class={styles.settingSection}>
    <h2 class={styles.sectionTitle}>🇷🇺 Язык</h2>
    <div class={styles.settingItem}>
        <div class={styles.settingHeader}>
            <div class={styles.settingName}>
                <span class={styles.settingIcon}>🌏</span>
                Изменить язык
            </div>
            <span class={`${styles.statusIndicator} ${styles.statusActive}`}>
                ● ДОСТУПНО
            </span>
        </div>
        <div class={styles.settingActions}>
            <Button variant="outline" size="sm" onclick={() => routingStore.setRoute({hash: ROUTES.SELECT_LANG})}>
                Выбрать другой язык
            </Button>
        </div>
    </div>
</div>