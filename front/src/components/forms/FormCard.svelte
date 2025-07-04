<script lang="ts">
    interface Props {
        icon?: string;
        title: string;
        children?: any;
        className?: string;
    }

    let {
        icon = "📝",
        title,
        children,
        className = ""
    }: Props = $props();
</script>

<div class="form-card {className}">
    <div class="form-card-header">
        <div class="form-card-icon">{icon}</div>
        <h3 class="form-card-title">{title}</h3>
    </div>

    <div class="form-card-content">
        {@render children?.()}
    </div>
</div>

<style>
    .form-card {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 2.5rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
    }

    .form-card-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .form-card-icon {
        font-size: 2.5rem;
        filter: drop-shadow(0 0 10px var(--primary-color));
    }

    .form-card-title {
        color: var(--primary-color);
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
        text-shadow: 0 0 8px var(--primary-color);
    }

    .form-card-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .form-card {
            padding: 2rem;
        }
    }

    @media (max-width: 480px) {
        .form-card {
            padding: 1.5rem;
        }

        .form-card-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
        }

        .form-card-title {
            font-size: 1.3rem;
        }
    }
</style>
