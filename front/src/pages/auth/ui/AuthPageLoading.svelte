<script lang="ts">
    import { theme } from "../../../stores/theme";
    import loadingStyles from "../../../styles/modules/loading.module.css";
    import "../../../styles/themes.css";

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

<div data-theme={$theme} class={loadingStyles["loading-overlay"]}>
    <div class={loadingStyles["loading-content"]}>
        <svg class={loadingStyles["loading-glitch-svg"]} viewBox="0 0 300 60">
            <text class={loadingStyles["loading-glitch-text"]} x="50%" y="50%">AUTHENTICATING</text>
            <text class={loadingStyles["loading-glitch-layer"]} x="50%" y="50%">AUTHENTICATING</text>
        </svg>
        <div class={loadingStyles["loading-text"]}>
            VERIFYING CREDENTIALS <span class={loadingStyles["loading-cursor"]}>{cursorVisible ? "|" : ""}</span>
        </div>
        <div class={loadingStyles["loading-progress-bar"]}>
            <div class={loadingStyles["loading-progress-fill"]}></div>
        </div>
    </div>
</div>
