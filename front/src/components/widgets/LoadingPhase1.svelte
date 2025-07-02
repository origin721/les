<script lang="ts">
    import { theme } from "../../stores/theme";

    let cursorVisible = $state(true);

    $effect(() => {
        const interval = setInterval(() => {
            cursorVisible = !cursorVisible;
        }, 500);

        return () => {
            clearInterval(interval);
        };
    });
</script>

<div class="theme-{$theme} loading-phase">
    <svg class="glitch-svg" viewBox="0 0 300 60">
        <text class="glitch-text" x="50%" y="50%">CONNECTING</text>
        <text class="glitch-layer" x="50%" y="50%">CONNECTING</text>
    </svg>
    <div class="loading-text">
        ESTABLISHING LINK <span class="cursor">{cursorVisible ? "|" : ""}</span>
    </div>
</div>

<style>
    .loading-phase {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        width: 100vw;
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: "Courier New", Courier, monospace;
        overflow: hidden;
        margin: 0;
        padding: 0;
    }
    .glitch-svg {
        width: 100%;
        max-width: 400px;
        height: auto;
        font-size: 2rem;
        text-anchor: middle;
        dominant-baseline: middle;
    }
    .glitch-text {
        fill: var(--primary-color);
        animation: glitch 2s infinite steps(1);
    }
    .glitch-layer {
        fill: var(--secondary-color);
        animation: glitch 2s infinite steps(1);
        animation-delay: 0.2s;
    }
    .loading-text {
        font-size: 1.2rem;
        margin-top: 1rem;
    }
    .cursor {
        color: var(--primary-color);
        animation: blink 1s infinite steps(1);
    }
    @keyframes glitch {
        0% {
            transform: translate(0, 0);
        }
        10% {
            transform: translate(-2px, 2px);
        }
        20% {
            transform: translate(2px, -2px);
        }
        30% {
            transform: translate(0, 0);
        }
    }
    @keyframes blink {
        50% {
            opacity: 0;
        }
    }
</style>
