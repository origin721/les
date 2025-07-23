<script lang="ts">
    import { search_params_to_string } from "../../core";
  import { routingStore } from "../stores";


  interface Props {
    hash: undefined|string;
    className?: string|string[];
    title?: string;
    children?: import('svelte').Snippet;
    queryParams?: Record<string, string>;
  }

  let { 
    hash = undefined, 
    className = "", 
    title, 
    children,
    queryParams = {},
  }: Props = $props();

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        if(!hash) return;
        routingStore.setRoute({hash: hash, queryParams});
    }
</script>

<!--
rel="nofollow" для ненадёжных ссылок
и можно другое почитать про параметры
-->
<a
  data-widget-name="Link"
  href={location.origin + location.pathname + search_params_to_string(queryParams) + (
    hash && hash[0] === '#'
    ? hash
    : '#' + hash
  )}
  onclick={handleClick}
  class={className}
  title={title}
  rel="noopener noreferrer"
  referrerpolicy="no-referrer"
>
  {@render children?.()}
</a>
