<script lang="ts">
    interface InfoItem {
        icon: string;
        text: string;
    }

    interface Props {
        items: InfoItem[];
    }

    let { items }: Props = $props();
</script>

<div class="form-info">
    {#each items as item}
        <div class="info-item">
            <span class="info-icon">{item.icon}</span>
            <span class="info-text">{item.text}</span>
        </div>
    {/each}
</div>

<style>
    .form-info {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .info-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--secondary-color);
        line-height: 1.4;
    }

    .info-icon {
        font-size: 1rem;
        margin-top: 0.1rem;
    }
</style>
