<script lang="ts">
  import { theme } from "../../../stores/theme";
  import { AnimatedTitle, PageFooter } from "../../../components/ui";
  import AccountsScreen from "./AccountsScreen.svelte";
</script>

<div class="accounts-container" data-widget-name="AccountsPage" data-theme="{$theme}">
    <header class="accounts-header">
        <AnimatedTitle 
            title="ACCOUNTS_MANAGEMENT"
            subtitle="СИСТЕМА_УПРАВЛЕНИЯ_АККАУНТАМИ"
            statusText="МОДУЛЬ АКТИВЕН"
            className="accounts-title"
        />
    </header>

    <main class="accounts-content">
        <AccountsScreen />
    </main>

    <PageFooter />
</div>

<style>
    .accounts-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
        width: 100vw;
        background-color: var(--les-bg-primary);
        color: var(--les-text-primary);
        font-family: "Courier New", Courier, monospace;
        overflow-x: hidden;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        border: 2px solid var(--les-border-primary);
        box-shadow: 0 0 25px var(--les-accent-primary) inset;
    }

    .accounts-header {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 2rem;
        border-bottom: 1px solid var(--les-border-primary);
        min-height: 12.5rem;
        position: relative;
        overflow: hidden;
    }

    .accounts-content {
        flex: 1;
        padding: 3rem 2rem;
        background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .accounts-header {
            padding: 1.5rem;
            min-height: 150px;
        }
        
        .accounts-content {
            padding: 2rem 1rem;
        }
    }
</style>
