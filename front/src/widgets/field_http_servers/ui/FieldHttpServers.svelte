<script lang="ts">
    import type { Writable } from "svelte/store";
    import { submit_stop } from "../../../core/svelte_default";
    import type { HttpServerParam } from "../../../indexdb/accounts/add_accounts";
    import { uuidv4 } from "../../../core/uuid";

  interface Props {
    fieldHttpServers: Writable<HttpServerParam[]>;
  }

  let { fieldHttpServers }: Props = $props();

</script>


<div class="flex flex-col">
  <button onclick={(e) => {
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
        oninput={(e) => {
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
    <button onclick={(e) => {
      submit_stop(e);
      
        fieldHttpServers.update(prev => {
            return [
              ...prev.slice(0, index),
              ...prev.slice(index+1),
            ];
        })
    }}>delete</button>
    <label>активность <input checked={httpParam.isActive}
      onclick={(e) => {
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