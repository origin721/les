<script lang="ts">
    interface Props {
        message: string;
        type: 'success' | 'error' | '';
    }

    let {
        message,
        type
    }: Props = $props();
</script>

{#if message && type}
    <div class="form-message form-message-{type}">
        <span class="message-icon">
            {type === 'success' ? '✅' : '❌'}
        </span>
        <span class="message-text">{message}</span>
    </div>
{/if}

<style>
    .form-message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .form-message-success {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
    }

    .form-message-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }

    .message-icon {
        font-size: 1.1rem;
    }
</style>
