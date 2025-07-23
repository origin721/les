<script lang="ts">
  import { theme } from "../../stores/theme";
  import ThemeSwitcher from "../ThemeSwitcher.svelte";
  import { Link, ROUTES } from "../../routing";
  import headerStyles from "../../styles/modules/page-header.module.css";

  interface Props {
    title: string;
    subtitle?: string;
    statusText?: string;
    showBackButton?: boolean;
    backButtonText?: string;
    backButtonHref?: string;
    showThemeSwitcher?: boolean;
  }

  let {
    title,
    subtitle = "",
    statusText = "СИСТЕМА АКТИВНА",
    showBackButton = true,
    backButtonText = "← ГЛАВНАЯ",
    backButtonHref = ROUTES.HOME,
    showThemeSwitcher = true
  }: Props = $props();

  // Разбиваем заголовок на слова для анимации
  const titleWords = title.split('_');
</script>

<header class={headerStyles.header}>
  <div class={headerStyles.animatedTitleContainer}>
    <div class={headerStyles.matrixRain}>
      {#each Array(12) as _, i}
        <div class={headerStyles.matrixColumn} style="animation-delay: {i * 0.15}s;">
          {#each Array(6) as _, j}
            <span class={headerStyles.matrixChar} style="animation-delay: {(i * 0.15) + (j * 0.08)}s;">
              {String.fromCharCode(48 + Math.floor(Math.random() * 10))}
            </span>
          {/each}
        </div>
      {/each}
    </div>
    
    <h1 class={headerStyles.animatedTitle}>
      {#each titleWords as word, index}
        <span class="{headerStyles.titleWord} {headerStyles.glitchWord}" style="animation-delay: {index * 0.4}s;">{word}</span>
        {#if index < titleWords.length - 1}
          <span class={headerStyles.titleSeparator}>_</span>
        {/if}
      {/each}
    </h1>
    
    {#if subtitle}
      <div class={headerStyles.subtitle}>
        <span class={headerStyles.typingText}>{subtitle}</span>
        <span class={headerStyles.cursor}>█</span>
      </div>
    {/if}
    
    <div class={headerStyles.statusIndicator}>
      <span class={headerStyles.statusDot}></span>
      <span class={headerStyles.statusText}>{statusText}</span>
    </div>
  </div>

  <div class={headerStyles.headerControls}>
    {#if showBackButton}
      <Link hash={backButtonHref} className="back-button">
        {backButtonText}
      </Link>
    {/if}
    {#if showThemeSwitcher}
      <div class={headerStyles.themeSwitcherContainer}>
        <ThemeSwitcher />
      </div>
    {/if}
  </div>
</header>

<style>
  :global(.back-button) {
    color: var(--les-accent-secondary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  :global(.back-button:hover) {
    color: var(--les-accent-primary);
    border-color: var(--les-accent-primary);
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
  }
</style>
