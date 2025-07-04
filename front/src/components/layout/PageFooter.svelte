<script lang="ts">
  import layoutStyles from "../../styles/modules/page-layout.module.css";
  import { VIEW_VERSION_APP, DEFAULT_STATUS } from "../../constants/VIEW_VERSION_APP";

  interface Props {
    version?: string;
    status?: string;
    versionPrefix?: string;
  }

  let { 
    version = VIEW_VERSION_APP, 
    status = DEFAULT_STATUS,
    versionPrefix = "SECURE_TERMINAL_v"
  }: Props = $props();
</script>

<footer class={layoutStyles.pageFooter}>
  <div class={layoutStyles.footerInfo}>
    <span class={layoutStyles.footerVersion}>// {versionPrefix}{version} //</span>
    <span class={layoutStyles.footerStatus}>STATUS: {status}</span>
  </div>
</footer>
