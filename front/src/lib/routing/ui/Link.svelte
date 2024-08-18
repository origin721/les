<script lang="ts">
  import { routingStore } from "../stores";


    export let href: undefined|string = undefined;

    function handleClick(event) {
        event.preventDefault();
        if(!href) return;
        routingStore.setPath(href);
    }
</script>


<a href={href} on:click={handleClick}><slot/></a>