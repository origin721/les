<script lang="ts">
  import { search_params_to_string } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";
  import { SEARCH_PARAMS_KEYS as SETTINGS_S_P_KEYS } from "../../account_settings/constants/SEARCH_PARAMS_KEYS";

  const checkboxStyle = "w-[1rem] h-[1rem] m-[0.5rem]";
</script>

<div data-widget-name="AccountsScreen">
  <div class="flex-col flex items-start">
    <div><Link href={ROUTES.HOME}>Назад</Link></div>
    <Link href={ROUTES.ACCOUNTS_NEW}>Создать</Link>
    <Link href={ROUTES.AUTH}>Авторизироваться</Link>
    <button class="text-red">Удалить выбранное</button>
  </div>
  <ul>
    {#each Object.values($appAuthStore.byId) as authItem}
      <li class="mt-[3rem] mb-[3rem]">
        <div>{authItem.namePub}</div>
        <button onclick={() => appAuthStore.onDeleteSecret(authItem.id)} class="text-red">удалить</button>
        <Link href={ROUTES.ACCOUNT_SETTINGS+'?'+search_params_to_string({
          [SETTINGS_S_P_KEYS.ID]: authItem.id,
        })}>settings</Link>
      </li>
    {/each}
  </ul>
</div>
