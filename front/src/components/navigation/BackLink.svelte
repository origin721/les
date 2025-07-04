<script lang="ts">
  import { Link, ROUTES } from "../../routing";

  interface Props {
    href?: string;
    text?: string;
    className?: string;
  }

  let {
    href = ROUTES.HOME,
    text = "Назад",
    className = ""
  }: Props = $props();
</script>

<div class="back-link-container {className}">
  <Link {href}>{text}</Link>
</div>

<style>
  .back-link-container {
    padding: 1rem;
    align-self: flex-start;
  }
</style>
