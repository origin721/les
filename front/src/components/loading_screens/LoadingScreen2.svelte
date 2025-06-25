<script lang="ts">
    import LoadingSpinner2 from "../widgets/LoadingSpinner2.svelte";
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
    }

    @media (max-width: 600px) {
        .loading-screen-content h2 {
            font-size: 1.5rem;
        }
    }
</style>

<div class="loading-screen">
    <div class="loading-screen-content">
        <h2>Loading...</h2>
        <LoadingSpinner2 />
    </div>
</div>
```
</content>
