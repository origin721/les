<script lang="ts">
    import { writable } from "svelte/store";
    import { appAuthStore } from "../../../stores";
    import { Link, ROUTES } from "../../../routing";

    const labelClass = "mt-[1rem] mb-[1rem]";
    const inputClass = "text-slate-800 bg-slate-400";

    const pass = writable(null);

    function submit(e) {
        if (!pass) return;
        e.preventDefault();
        appAuthStore.onLogin($pass!);
    }
    // TODO: Доработать при добавление акаунта инфу что добавлен или ошибка

    // console.log($appAuthStore);
</script>

{#if Object.entries($appAuthStore.byId).length}
    <Link href={ROUTES.ACCOUNTS}>Назад</Link>
{/if}

<form
    onsubmit={submit}
    class="flex justify-center h-[100%] flex-col items-center"
    data-widget-name="AuthPage"
>
    <!-- <label class={labelClass}>
  <span class="block">login</span>
  <input class={inputClass} type="text">
  </label> -->
    <label>
        <span class="block">pass</span>
        <input bind:value={$pass} class={inputClass} type="password" />
    </label>

    <button
        type="submit"
        class="mt-[1rem] active:bg-slate-800 border-[0.125rem] border-solid border-white bg-slate-400 p-2 min-w-[6rem] m-7"
    >
        Войти
    </button>
    <Link className="mt-[1rem]" href={ROUTES.ACCOUNTS_NEW}>Создать</Link>
</form>
