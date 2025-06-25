<script lang="ts">
    import LoadingSpinner3 from "../widgets/LoadingSpinner3.svelte";
</script>

<style>
    .loading-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: var(--background-color);
        z-index: 9999;
    }

    .loading-screen-content {
        text-align: center;
        color: var(--text-color);
    }

    .loading-screen-content h2 {
        font-size: 2rem;
        margin-bottom: 1rem;
        color: var(--primary-color);
    }

    .loading-screen-content p {
        font-size: 1.2rem;
        color: var(--secondary-color);
    }

    @media (max-width: 600px) {
        .loading-screen-content h2 {
            font-size: 1.5rem;
        }
        .loading-screen-content p {
            font-size: 1rem;
        }
    }
</style>

<div class="loading-screen">
    <div class="loading-screen-content">
        <h2>Hold on...</h2>
        <LoadingSpinner3 />
        <p>We're preparing something special for you!</p>
    </div>
</div>
