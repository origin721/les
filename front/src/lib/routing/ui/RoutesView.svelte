<script lang="ts">
  import { get } from "svelte/store";
  import {
    AccountNewPage,
    AccountsPage,
    AuthPage,
    HomePage,
    Page404,
    SettingsPage,
    RandomPage,
  } from "../../pages";
  import AesEncrPage from "../../pages/aes-encr-page/ui/AesEncrPage.svelte";
  import { ChatRoomsPage } from "../../pages/chat-rooms";
  import { appAuthStore } from "../../stores";
  import { QUERY_PARAMS, ROUTES } from "../constants";
  import { routingStore } from "../stores";
  import ChatRoomPage from "../../pages/chat-room/ui/ChatRoomPage.svelte";
  import { ChatRoomsAddPage } from "../../pages/chat_rooms_add";
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
{:else if !$appAuthStore.length}
  <AuthPage />
{:else if $routingStore.pathname === ROUTES.RANDOM}
  <RandomPage />
{:else if $routingStore.pathname === ROUTES.AEC_ENCR}
  <AesEncrPage />
{:else if $routingStore.pathname === ROUTES.HOME}
  <HomePage />
  <!-- {:else if $routingStore.pathname === ROUTES.AUTH}
  <AuthPage /> -->
{:else if $routingStore.pathname === ROUTES.SETTINGS}
  <SettingsPage />
{:else if $routingStore.pathname === ROUTES.ACCOUNTS}
  <AccountsPage />
{:else}
  <Page404 />
{/if}
