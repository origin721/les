<script lang="ts">
    import {
        //AccountNewPage,
        AccountsPage,
        //AuthPage,
        //HomePage,
        //Page404,
        SettingsPage,
        //RandomPage,
        //Curve25519Page,
    } from "../../pages";
    import AesEncrPage from "../../pages/aes_encr_page/ui/AesEncrPage.svelte";
    //import { ChatRoomsPage } from "../../pages/chat_rooms";
    import { appAuthStore } from "../../stores";
    import { QUERY_PARAMS, ROUTES } from "../constants";
    import { routingStore } from "../stores";
    //import ChatRoomPage from "../../pages/chat_room/ui/ChatRoomPage.svelte";
    //import { ChatRoomsAddPage } from "../../pages/chat_rooms_add";
    import AccountSettingsPage from "../../pages/account_settings/ui/AccountSettingsPage.svelte";
    //import { AddFriendPage } from "../../pages/add_friend_page";
    import { writableToState } from "../../core/svelte_default/runs/writableToState.svelte";
    import { tick } from "svelte";
    import LoadingSpinner1 from "../../components/widgets/LoadingSpinner1.svelte";
    import LoadingSpinner2 from "../../components/widgets/LoadingSpinner2.svelte";
    //import HomePage from "../../pages/home/ui/HomePage.svelte";
    //import RandomPage from "../../pages/random/ui/RandomPage.svelte";
    //import AddFriendPage from "../../pages/add_friend_page/ui/AddFriendPage.svelte";
    //import Curve25519Page from "../../pages/curve25519_page/ui/Curve25519Page.svelte";
    //import AuthPage from "../../pages/auth/ui/AuthPage.svelte";
    //import ChatRoomsAddPage from "../../pages/chat_rooms_add/ui/ChatRoomsAddPage.svelte";
    //import ChatRoomsPage from "../../pages/chat_rooms/ui/ChatRoomsPage.svelte";
    //import ChatRoomPage from "../../pages/chat_room/ui/ChatRoomPage.svelte";
    //import AccountNewPage from "../../pages/accounts_new/ui/AccountNewPage.svelte";
    //import Page404 from "../../pages/404/ui/Page404.svelte";
    // console.log({aaa: $appAuthStore})
    // console.log('queryParams test: ', $routingStore.queryParams.get("aaa"));

    const routState = writableToState(routingStore);

    const appAuthState = writableToState(appAuthStore);

    $effect(() => {
        //console.log({routState}, routState.state);
        onChangePath({
            rState: routState.state,
            apauState: appAuthState.state,
        });
    });

    let componentPromise = $state<any>(null);

    async function onChangePath(p: {
        rState: (typeof routState)["state"];
        apauState: (typeof appAuthState)["state"];
    }) {
        componentPromise = null;
        //type = null;
        await tick(); // подождать 1 кадр, чтобы отрендерилось "ничего"

        await new Promise((r) => setTimeout(r, 1000)); // ещё 1 секунда

        //type = typeName;

        // TODO: сделать защиту от рендера если  данные не менялись сохранив prev в ссылку
        if (p.rState.pathname === ROUTES.ACCOUNTS_NEW) {
            componentPromise = import(
                `../../pages/accounts_new/ui/AccountNewPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.CHAT_ROOMS) {
            if (p.rState.queryParams.get(QUERY_PARAMS.ROOM_ID)) {
                componentPromise = import(
                    `../../pages/chat_room/ui/ChatRoomPage.svelte`
                );
            } else {
                componentPromise = import(
                    `../../pages/chat_rooms/ui/ChatRoomsPage.svelte`
                );
            }
        } else if (p.rState.pathname === ROUTES.CHAT_ROOMS_ADD) {
            // TODO: проверить что до логина не все страницы могут быть
            componentPromise = import(
                `../../pages/chat_rooms_add/ui/ChatRoomsAddPage.svelte`
            );
        } else if (!Object.entries(p.apauState.byId).length) {
            componentPromise = import(`../../pages/auth/ui/AuthPage.svelte`);
        } else if (p.rState.pathname === ROUTES.AUTH) {
            componentPromise = import(`../../pages/auth/ui/AuthPage.svelte`);
        } else if (p.rState.pathname === ROUTES.CURVE_25519) {
            componentPromise = import(
                `../../pages/curve25519_page/ui/Curve25519Page.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ADD_FRIEND) {
            componentPromise = import(
                `../../pages/add_friend_page/ui/AddFriendPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.RANDOM) {
            componentPromise = import(
                `../../pages/random/ui/RandomPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.HOME) {
            componentPromise = import(`../../pages/home/ui/HomePage.svelte`);
        } else if (p.rState.pathname === ROUTES.SETTINGS) {
            componentPromise = import(
                `../../pages/settings/ui/SettingsPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ACCOUNTS) {
            componentPromise = import(
                `../../pages/accounts/ui/AccountsPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ACCOUNT_SETTINGS) {
            componentPromise = import(
                `../../pages/account_settings/ui/AccountSettingsPage.svelte`
            );
        } else {
            componentPromise = import(`../../pages/404/ui/Page404.svelte`);
        }
        //if (type === 'one') {
        //} else if (type === 'two') {
        //  //componentPromise = import(`./TwoComponent.svelte`);
        //}
    }
</script>

{#if componentPromise}
    {#await componentPromise then mod}
        <svelte:component this={mod.default} />
    {/await}
{:else}
    <LoadingSpinner1 />
    <LoadingSpinner2 />
    <!--
    <div>loading... TODO: сделать анимацию классную</div>
     -->
{/if}

<!--
{#if routState.state.pathname === ROUTES.ACCOUNTS_NEW}
    <AccountNewPage />
{:else if routState.state.pathname === ROUTES.CHAT_ROOMS}
    {#if routState.state.queryParams.get(QUERY_PARAMS.ROOM_ID)}
        <ChatRoomPage />
    {:else}
        <ChatRoomsPage />
    {/if}
{:else if routState.state.pathname === ROUTES.CHAT_ROOMS_ADD}
    <ChatRoomsAddPage />
{:else if !Object.entries($appAuthStore.byId).length}
    <AuthPage />
{:else if routState.state.pathname === ROUTES.AUTH}
    <AuthPage />
{:else if routState.state.pathname === ROUTES.CURVE_25519}
    <Curve25519Page />
{:else if routState.state.pathname === ROUTES.ADD_FRIEND}
    <AddFriendPage />
{:else if routState.state.pathname === ROUTES.RANDOM}
    <RandomPage />
{:else if routState.state.pathname === ROUTES.HOME}
    <HomePage />
{:else if routState.state.pathname === ROUTES.SETTINGS}
    <SettingsPage />
{:else if routState.state.pathname === ROUTES.ACCOUNTS}
    <AccountsPage />
{:else if routState.state.pathname === ROUTES.ACCOUNT_SETTINGS}
    <AccountSettingsPage />
{:else}
    <Page404 />
{/if}
-->
