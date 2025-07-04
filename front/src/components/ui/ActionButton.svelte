<script lang="ts">
    interface Props {
        variant?: 'primary' | 'secondary' | 'danger';
        size?: 'sm' | 'md' | 'lg';
        disabled?: boolean;
        loading?: boolean;
        icon?: string;
        href?: string;
        onclick?: () => void;
        children?: any;
        className?: string;
    }

    let {
        variant = 'primary',
        size = 'md',
        disabled = false,
        loading = false,
        icon,
        href,
        onclick,
        children,
        className = ''
    }: Props = $props();

    const getClasses = () => {
        let classes = ['action-button', `variant-${variant}`, `size-${size}`];
        
        if (disabled) classes.push('disabled');
        if (loading) classes.push('loading');
        if (className) classes.push(className);
        
        return classes.join(' ');
    };
</script>

{#if href}
    <a {href} class={getClasses()}>
        {#if icon}
            <span class="button-icon" class:spinning={loading}>{icon}</span>
        {/if}
        {#if children}
            <span class="button-text">{@render children()}</span>
        {/if}
    </a>
{:else}
    <button class={getClasses()} {disabled} {onclick}>
        {#if icon}
            <span class="button-icon" class:spinning={loading}>{icon}</span>
        {/if}
        {#if children}
            <span class="button-text">{@render children()}</span>
        {/if}
    </button>
{/if}

<style>
    .action-button {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 1rem 2rem;
        background: var(--les-bg-secondary);
        border: 2px solid;
        color: inherit;
        text-decoration: none;
        font-family: "Courier New", Courier, monospace;
        font-weight: bold;
        border-radius: 4px;
        transition: all 0.3s ease;
        cursor: pointer;
        justify-content: center;
    }

    .action-button:hover:not(.disabled) {
        box-shadow: 0 0 20px currentColor;
        transform: translateY(-2px);
    }

    .action-button.disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    /* Size variants */
    .size-sm {
        padding: 0.6rem 1.2rem;
        font-size: 0.9rem;
    }

    .size-sm .button-icon {
        font-size: 1rem;
    }

    .size-md {
        padding: 1rem 2rem;
        font-size: 1rem;
    }

    .size-md .button-icon {
        font-size: 1.2rem;
    }

    .size-lg {
        padding: 1.2rem 2.4rem;
        font-size: 1.1rem;
    }

    .size-lg .button-icon {
        font-size: 1.4rem;
    }

    /* Variant styles */
    .variant-primary {
        border-color: var(--les-accent-primary);
        color: var(--les-accent-primary);
    }

    .variant-primary:hover:not(.disabled) {
        background: var(--les-accent-primary);
        color: var(--les-bg-primary);
    }

    .variant-secondary {
        border-color: var(--les-accent-secondary);
        color: var(--les-accent-secondary);
    }

    .variant-secondary:hover:not(.disabled) {
        background: var(--les-accent-secondary);
        color: var(--les-bg-primary);
    }

    .variant-danger {
        border-color: var(--les-error);
        color: var(--les-error);
    }

    .variant-danger:hover:not(.disabled) {
        background: var(--les-error);
        color: var(--les-bg-primary);
    }

    .button-icon {
        flex-shrink: 0;
    }

    .button-icon.spinning {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .button-text {
        font-weight: bold;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .action-button {
            padding: 0.8rem 1.5rem;
        }
        
        .size-lg {
            padding: 1rem 2rem;
        }
    }
</style>
