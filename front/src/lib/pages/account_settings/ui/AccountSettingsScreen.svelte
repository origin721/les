<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
    import { routingStore } from "../../../routing/stores";
  import { appAuthStore } from "../../../stores";
    import { SEARCH_PARAMS_KEYS } from "../constants/SEARCH_PARAMS_KEYS";

  $: console.log($appAuthStore);
  $: console.log($routingStore.queryParams.get(SEARCH_PARAMS_KEYS.ID))
</script>

<div data-widget-name="AccountsScreen">
  <div>
    <div><Link href={ROUTES.ACCOUNTS}>Назад</Link></div>
  </div>
</div>
