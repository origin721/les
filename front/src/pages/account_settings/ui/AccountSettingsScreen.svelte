<script lang="ts">
  import { run } from 'svelte/legacy';

  import { writable } from "svelte/store";
  import { Link, ROUTES } from "../../../routing";
  import { FieldHttpServers } from "../../../widgets";
  import { appAuthStore } from "../../../stores";
  import { routingStore } from "../../../routing/stores";
  import { SEARCH_PARAMS_KEYS } from "../constants/SEARCH_PARAMS_KEYS";
  import { shared_worker_store } from "../../../processes";
  import { PATHS } from "../../../local_back";
    import { onMount } from 'svelte';
    import { accounts } from '../../../api/shared_worker/accounts';

  const fieldHttpServers = writable([]);
  let idParam = $derived($routingStore.queryParams.get(SEARCH_PARAMS_KEYS.ID));

  function submit(e) {
    e.preventDefault();
    if (idParam && $appAuthStore.byId[idParam]) {
      shared_worker_store.fetch({
        path: PATHS.PUT_ACCOUNTS,
        body: {
          list: [
            {
              ...$appAuthStore.byId[idParam],
              httpServers: $fieldHttpServers,
            },
          ],
        },
      });
    }
  }

  let accsById = $state({});

  onMount(() => {
    
    return accounts.subscribeAccById((data) => {
      accsById = data.accounts_by_id;
    });
  });

  run(() => {
    if (idParam && accsById[idParam]) {
      fieldHttpServers.set(accsById[idParam].httpServers || []);
    }
  });
</script>

<div data-widget-name="AccountsScreen">
  <div><Link href={'?#'+ROUTES.ACCOUNTS}>Назад</Link></div>
  <form
    onsubmit={submit}
    class="flex justify-center h-[100%] flex-col items-center"
  >
    <FieldHttpServers {fieldHttpServers} />
    <button class="mt-4" type="submit">Сохранить</button>
  </form>
</div>
