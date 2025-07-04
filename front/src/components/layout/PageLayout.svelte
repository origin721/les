<script lang="ts">
  import { theme } from "../../stores/theme";
  import PageHeader from "./PageHeader.svelte";
  import PageFooter from "./PageFooter.svelte";
  import layoutStyles from "../../styles/modules/page-layout.module.css";
  import { VIEW_VERSION_APP, DEFAULT_STATUS } from "../../constants/VIEW_VERSION_APP";

  interface Props {
    // Header props
    title?: string;
    subtitle?: string;
    statusText?: string;
    showBackButton?: boolean;
    backButtonText?: string;
    backButtonHref?: string;
    showThemeSwitcher?: boolean;
    
    // Footer props
    version?: string;
    status?: string;
    
    // Layout props
    containerClass?: string;
    contentClass?: string;
    children?: any;
  }

  let {
    title,
    subtitle,
    statusText,
    showBackButton = true,
    backButtonText = "← ГЛАВНАЯ",
    backButtonHref = "/",
    showThemeSwitcher = true,
    version = VIEW_VERSION_APP,
    status = DEFAULT_STATUS,
    containerClass = "",
    contentClass = "",
    children
  }: Props = $props();
</script>

<div class="{layoutStyles.pageContainer} {containerClass}" data-theme="{$theme}">
  {#if title}
    <PageHeader 
      {title}
      {subtitle}
      {statusText}
      {showBackButton}
      {backButtonText}
      {backButtonHref}
      {showThemeSwitcher}
    />
  {/if}

  <main class="{layoutStyles.pageContent} {contentClass}">
    {@render children?.()}
  </main>

  <PageFooter {version} {status} />
</div>
