<script lang="ts">
  import { theme } from "../../stores/theme";
  import ThemeSwitcher from "../ThemeSwitcher.svelte";
  import { Link, ROUTES } from "../../routing";
    import { VIEW_VERSION_APP } from "../../constants";
  

  interface Props {
    title: string;
    subtitle?: string;
    showBackLink?: boolean;
    backLinkHref?: string;
    backLinkText?: string;
    showThemeSwitcher?: boolean;
    footerVersion?: string;
    footerStatus?: string;
    pageName?: string;
    children: any;
  }

  let {
    title,
    subtitle = "",
    showBackLink = true,
    backLinkHref = '#'+ROUTES.HOME,
    backLinkText = "ГЛАВНАЯ",
    showThemeSwitcher = true,
    footerVersion = `// SECURE_MESSAGE_${VIEW_VERSION_APP} //`,
    footerStatus = "STATUS: OPERATIONAL",
    pageName = "BasePage",
    children
  }: Props = $props();
</script>

<div class="base-container" data-widget-name={pageName}>
    <header class="base-header">
      {#if showBackLink}
        <div class="back-link-container">
          <Link href={backLinkHref} className="back-link">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>{backLinkText}</span>
          </Link>
        </div>
      {/if}
      
      <div class="animated-title-container">
        <div class="matrix-rain">
          {#each Array(15) as _, i}
            <div class="matrix-column" style="animation-delay: {i * 0.14}s;">
              {#each Array(10) as _, j}
                <span class="matrix-char" style="animation-delay: {(i * 0.14) + (j * 0.07)}s;">
                  {Math.random() > 0.5 ? String.fromCharCode(48 + Math.floor(Math.random() * 10)) : String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                </span>
              {/each}
            </div>
          {/each}
        </div>
        
        <h1 class="animated-title">
          {#each title.split('_') as word, i}
            <span class="title-word glitch-word" style="animation-delay: {i * 0.3}s;">{word}</span>
            {#if i < title.split('_').length - 1}
              <span class="title-separator">_</span>
            {/if}
          {/each}
        </h1>
        
        {#if subtitle}
          <div class="subtitle">
            <span class="typing-text">{subtitle}</span>
            <span class="cursor">█</span>
          </div>
        {/if}
      </div>

      {#if showThemeSwitcher}
        <div class="theme-switcher-container">
          <ThemeSwitcher />
        </div>
      {/if}
    </header>

    <main class="base-content">
      {@render children()}
    </main>

    <footer class="base-footer">
      <div class="footer-info">
        <span class="footer-version">{footerVersion}</span>
        <span class="footer-status">{footerStatus}</span>
      </div>
    </footer>
</div>

<style>

  .base-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    background-color: var(--les-bg-primary);
    color: var(--les-text-primary);
    font-family: "Courier New", Courier, monospace;
    overflow-x: hidden;
    border: 2px solid var(--les-border-primary);
    box-shadow: 0 0 25px var(--les-accent-primary) inset;
  }

  /* Header */
  .base-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--les-border-primary);
    min-height: 160px;
    position: relative;
    overflow: hidden;
  }

  .back-link-container {
    z-index: 10;
  }

  :global(.back-link) {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--les-accent-secondary);
    text-decoration: none;
    transition: all 0.2s;
    padding: 0.5rem 1rem;
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
  }
  
  :global(.back-link:hover) {
    color: var(--les-accent-primary);
    text-shadow: 0 0 5px var(--les-accent-primary);
    border-color: var(--les-accent-primary);
    box-shadow: 0 0 10px var(--les-accent-primary);
  }

  /* Animated Title */
  .animated-title-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 5;
  }

  .matrix-rain {
    position: absolute;
    top: -50px;
    left: -120px;
    right: -120px;
    bottom: -50px;
    overflow: hidden;
    opacity: 0.08;
    z-index: 1;
  }

  .matrix-column {
    position: absolute;
    top: 0;
    width: 18px;
    height: 100%;
    animation: matrix-fall 3.5s linear infinite;
  }

  .matrix-column:nth-child(odd) {
    left: calc(var(--i, 0) * 6.67%);
  }

  .matrix-column:nth-child(even) {
    left: calc(var(--i, 0) * 6.67% + 3.33%);
  }

  .matrix-char {
    display: block;
    color: var(--les-accent-primary);
    font-size: 12px;
    line-height: 1.3;
    animation: matrix-glow 2.5s ease-in-out infinite alternate;
  }

  @keyframes matrix-fall {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes matrix-glow {
    0% { opacity: 0.3; }
    100% { opacity: 1; }
  }

  .animated-title {
    font-size: 3rem;
    font-weight: bold;
    margin: 0;
    position: relative;
    z-index: 2;
  }

  .title-word {
    display: inline-block;
    color: var(--les-accent-primary);
    text-shadow: 
      0 0 5px var(--les-accent-primary),
      0 0 10px var(--les-accent-primary),
      0 0 15px var(--les-accent-primary);
  }

  .glitch-word {
    animation: glitch-effect 3.5s ease-in-out infinite;
    position: relative;
  }

  .title-separator {
    color: var(--les-accent-secondary);
    animation: separator-pulse 1.8s ease-in-out infinite;
  }

  @keyframes glitch-effect {
    0%, 92%, 100% { 
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
    2% { 
      transform: translate(-1px, 1px);
      filter: hue-rotate(90deg);
    }
    4% { 
      transform: translate(1px, -1px);
      filter: hue-rotate(180deg);
    }
    6% { 
      transform: translate(-1px, -1px);
      filter: hue-rotate(270deg);
    }
    8% { 
      transform: translate(1px, 1px);
      filter: hue-rotate(360deg);
    }
    10% { 
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
  }

  @keyframes separator-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .subtitle {
    margin-top: 1rem;
    font-size: 1rem;
    color: var(--les-accent-secondary);
  }

  .typing-text {
    animation: typing 4.5s steps(35) infinite;
    border-right: 2px solid var(--les-accent-primary);
  }

  .cursor {
    animation: cursor-blink 1s infinite;
    color: var(--les-accent-primary);
  }

  @keyframes typing {
    0%, 45% { width: 0; }
    85%, 100% { width: 100%; }
  }

  @keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .theme-switcher-container {
    z-index: 10;
  }

  /* Content */
  .base-content {
    flex: 1;
    padding: 2rem;
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    overflow-y: auto;
  }

  /* Footer */
  .base-footer {
    padding: 1rem 2rem;
    border-top: 1px solid var(--les-border-primary);
    background: rgba(0, 0, 0, 0.3);
  }

  .footer-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
    font-size: 0.8rem;
  }

  .footer-version {
    color: var(--les-accent-secondary);
  }

  .footer-status {
    color: var(--les-accent-primary);
    animation: status-pulse 2.5s ease-in-out infinite;
  }

  @keyframes status-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .animated-title {
      font-size: 2.2rem;
    }
    
    .base-header {
      padding: 1rem;
      min-height: 120px;
    }
    
    .base-content {
      padding: 1.5rem 1rem;
    }
    
    .footer-info {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .animated-title {
      font-size: 1.8rem;
    }
    
    .subtitle {
      font-size: 0.8rem;
    }
  }
</style>
