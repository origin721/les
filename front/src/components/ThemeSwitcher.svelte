<script lang="ts">
    import { theme, toggleTheme } from "../stores/theme";
</script>

<div class="theme-switcher">
    <button on:click={toggleTheme}> Toggle Theme </button>
    <span>Current theme: {$theme}</span>
</div>

<style>
    .theme-switcher {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
    }
</style>
