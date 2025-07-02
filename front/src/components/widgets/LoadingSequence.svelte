<script lang="ts">
    import { randomByRange } from "../../core";
    import { generateRandomString } from "../../core/random/generateRandomString";
    import { getRandomInRange } from "../../core/random/getRandomInRange";
    import { theme } from "../../stores/theme";
    import LoadingPhase1 from "./LoadingPhase1.svelte";
    import LoadingPhase2 from "./LoadingPhase2.svelte";
    import LoadingPhase3 from "./LoadingPhase3.svelte";
    
    const phase = getRandomInRange(1, 3);
    //let phase = $state(1);

    //$effect(() => {
    //    const phase2Timer = setTimeout(() => {
    //        phase = 2;
    //    }, 2000); // Duration of phase 1

    //    const phase3Timer = setTimeout(() => {
    //        phase = 3;
    //    }, 4000); // Duration of phase 1 + phase 2

    //    return () => {
    //        clearTimeout(phase2Timer);
    //        clearTimeout(phase3Timer);
    //    };
    //});
</script>

<div class="loading-sequence-container" data-theme={$theme}>
    {#if phase === 1}
        <LoadingPhase1 />
    {:else if phase === 2}
        <LoadingPhase2 />
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
