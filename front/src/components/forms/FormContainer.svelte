<script lang="ts">
  interface Props {
    onsubmit?: (e: Event) => void;
    className?: string;
    children?: any;
  }

  let {
    onsubmit,
    className = "",
    children
  }: Props = $props();
</script>

<form 
  {onsubmit}
  class="form-container {className}"
>
  {@render children?.()}
</form>

<style>
  .form-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    width: 100%;
    padding: 2rem;
    box-sizing: border-box;
  }
</style>
