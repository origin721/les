<script lang="ts">
    import { search_params_to_string } from "../../core";
  import { routingStore } from "../stores";


  interface Props {
    href: undefined|string;
    className?: string|string[];
    title?: string;
    children?: import('svelte').Snippet;
    //queryParams?: Record<string, string>;
  }

  let { 
    href, 
    className = "", 
    title, 
    children,
    //queryParams = {},
  }: Props = $props();

    function handleClick(event: MouseEvent) {
        event.preventDefault();
        if(!href) return;
        routingStore.setPath(href);
    }
</script>

<!--
rel="nofollow" для ненадёжных ссылок
и можно другое почитать про параметры
-->
<a
  data-widget-name="Link"
  href={href}
  onclick={handleClick}
  class={className}
  title={title}
  rel="noopener noreferrer"
  referrerpolicy="no-referrer"
>
  {@render children?.()}
</a>
