<script lang="ts">
    import { ROUTES } from "../../../routing";
    import { theme } from "../../../stores/theme";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { AnimatedTitle, MenuGrid, PageFooter } from "../../../components/ui";

    const menuItems = [
        { href: ROUTES.ACCOUNTS, title: "АККАУНТЫ", icon: "👤", description: "Управление пользователями" },
        { href: ROUTES.FRIENDS, title: "ДРУЗЬЯ", icon: "👥", description: "Список друзей и контактов" },
        { href: ROUTES.CRYPTO, title: "ШИФРОВАНИЕ", icon: "🔐", description: "Криптографические операции" },
        { href: ROUTES.API_KEYS, title: "API КЛЮЧИ", icon: "🔑", description: "Управление ключами доступа" },
        { href: ROUTES.CHAT_ROOMS, title: "ЧАТЫ", icon: "💬", description: "Безопасные сообщения" },
        { href: ROUTES.ADD_PEER, title: "ДОБАВИТЬ ПИРА", icon: "🤝", description: "Подключение к P2P сети" },
        { href: ROUTES.RANDOM, title: "РАНДОМ", icon: "🎲", description: "Генерация случайных данных" },
        { href: ROUTES.SETTINGS, title: "НАСТРОЙКИ", icon: "⚙️", description: "Конфигурация системы" },
        { href: ROUTES.DOCS, title: "ДОКУМЕНТАЦИЯ", icon: "📋", description: "Техническая информация" },
        { href: ROUTES.NOT_FOUND, title: "404 СТРАНИЦА", icon: "⚠️", description: "Демо ошибки не найдено" }
    ];
</script>

<div class="home-container" data-widget-name="HomePage" data-theme="{$theme}">
    <header class="home-header">
        <AnimatedTitle 
            title="SECURE_MESSAGE_SYSTEM"
            subtitle="ГЛАВНОЕ_МЕНЮ_СИСТЕМЫ_БЕЗОПАСНОСТИ"
            statusText="СИСТЕМА АКТИВНА"
            className="home-title"
        />

        <div class="theme-switcher-container">
            <ThemeSwitcher />
        </div>
    </header>

    <main class="home-content">
        <MenuGrid items={menuItems} />
    </main>

    <PageFooter />
</div>

<style>
    .home-container {
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

    .home-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 2rem;
        border-bottom: 1px solid var(--les-border-primary);
        min-height: 12.5rem;
        position: relative;
        overflow: hidden;
    }

    .theme-switcher-container {
        z-index: 10;
    }

    .home-content {
        flex: 1;
        padding: 3rem 2rem;
        background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    }

    /* Responsive */
    @media (max-width: 768px) {
        .home-header {
            padding: 1.5rem;
            min-height: 150px;
        }
        
        .home-content {
            padding: 2rem 1rem;
        }
    }
</style>
