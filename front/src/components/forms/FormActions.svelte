<script lang="ts">
    import { Button } from "../ui";
    import { Link } from "../../routing";

    interface Props {
        primaryText: string;
        primaryLoadingText?: string;
        primaryIcon?: string;
        secondaryText?: string;
        secondaryIcon?: string;
        secondaryHref?: string;
        loading: boolean;
        disabled: boolean;
        onPrimaryClick: () => void;
    }

    let {
        primaryText,
        primaryLoadingText = "ЗАГРУЗКА...",
        primaryIcon = "✓",
        secondaryText,
        secondaryIcon = "⬅️",
        secondaryHref,
        loading,
        disabled,
        onPrimaryClick
    }: Props = $props();
</script>

<div class="form-actions">
    <Button
        variant="primary"
        size="lg"
        onclick={onPrimaryClick}
        disabled={disabled}
        loading={loading}
    >
        {#snippet children()}
            {#if loading}
                <span>{primaryLoadingText}</span>
            {:else}
                <span class="button-icon">{primaryIcon}</span>
                <span>{primaryText}</span>
            {/if}
        {/snippet}
    </Button>

    {#if secondaryText && secondaryHref}
        <Link hash={secondaryHref} className="action-button secondary">
            <span class="button-icon">{secondaryIcon}</span>
            <span>{secondaryText}</span>
        </Link>
    {/if}
</div>

<style>
    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    :global(.action-button.secondary) {
        background: transparent;
        color: var(--secondary-color);
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        transition: all 0.3s ease;
        cursor: pointer;
        text-decoration: none;
        flex: 1;
        justify-content: center;
    }

    :global(.action-button.secondary:hover) {
        border-color: var(--secondary-color);
        box-shadow: 0 0 15px rgba(var(--secondary-color-rgb), 0.3);
    }

    .button-icon {
        font-size: 1.1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .form-actions {
            flex-direction: column;
        }
    }
</style>
