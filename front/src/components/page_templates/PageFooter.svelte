<script lang="ts">
  import layoutStyles from "../../styles/modules/page-layout.module.css";

  interface Props {
    version: string;
    status: string;
  }

  let { version, status }: Props = $props();
</script>

<footer class={layoutStyles.pageFooter}>
  <div class={layoutStyles.footerInfo}>
    <span class={layoutStyles.footerVersion}>// {version} //</span>
    <span class={layoutStyles.footerStatus}>STATUS: {status}</span>
  </div>
</footer>
