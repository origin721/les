<script lang="ts">
  import { theme } from "../../../stores/theme";
  import { AnimatedTitle, PageFooter, ActionBar } from "../../../components/ui";
  import { search_params_to_string } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
  import { appAuthStore } from "../../../stores";
  import { SEARCH_PARAMS_KEYS as SETTINGS_S_P_KEYS } from "../../account_settings/constants/SEARCH_PARAMS_KEYS";
  import AccountsScreen from "./AccountsScreen.svelte";

  const accountActions = [
    {
      id: 'back',
      title: 'НАЗАД',
      icon: '←',
      href: '#' + ROUTES.HOME,
      variant: 'outline' as const,
      description: 'Вернуться на главную страницу'
    },
    {
      id: 'create',
      title: 'СОЗДАТЬ_АККАУНТ',
      icon: '+',
      href: '#' + ROUTES.ACCOUNTS_NEW,
      variant: 'primary' as const,
      description: 'Создать новый аккаунт в системе'
    },
    {
      id: 'auth',
      title: 'АВТОРИЗИРОВАТЬСЯ',
      icon: '🔐',
      href: '#' + ROUTES.AUTH,
      variant: 'secondary' as const,
      description: 'Войти в существующий аккаунт'
    },
    {
      id: 'delete-selected',
      title: 'УДАЛИТЬ_ВЫБРАННОЕ',
      icon: '🗑️',
      variant: 'danger' as const,
      description: 'Удалить выбранные аккаунты',
      disabled: true,
      onclick: () => {
        // TODO: Implement bulk delete functionality
        console.log('Bulk delete not implemented yet');
      }
    }
  ];
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
    <ActionBar actions={accountActions} />
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
