<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import ApiKeysPageGenerate from "./ApiKeysPageGenerate.svelte";
  import ApiKeysPageView from "./ApiKeysPageView.svelte";
  import ApiKeysPageAddPartner from "./ApiKeysPageAddPartner.svelte";

  const PAGE_TABS = {
    GENERATE: "GENERATE",
    VIEW: "VIEW", 
    ADD_PARTNER: "ADD_PARTNER",
  };

  let pageTab = $state(PAGE_TABS.GENERATE);
</script>

<main class="flex-col flex gap-4">
  <Link href={ROUTES.HOME}>На главную</Link>

  <div class="flex flex-row gap-4 flex-wrap">
    <label class="flex items-center gap-2">
      Создать ключ
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.GENERATE}
      />
    </label>

    <label class="flex items-center gap-2">
      Мои ключи
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.VIEW}
      />
    </label>

    <label class="flex items-center gap-2">
      Добавить ключ собеседника
      <input
        type="radio"
        bind:group={pageTab}
        name="page-tab"
        value={PAGE_TABS.ADD_PARTNER}
      />
    </label>
  </div>

  {#if pageTab === PAGE_TABS.GENERATE}
    <ApiKeysPageGenerate />
  {:else if pageTab === PAGE_TABS.VIEW}
    <ApiKeysPageView />
  {:else if pageTab === PAGE_TABS.ADD_PARTNER}
    <ApiKeysPageAddPartner />
  {/if}
</main>
