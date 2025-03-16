<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import Curve25519PageEncrypt from "./Curve25519PageEncrypt.svelte";

  const PAGE_TABS = {
    ENCRYPT: "ENCRYPT",
    DECRYPT: "DECRYPT",
  };

  let pageTab = $state(PAGE_TABS.ENCRYPT);
</script>

<main class="flex-col flex gap-4">
  <Link href={ROUTES.HOME}>На главную</Link>

  <div class="flex flex-row gap-4">
    <label>
      Защифровать
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

  {#if pageTab === PAGE_TABS.ENCRYPT}
    <Curve25519PageEncrypt />
  {:else}
    TODO
  {/if}
</main>
