<script lang="ts">
    import LoadingPhase1 from "./LoadingPhase1.svelte";
    import LoadingPhase2 from "./LoadingPhase2.svelte";
    import LoadingPhase3 from "./LoadingPhase3.svelte";

    let phase = $state(1);

    setTimeout(() => {
        phase = 2;
    }, 2000); // Duration of phase 1

    setTimeout(() => {
        phase = 3;
    }, 4000); // Duration of phase 1 + phase 2
</script>

<div class="loading-sequence-container">
    {#if phase === 1}
        <LoadingPhase2 />
    {:else if phase === 2}
        <LoadingPhase1 />
    {:else}
        <LoadingPhase3 />
    {/if}
</div>

<style>
    .loading-sequence-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>
