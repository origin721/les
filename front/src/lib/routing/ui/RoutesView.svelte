<script lang="ts">
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
  import { ROUTES } from "../constants";
  import { routingStore } from "../stores";
  // console.log({aaa: $appAuthStore})
</script>

{#if $routingStore.pathname === ROUTES.ACCOUNTS_NEW}
  <AccountNewPage />
{:else if $routingStore.pathname === ROUTES.CHAT_ROOMS}
  <ChatRoomsPage/>
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
