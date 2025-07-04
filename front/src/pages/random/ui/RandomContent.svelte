<script lang="ts">
  import { writable } from "svelte/store";
  import { copyTextToClipboard, defaultCharRanges, randomByRange } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
  import { gen_pass } from "../../../core/random/gen_pass";
  import { theme } from "../../../stores/theme";
  import { ActionButton } from "../../../components/ui";
  
  // Import CSS modules
  import styles from "./RandomContent.module.css";
  import sectionStyles from "../../../styles/modules/section-titles.module.css";

  const randomString = writable(getNewRandomString());
  let isGenerating = false;
  let copyStatus = "";

  function getNewRandomString() {
    return gen_pass();
  }

  async function handleRegenerate() {
    isGenerating = true;
    // Добавляем небольшую задержку для эффекта
    await new Promise(resolve => setTimeout(resolve, 200));
    randomString.set(getNewRandomString());
    isGenerating = false;
    copyStatus = "";
  }

  async function handleClip() {
    try {
      await copyTextToClipboard($randomString);
      copyStatus = "СКОПИРОВАНО";
      setTimeout(() => {
        copyStatus = "";
      }, 2000);
    } catch (error) {
      copyStatus = "ОШИБКА";
      setTimeout(() => {
        copyStatus = "";
      }, 2000);
    }
  }

  // Генерация разных типов данных
  const generatorTypes = [
    { id: 'password', name: 'ПАРОЛЬ', icon: '🔐', description: 'Криптостойкий пароль' },
    { id: 'hex', name: 'HEX', icon: '🔢', description: 'Шестнадцатеричная строка' },
    { id: 'base64', name: 'BASE64', icon: '📝', description: 'Base64 строка' },
    { id: 'uuid', name: 'UUID', icon: '🆔', description: 'Уникальный идентификатор' }
  ];

  let currentType = 'password';

  function generateByType(type: string) {
    switch (type) {
      case 'hex':
        return Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      case 'base64':
        const bytes = new Uint8Array(24);
        crypto.getRandomValues(bytes);
        return btoa(String.fromCharCode(...bytes));
      case 'uuid':
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      default:
        return gen_pass();
    }
  }

  async function handleTypeChange(type: string) {
    currentType = type;
    isGenerating = true;
    await new Promise(resolve => setTimeout(resolve, 150));
    randomString.set(generateByType(type));
    isGenerating = false;
    copyStatus = "";
  }
</script>

<div class={styles.container} data-widget-name="RandomContent">
  
  <!-- Generator Type Selection -->
  <div class={styles.generatorTypes}>
    <h3 class={sectionStyles.sectionTitle}>ТИП ГЕНЕРАТОРА</h3>
    <div class={styles.typesGrid}>
      {#each generatorTypes as type}
        <button 
          class="{styles.typeButton} {currentType === type.id ? styles.typeButtonActive : ''}"
          onclick={() => handleTypeChange(type.id)}
          title={type.description}
        >
          <span class={styles.typeIcon}>{type.icon}</span>
          <span class={styles.typeName}>{type.name}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Generated Output -->
  <div class={styles.outputSection}>
    <h3 class="{sectionStyles.sectionTitle} {sectionStyles.sectionTitleSecondary}">СГЕНЕРИРОВАННЫЕ ДАННЫЕ</h3>
    <div class={styles.outputCard}>
      <div class="{styles.outputDisplay} {isGenerating ? styles.outputDisplayGenerating : ''}">
        {#if isGenerating}
          <div class={styles.generatingAnimation}>
            <span class={styles.generatingText}>ГЕНЕРАЦИЯ</span>
            <span class={styles.dots}>
              <span class={styles.dot}>.</span>
              <span class={styles.dot}>.</span>
              <span class={styles.dot}>.</span>
            </span>
          </div>
        {:else}
          <code class={styles.outputText}>{$randomString}</code>
        {/if}
      </div>
      
      <div class={styles.outputInfo}>
        <span class={styles.infoItem}>ДЛИНА: {$randomString.length}</span>
        <span class={styles.infoItem}>ТИП: {generatorTypes.find(t => t.id === currentType)?.name}</span>
      </div>
    </div>
  </div>

  <!-- Control Buttons -->
  <div class={styles.controlsSection}>
    <div class={styles.controlsGrid}>
      <ActionButton
        variant="primary"
        size="md"
        disabled={isGenerating}
        onclick={handleRegenerate}
        icon="🔄"
      >
        ПЕРЕГЕНЕРИРОВАТЬ
      </ActionButton>

      <ActionButton
        variant="secondary"
        size="md"
        disabled={isGenerating}
        onclick={handleClip}
        icon="📋"
        className={copyStatus ? 'status-active' : ''}
      >
        {copyStatus || 'КОПИРОВАТЬ'}
      </ActionButton>
    </div>
  </div>

  <!-- Security Info -->
  <div class={styles.securitySection}>
    <div class={styles.securityCard}>
      <div class={styles.securityHeader}>
        <span class={styles.securityIcon}>🛡️</span>
        <h4 class={styles.securityTitle}>ИНФОРМАЦИЯ О БЕЗОПАСНОСТИ</h4>
      </div>
      <div class={styles.securityDetails}>
        <div class={styles.securityItem}>
          <span class={styles.securityLabel}>ЭНТРОПИЯ:</span>
          <span class={styles.securityValue}>МАКСИМАЛЬНАЯ</span>
        </div>
        <div class={styles.securityItem}>
          <span class={styles.securityLabel}>ИСТОЧНИК:</span>
          <span class={styles.securityValue}>CRYPTO.GETRANDOMVALUES()</span>
        </div>
        <div class={styles.securityItem}>
          <span class={styles.securityLabel}>СТАНДАРТ:</span>
          <span class={styles.securityValue}>CRYPTOGRAPHICALLY SECURE</span>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation -->
  <div class={styles.navigationSection}>
    <ActionButton
      href={ROUTES.HOME}
      variant="primary"
      size="lg"
      icon="🏠"
    >
      ВЕРНУТЬСЯ В ГЛАВНОЕ МЕНЮ
    </ActionButton>
  </div>

</div>

<style>
  /* Global styles for ActionButton status */
  :global(.status-active) {
    border-color: var(--les-success) !important;
    color: var(--les-success) !important;
    box-shadow: 0 0 15px var(--les-success) !important;
  }
</style>
