<script lang="ts">
  import { routingStore } from "../stores";


  interface Props {
    href?: undefined|string;
    className?: string;
    children?: import('svelte').Snippet;
  }

  let { href = undefined, className = "", children }: Props = $props();

    function handleClick(event) {
        event.preventDefault();
        if(!href) return;
        routingStore.setPath(href);
    }
</script>


<a href={href} onclick={handleClick} class={className}>{@render children?.()}</a>