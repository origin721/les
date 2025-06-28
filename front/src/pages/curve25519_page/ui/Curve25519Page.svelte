<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import Curve25519PageEncrypt from "./Curve25519PageEncrypt.svelte";
  import Curve25519PageDecrypt from "./Curve25519PageDecrypt.svelte";
  import Curve25519PageKeys from "./Curve25519PageKeys.svelte";

  const PAGE_TABS = {
    KEYS: "KEYS",
    ENCRYPT: "ENCRYPT",
    DECRYPT: "DECRYPT",
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
  </div>

  {#if pageTab === PAGE_TABS.KEYS}
    <Curve25519PageKeys />
  {:else if pageTab === PAGE_TABS.ENCRYPT}
    <Curve25519PageEncrypt />
  {:else}
    <Curve25519PageDecrypt />
  {/if}
</main>
