<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import CryptoPageEncrypt from "./CryptoPageEncrypt.svelte";
  import CryptoPageDecrypt from "./CryptoPageDecrypt.svelte";
  import CryptoPageKeys from "./CryptoPageKeys.svelte";
  import CryptoPageSign from "./CryptoPageSign.svelte";

  const PAGE_TABS = {
    KEYS: "KEYS",
    ENCRYPT: "ENCRYPT",
    DECRYPT: "DECRYPT",
    SIGN: "SIGN",
  };

  let pageTab = $state(PAGE_TABS.KEYS);
</script>

<main class="flex-col flex gap-4">
  <Link href={ROUTES.HOME}>На главную</Link>

  <div class="flex flex-row gap-4">
    <label>
      Управление ключами
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.KEYS}
      />
    </label>

    <label>
      Зашифровать
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.ENCRYPT}
      />
    </label>

    <label>
      Расшифровать
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.DECRYPT}
      />
    </label>

    <label>
      Подпись
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.SIGN}
      />
    </label>
  </div>

  {#if pageTab === PAGE_TABS.KEYS}
    <CryptoPageKeys />
  {:else if pageTab === PAGE_TABS.ENCRYPT}
    <CryptoPageEncrypt />
  {:else if pageTab === PAGE_TABS.DECRYPT}
    <CryptoPageDecrypt />
  {:else if pageTab === PAGE_TABS.SIGN}
    <CryptoPageSign />
  {/if}
</main>
