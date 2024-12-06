<script lang="ts">
    import type { Writable } from "svelte/store";
    import { submit_stop } from "../../../svelte-default";
    import type { HttpServerParam } from "../../../core/indexdb/accounts/add_accounts";
    import { uuidv4 } from "../../../core/uuid";

    export let fieldHttpServers: Writable<HttpServerParam[]>;

</script>


<div class="flex flex-col">
  <button on:click={(e) => {
    submit_stop(e);
    
    fieldHttpServers.update((prev) => {
      return [
        {
          url: '',
          id: uuidv4(),
          isActive: true,
        },
        ...prev,
      ];
    });
  }}>Добавить http server</button>
  {#each $fieldHttpServers as httpParam, index (httpParam.id)}
    <hr class="m-4"/>
    <label class="flex-col flex">
      <input
        value={httpParam.url}
        on:input={(e) => {
          fieldHttpServers.update((prev) => {
            return [
              ...prev.slice(0, index),
              {
                ...httpParam,
                url: e.currentTarget.value
              },
              ...prev.slice(index+1),
            ];

          });
        }}
      />
    </label>
    <button on:click={(e) => {
      submit_stop(e);
      
        fieldHttpServers.update(prev => {
            return [
              ...prev.slice(0, index),
              ...prev.slice(index+1),
            ];
        })
    }}>delete</button>
    <label>активность <input checked={httpParam.isActive}
      on:click={(e) => {
        fieldHttpServers.update(prev => {
            return [
              ...prev.slice(0, index),
              {
                ...httpParam,
                isActive: e.currentTarget.checked,
              },
              ...prev.slice(index+1),
            ];
        })
    }} type="checkbox" /></label>
  {/each}
</div>