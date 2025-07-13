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
    import LoadingSequence from "../../components/widgets/LoadingSequence.svelte";

    import "../../styles/cyberpunk.css";
    import "../../styles/pixel.css";
    import { lang_store } from "../../stores/lang_store/lang_store.svelte";

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
            lang: lang_store.state,
        });
    });

    let componentPromise = $state<any>(null);
    let prevRoutParams = $state<{
        rState: (typeof routState)["state"];
        apauState: (typeof appAuthState)["state"];
        lang: (typeof lang_store)["state"];
    } | null>(null);

    async function onChangePath(p: NonNullable<typeof prevRoutParams>) {
        // TODO: сделать защиту от рендера если  данные не менялись сохранив prev в ссылку
        if (
            prevRoutParams &&
            p.rState.pathname === prevRoutParams.rState.pathname &&
            Object.keys(p.apauState.byId).length ===
                Object.keys(prevRoutParams.apauState.byId).length &&
            p.rState.queryParams.toString() ===
                prevRoutParams.rState.queryParams.toString()
                && p.lang === prevRoutParams.lang
        ) {
            return;
        }

        prevRoutParams = p;

        componentPromise = null;
        //type = null;
        await tick(); // подождать 1 кадр, чтобы отрендерилось "ничего"

        let nextComponentPromise = null;
        await new Promise((r) => setTimeout(r, 500));


        if(!p.lang) {
            nextComponentPromise = import(
                `../../pages/select_language/ui/SelectLanguage.svelte`
            );
        }
        else if (p.rState.pathname === ROUTES.ACCOUNTS_NEW) {
            nextComponentPromise = import(
                `../../pages/accounts_new/ui/AccountNewPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.SETTINGS) {
            nextComponentPromise = import(
                `../../pages/settings/ui/SettingsPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.DOCS) {
            nextComponentPromise = import(
                `../../pages/docs/ui/DocsPage.svelte`
            );
        } else if (!Object.entries(p.apauState.byId).length) {
            nextComponentPromise = import(
                `../../pages/auth/ui/AuthPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.AUTH) {
            nextComponentPromise = import(
                `../../pages/auth/ui/AuthPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.CHAT_ROOMS) {
            if (p.rState.queryParams.get(QUERY_PARAMS.ROOM_ID)) {
                // Check if settings page is requested
                if (p.rState.pathname.includes("/settings")) {
                    nextComponentPromise = import(
                        `../../pages/chat_room/ui/ChatSettingsPage.svelte`
                    );
                } else {
                    nextComponentPromise = import(
                        `../../pages/chat_room/ui/ChatRoomsPage.svelte`
                    );
                }
            } else {
                // Use our new ChatRoomsPage
                nextComponentPromise = import(
                    `../../pages/chat_room/ui/ChatRoomsPage.svelte`
                );
            }
        } else if (p.rState.pathname === ROUTES.CHAT_ROOMS_ADD) {
            // TODO: проверить что до логина не все страницы могут быть
            nextComponentPromise = import(
                `../../pages/chat_rooms_add/ui/ChatRoomsAddPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.CRYPTO) {
            nextComponentPromise = import(
                `../../pages/crypto_page/ui/CryptoPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.API_KEYS) {
            nextComponentPromise = import(
                `../../pages/api_keys_page/ui/ApiKeysPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ADD_FRIEND) {
            nextComponentPromise = import(
                `../../pages/add_friend_page/ui/AddFriendByName.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ADD_PEER) {
            nextComponentPromise = import(
                `../../pages/add_peer_page/ui/AddPeerPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.RANDOM) {
            nextComponentPromise = import(
                `../../pages/random/ui/RandomPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.HOME) {
            nextComponentPromise = import(
                `../../pages/home/ui/HomePage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ACCOUNTS) {
            nextComponentPromise = import(
                `../../pages/accounts/ui/AccountsPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.ACCOUNT_SETTINGS) {
            nextComponentPromise = import(
                `../../pages/account_settings/ui/AccountSettingsPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.FRIENDS) {
            nextComponentPromise = import(
                `../../pages/friends/ui/FriendsPage.svelte`
            );
        } else if (p.rState.pathname === ROUTES.NOT_FOUND) {
            nextComponentPromise = import(`../../pages/404/ui/Page404.svelte`);
        } else {
            nextComponentPromise = import(`../../pages/404/ui/Page404.svelte`);
        }
        //if (type === 'one') {
        //} else if (type === 'two') {
        //  //componentPromise = import(`./TwoComponent.svelte`);
        //}

        await new Promise((r) => setTimeout(r, 500));

        componentPromise = nextComponentPromise;
    }
</script>

{#if componentPromise}
    {#await componentPromise then mod}
        {@const Component = mod.default}
        <Component />
    {/await}
{:else}
    <LoadingSequence />
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
{:else if routState.state.pathname === ROUTES.CRYPTO}
    <CryptoPage />
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
