<script lang="ts">
  import { routingStore } from "../stores";


    export let href: undefined|string = undefined;
    export let className: string = "";

    function handleClick(event) {
        event.preventDefault();
        if(!href) return;
        routingStore.setPath(href);
    }
</script>


<a href={href} on:click={handleClick} class={className}><slot/></a>