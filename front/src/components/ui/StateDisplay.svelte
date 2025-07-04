<script lang="ts">
    import { fade } from "svelte/transition";

    interface Props {
        type: 'loading' | 'error' | 'empty';
        title?: string;
        message?: string;
        icon?: string;
        actionText?: string;
        onAction?: () => void;
        overlay?: boolean;
    }

    let {
        type,
        title,
        message,
        icon,
        actionText,
        onAction,
        overlay = false
    }: Props = $props();

    const getDefaultIcon = () => {
        switch (type) {
            case 'loading': return '⧗';
            case 'error': return '⚠';
            case 'empty': return '👥';
            default: return '';
        }
    };

    const getDefaultTitle = () => {
        switch (type) {
            case 'loading': return 'Загрузка...';
            case 'error': return 'Ошибка';
            case 'empty': return 'Список пуст';
            default: return '';
        }
    };

    const getDefaultMessage = () => {
        switch (type) {
            case 'loading': return 'Загрузка данных...';
            case 'error': return 'Произошла ошибка при загрузке данных';
            case 'empty': return 'Нет данных для отображения';
            default: return '';
        }
    };

    const displayIcon = icon || getDefaultIcon();
    const displayTitle = title || getDefaultTitle();
    const displayMessage = message || getDefaultMessage();
</script>

{#if overlay}
    <div class="state-overlay" transition:fade={{duration: 300}}>
        <div class="state-content">
            <div class="state-icon {type}">{displayIcon}</div>
            <span class="state-message">{displayMessage}</span>
        </div>
    </div>
{:else}
    <div class="state-display {type}">
        <div class="state-icon {type}">{displayIcon}</div>
        {#if displayTitle}
            <h3 class="state-title">{displayTitle}</h3>
        {/if}
        {#if displayMessage}
            <p class="state-message">{displayMessage}</p>
        {/if}
        {#if actionText && onAction}
            <button class="state-action" onclick={onAction}>
                {actionText}
            </button>
        {/if}
    </div>
{/if}

<style>
    /* Overlay styles */
    .state-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 1;
        pointer-events: none;
    }

    .state-overlay .state-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: rgba(26, 26, 26, 0.9);
        border: 2px solid var(--les-accent-secondary);
        border-radius: 8px;
        box-shadow: 0 0 40px var(--les-accent-secondary);
        opacity: 0.95;
        backdrop-filter: blur(5px);
        pointer-events: auto;
    }

    .state-overlay .state-message {
        color: var(--les-accent-secondary);
        font-weight: bold;
        margin-top: 1rem;
        text-shadow: 0 0 10px var(--les-accent-secondary);
        font-size: 1rem;
        animation: text-glow 2s ease-in-out infinite alternate;
        font-family: "Courier New", Courier, monospace;
    }

    @keyframes text-glow {
        from {
            text-shadow: 0 0 5px var(--les-accent-secondary);
        }
        to {
            text-shadow: 0 0 15px var(--les-accent-secondary), 0 0 25px var(--les-accent-secondary);
        }
    }

    /* Regular display styles */
    .state-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        border: 1px solid var(--les-border-primary);
        border-radius: 4px;
        background: var(--les-bg-secondary);
        font-family: "Courier New", Courier, monospace;
    }

    .state-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .state-icon.loading {
        animation: spin 1s linear infinite;
        color: var(--les-accent-secondary);
    }

    .state-icon.error {
        color: var(--les-error);
    }

    .state-icon.empty {
        color: var(--les-accent-secondary);
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .state-title {
        color: var(--les-accent-primary);
        margin-bottom: 0.5rem;
        font-size: 1.2rem;
        font-weight: bold;
    }

    .state-message {
        color: var(--les-text-secondary);
        margin-bottom: 1.5rem;
        font-size: 1rem;
    }

    .state-display.error .state-message {
        color: var(--les-error);
    }

    .state-action {
        padding: 0.8rem 1.5rem;
        background: var(--les-accent-primary);
        color: var(--les-bg-primary);
        border: none;
        border-radius: 4px;
        font-weight: bold;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .state-action:hover {
        box-shadow: 0 0 15px var(--les-accent-primary);
        transform: translateY(-2px);
    }

    .state-display.error .state-action {
        background: var(--les-error);
    }

    .state-display.error .state-action:hover {
        box-shadow: 0 0 15px var(--les-error);
    }
</style>
