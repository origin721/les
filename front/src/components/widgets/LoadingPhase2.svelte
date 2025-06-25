<script lang="ts">
    import { theme } from "../../stores/theme";

    let progress = $state(0);

    $effect(() => {
        const interval = setInterval(() => {
            progress += Math.random() * 10;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
            }
        }, 300);

        return () => {
            clearInterval(interval);
        };
    });
</script>

<div class="theme-{$theme} loading-phase">
    <svg class="glitch-svg" viewBox="0 0 400 100">
        <text
            class="glitch-text"
            x="50%"
            y="50%"
            dominant-baseline="middle"
            text-anchor="middle">AUTHENTICATING</text
        >
    </svg>
    <div class="progress-bar-container">
        <div class="progress-bar" style="width: {progress}%"></div>
    </div>
    <div class="loading-text">SECURITY CHECK: {Math.floor(progress)}%</div>
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

    .progress-bar-container {
        width: 80%;
        max-width: 400px;
        height: 10px;
        border: 1px solid var(--border-color);
        background-color: #00000033;
        margin-top: 1rem;
    }

    .progress-bar {
        height: 100%;
        background-color: var(--primary-color);
        transition: width 0.3s ease-out;
        box-shadow: 0 0 10px var(--primary-color);
    }

    .loading-text {
        margin-top: 1rem;
        font-size: 1.2rem;
        text-transform: uppercase;
        letter-spacing: 0.2em;
    }
</style>
