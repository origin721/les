<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";

  const checkboxStyle = "w-[1rem] h-[1rem] m-[0.5rem]";
  
</script>

<div data-widget-name="AccountsScreen">
  <div>
    <div><Link href={ROUTES.HOME}>Назад</Link></div>
    <Link href={ROUTES.ACCOUNTS_NEW}>добавить</Link>
    <button class="text-red">Удалить выбранное</button>
  </div>
  <ul>
    {#each $appAuthStore as authItem}
      <li class="mt-[3rem] mb-[3rem]">
        <div>{authItem.decr.login}</div>
        <button on:click={() => appAuthStore.onDeleteSecret(authItem.origin)} class="text-red">удалить</button>
        <Link href={ROUTES.ACCOUNT_SETTINGS}>settings</Link>
      </li>
    {/each}
  </ul>
</div>
