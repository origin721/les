<script lang="ts">
  interface Props {
    titleText?: string;
  }

  let { titleText = '' }: Props = $props();
</script>


<header data-widget-name="AppHeader" class="pl-3 text-center m-3">
  {titleText}
</header>
<span class="ml-auto mr-auto mb-3 w-[90%] h-1 bg-slate-700 block"></span>
