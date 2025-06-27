<script lang="ts">
    import { writableToState } from "../../core/svelte_default/runs/writableToState.svelte";
    import { theme as _theme } from "../../stores/theme";

    const themeRoon = writableToState(_theme);

    let isComplete = $state(false);

    $effect(() => {
        const timeout = setTimeout(() => {
            isComplete = true;
        }, 1500);

        return () => {
            clearTimeout(timeout);
        };
    });
</script>

<div class={`theme-${themeRoon.state} loading-phase`}>
    <svg class="glitch-svg" viewBox="0 0 400 100">
        <text
            class="glitch-text"
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle">ACCESS GRANTED</text
        >
    </svg>
    <div class="loading-text">
        {#if isComplete}
            <span class="checkmark">✓</span>
        {:else}
            <span class="spinner"></span>
        {/if}
    </div>
</div>

<style>
    .loading-phase {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: "Courier New", Courier, monospace;
        overflow: hidden;
    }

    .glitch-svg {
        width: 90%;
        max-width: 500px;
        height: auto;
        font-size: 3rem;
        font-weight: bold;
        text-transform: uppercase;
        fill: var(--primary-color);
    }

    .loading-text {
        margin-top: 1rem;
        font-size: 1.5rem;
    }

    .checkmark {
        color: var(--primary-color);
        font-size: 2rem;
        animation: fadeIn 0.5s ease-out;
    }

    .spinner {
        display: inline-block;
        width: 2rem;
        height: 2rem;
        border: 3px solid var(--secondary-color);
        border-top-color: var(--primary-color);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: scale(0.5);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
