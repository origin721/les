<script lang="ts">
  import { routingStore } from "../stores";


  interface Props {
    href?: undefined|string;
    className?: string|string[];
    children?: import('svelte').Snippet;
  }

  let { href = undefined, className = "", children }: Props = $props();

    function handleClick(event) {
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
  class={[
    className,
    "text-white"
  ].flat()}
  rel="noopener noreferrer"
  referrerpolicy="no-referrer"
>
  {@render children?.()}
</a>