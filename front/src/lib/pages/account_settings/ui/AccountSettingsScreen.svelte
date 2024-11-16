<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";

  $: console.log($appAuthStore);
</script>

<div data-widget-name="AccountsScreen">
  <div>
    <div><Link href={ROUTES.ACCOUNTS}>Назад</Link></div>
  </div>
</div>
