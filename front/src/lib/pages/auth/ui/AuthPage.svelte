<script lang="ts">
  import { get, writable } from "svelte/store";
  import { appAuthStore } from "../../../stores";
  import { Link, ROUTES } from "../../../routing";

    const labelClass = 'mt-3 mb-3';
    const inputClass = "text-slate-800 bg-slate-400";

    const pass = writable(null);

    function submit(e) {
        if(!pass) return;
        e.preventDefault()
        appAuthStore.onLogin(get(pass)!);
    }

    // console.log($appAuthStore);
</script>

<form on:submit={submit} class="flex justify-center h-[100%] flex-col items-center" data-widget-name="AuthPage">
    <!-- <label class={labelClass}>
        <span class="block">login</span>
        <input class={inputClass} type="text">
    </label> -->
    <label class={labelClass}>
        <span class="block">pass</span>
        <input bind:value={$pass} class={inputClass} type="password">
    </label>
    
    <button type="submit" class="active:bg-slate-800 border-[0.125rem] border-solid border-white bg-slate-400 p-2 min-w-[6rem] m-7">войти</button>
    <Link href={ROUTES.ACCOUNTS_NEW}>Создать</Link>

</form>