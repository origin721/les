<script lang="ts">
  import {
    AccountNewPage,
    AccountsPage,
    AuthPage,
    HomePage,
    Page404,
    SettingsPage,
    RandomPage,
    Curve25519Page,
  } from "../../pages";
  import AesEncrPage from "../../pages/aes_encr_page/ui/AesEncrPage.svelte";
  import { ChatRoomsPage } from "../../pages/chat_rooms";
  import { appAuthStore } from "../../stores";
  import { QUERY_PARAMS, ROUTES } from "../constants";
  import { routingStore } from "../stores";
  import ChatRoomPage from "../../pages/chat_room/ui/ChatRoomPage.svelte";
  import { ChatRoomsAddPage } from "../../pages/chat_rooms_add";
    import AccountSettingsPage from "../../pages/account_settings/ui/AccountSettingsPage.svelte";
  // console.log({aaa: $appAuthStore})
  // console.log('queryParams test: ', $routingStore.queryParams.get("aaa"));
</script>

{#if $routingStore.pathname === ROUTES.ACCOUNTS_NEW}
  <AccountNewPage />
{:else if $routingStore.pathname === ROUTES.CHAT_ROOMS}
  {#if $routingStore.queryParams.get(QUERY_PARAMS.ROOM_ID)}
    <ChatRoomPage />
  {:else}
    <ChatRoomsPage />
  {/if}
{:else if $routingStore.pathname === ROUTES.CHAT_ROOMS_ADD}
  <ChatRoomsAddPage/>
{:else if !Object.entries($appAuthStore.byId).length}
  <AuthPage />
{:else if $routingStore.pathname === ROUTES.AUTH}
  <AuthPage />
{:else if $routingStore.pathname === ROUTES.CURVE_25519}
  <Curve25519Page/>
{:else if $routingStore.pathname === ROUTES.RANDOM}
  <RandomPage />
{:else if $routingStore.pathname === ROUTES.HOME}
  <HomePage />
{:else if $routingStore.pathname === ROUTES.SETTINGS}
  <SettingsPage />
{:else if $routingStore.pathname === ROUTES.ACCOUNTS}
  <AccountsPage />
{:else if $routingStore.pathname === ROUTES.ACCOUNT_SETTINGS}
  <AccountSettingsPage/>
{:else}
  <Page404 />
{/if}
