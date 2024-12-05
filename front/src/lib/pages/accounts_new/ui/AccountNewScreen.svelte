<script>
  import { writable } from "svelte/store";
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";
  import { openpgp } from "../../../crypt";
  import { onMount } from "svelte";
  import { routingStore } from "../../../routing/stores";
    import { submit_stop } from "../../../svelte-default";
    import { uuidv4 } from "../../../core/uuid";

  const labelClass = "mt-3 mb-3";
  const inputClass = "text-slate-800 bg-slate-400";

  const fieldLogin = writable();
  const fieldPass = writable();
  const defaultHttpParam = {
    url: location.protocol + "//" + location.host,
    isActive: true,
    id: uuidv4(),
  };
  const fieldHttpServers = writable([defaultHttpParam]);

  function submit(e) {
    e.preventDefault();
    // console.log($fieldPass, $fieldLogin);
    // const authSecret = {
    //   name: $fieldLogin,
    //   pass: $fieldPass,
    // };
    console.log("subbb", $fieldHttpServers);
    appAuthStore.add({
      login: $fieldLogin,
      pass: $fieldPass,
    });

    routingStore.setPath(ROUTES.ACCOUNTS);
    return;

    // TODO: Добавить loading
    openpgp
      .generateKey(authSecret)
      .then((secrets) => {
        console.log({ secrets });
        if (!secrets) return;

        // appPassStore.add(secrets);
      })
      .catch((err) => alert("Err 14211233"));

    // const un = appPassStore.subscribe((val) => {
    //   console.log({ val });
    // });

    // onMount(() => {
    //   return () => un()
    // });
  }
</script>

<div><Link href={ROUTES.ACCOUNTS}>Назад</Link></div>

<form
  on:submit={submit}
  class="flex justify-center h-[100%] flex-col items-center"
  data-widget-name="AuthPage"
>
  <label class={labelClass}>
    <span class="block">login</span>
    <input bind:value={$fieldLogin} class={inputClass} type="text" />
  </label>
  <label class={labelClass}>
    <span class="block">pass</span>
    <input bind:value={$fieldPass} class={inputClass} type="password" />
  </label>

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
    }}>Добавить</button>
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

  <button
    type="submit"
    class="active:bg-slate-800 border-[0.125rem] border-solid border-white bg-slate-400 p-2 min-w-[6rem] m-7"
    >submit</button
  >
</form>
