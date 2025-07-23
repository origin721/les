<script lang="ts">
    import { Button } from "../../../components/ui";
    import { Link, ROUTES } from "../../../routing";
    import styles from "./SettingsPage.module.css";
</script>

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
            <Link hash={ROUTES.HOME}>
                <Button variant="outline" size="sm">
                    Перейти на главную
                </Button>
            </Link>
        </div>
    </div>
</div>
