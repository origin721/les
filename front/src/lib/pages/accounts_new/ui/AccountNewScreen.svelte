<script lang="ts">
  import { writable } from "svelte/store";
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";
  //import { openpgp } from "../../../crypt";
  import { onMount } from "svelte";
  import { routingStore } from "../../../routing/stores";
  import { submit_stop } from "../../../svelte_default";
  import { uuidv4 } from "../../../core/uuid";
  import type { HttpServerParam } from "../../../core/indexdb/accounts/add_accounts";
    import { FieldHttpServers } from "../../../widgets";

  const labelClass = "mt-3 mb-3";
  const inputClass = "text-slate-800 bg-slate-400";

  const fieldLogin = writable('');
  const fieldPass = writable('');
  const defaultHttpParam: HttpServerParam = {
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
      namePub: $fieldLogin,
      pass: $fieldPass,
      httpServers: $fieldHttpServers,
    });

    routingStore.setPath(ROUTES.ACCOUNTS);
    return;

    // TODO: Добавить loading
   //openpgp
   //  .generateKey(authSecret)
   //  .then((secrets) => {
   //    console.log({ secrets });
   //    if (!secrets) return;

   //    // appPassStore.add(secrets);
   //  })
   //  .catch((err) => alert("Err 14211233"));

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
  onsubmit={submit}
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

  <FieldHttpServers fieldHttpServers={fieldHttpServers}/>

  <button
    type="submit"
    class="active:bg-slate-800 border-[0.125rem] border-solid border-white bg-slate-400 p-2 min-w-[6rem] m-7"
    >submit</button
  >
</form>
