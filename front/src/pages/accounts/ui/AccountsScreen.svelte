<script lang="ts">
  import { search_params_to_string } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";
  import { SEARCH_PARAMS_KEYS as SETTINGS_S_P_KEYS } from "../../account_settings/constants/SEARCH_PARAMS_KEYS";
  import { Button, Card } from "../../../components/ui";
  import styles from "./AccountsScreen.module.css";
</script>

<div class={styles.accountsScreen} data-widget-name="AccountsScreen">
  <div class={styles.actionsSection}>
    <div class={styles.navigationActions}>
      <Link href={ROUTES.HOME}>
        <Button variant="outline" size="sm">
          ← НАЗАД
        </Button>
      </Link>
    </div>
    
    <div class={styles.accountActions}>
      <Link href={ROUTES.ACCOUNTS_NEW}>
        <Button variant="primary" size="md">
          + СОЗДАТЬ_АККАУНТ
        </Button>
      </Link>
      
      <Link href={ROUTES.AUTH}>
        <Button variant="secondary" size="md">
          🔐 АВТОРИЗИРОВАТЬСЯ
        </Button>
      </Link>
      
      <Button variant="danger" size="md">
        🗑️ УДАЛИТЬ_ВЫБРАННОЕ
      </Button>
    </div>
  </div>

  <div class={styles.accountsGrid}>
    {#each Object.values($appAuthStore.byId) as authItem}
      <Card variant="elevated" size="lg" className={styles.accountCard}>
        <div class={styles.accountInfo}>
          <div class={styles.accountHeader}>
            <h3 class={styles.accountName}>👤 {authItem.namePub}</h3>
            <div class={styles.accountStatus}>
              <span class={styles.statusDot}></span>
              <span class={styles.statusText}>АКТИВЕН</span>
            </div>
          </div>
          
          <div class={styles.accountMeta}>
            <div class={styles.metaItem}>
              <span class={styles.metaLabel}>ID_АККАУНТА</span>
              <span class={styles.metaValue}>{authItem.id.substring(0, 8)}...</span>
            </div>
            <div class={styles.metaItem}>
              <span class={styles.metaLabel}>УРОВЕНЬ_ДОСТУПА</span>
              <span class={styles.metaValue}>ADMIN</span>
            </div>
            <div class={styles.metaItem}>
              <span class={styles.metaLabel}>СТАТУС_ШИФРОВАНИЯ</span>
              <span class={styles.metaValue}>🔒 ЗАЩИЩЕН</span>
            </div>
            <div class={styles.metaItem}>
              <span class={styles.metaLabel}>ПОСЛЕДНЯЯ_АКТИВНОСТЬ</span>
              <span class={styles.metaValue}>СЕЙЧАС</span>
            </div>
          </div>

          <div class={styles.securityBadges}>
            <span class={styles.securityBadge}>🛡️ CURVE25519</span>
            <span class={styles.securityBadge}>🔐 AES-256</span>
            <span class={styles.securityBadge}>⚡ P2P_READY</span>
          </div>
          
          <div class={styles.accountActionsInline}>
            <Link href={ROUTES.ACCOUNT_SETTINGS+'?'+search_params_to_string({
              [SETTINGS_S_P_KEYS.ID]: authItem.id,
            })}>
              <Button variant="outline" size="sm">
                ⚙️ НАСТРОЙКИ
              </Button>
            </Link>
            
            <Button 
              variant="danger" 
              size="sm"
              onclick={() => appAuthStore.onDeleteSecret(authItem.id)}
            >
              🗑️ УДАЛИТЬ
            </Button>
          </div>
        </div>
      </Card>
    {/each}
    
    {#if Object.values($appAuthStore.byId).length === 0}
      <div class={styles.emptyState}>
        <div class={styles.emptyContent}>
          <div class={styles.emptyIcon}>👤</div>
          <h3 class={styles.emptyTitle}>НЕТ_АККАУНТОВ</h3>
          <p class={styles.emptyDescription}>
            Создайте новый аккаунт для начала работы<br/>
            с системой безопасного обмена сообщениями
          </p>
          
          <div class={styles.securityBadges}>
            <span class={styles.securityBadge}>🔒 END-TO-END</span>
            <span class={styles.securityBadge}>🛡️ ZERO-TRUST</span>
            <span class={styles.securityBadge}>⚡ QUANTUM-SAFE</span>
          </div>
          
          <Link href={ROUTES.ACCOUNTS_NEW}>
            <Button variant="primary" size="lg">
              + СОЗДАТЬ_ПЕРВЫЙ_АККАУНТ
            </Button>
          </Link>
        </div>
      </div>
    {/if}
  </div>
</div>
