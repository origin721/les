<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import { theme } from "../../../stores/theme";
  import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
  import CryptoPageEncrypt from "./CryptoPageEncrypt.svelte";
  import CryptoPageDecrypt from "./CryptoPageDecrypt.svelte";
  import CryptoPageKeys from "./CryptoPageKeys.svelte";
  import CryptoPageSign from "./CryptoPageSign.svelte";
    import { VIEW_VERSION_APP } from "../../../constants";

  const PAGE_TABS = {
    KEYS: "KEYS",
    ENCRYPT: "ENCRYPT",
    DECRYPT: "DECRYPT",
    SIGN: "SIGN",
  };

  const tabsConfig = [
    { id: PAGE_TABS.KEYS, title: "УПРАВЛЕНИЕ КЛЮЧАМИ", icon: "🔑", description: "Генерация и управление криптографическими ключами" },
    { id: PAGE_TABS.ENCRYPT, title: "ШИФРОВАНИЕ", icon: "🔐", description: "Зашифровать сообщения для безопасной передачи" },
    { id: PAGE_TABS.DECRYPT, title: "РАСШИФРОВКА", icon: "🔓", description: "Расшифровать полученные сообщения" },
    { id: PAGE_TABS.SIGN, title: "ПОДПИСЬ", icon: "✍️", description: "Цифровая подпись и верификация" }
  ];

  let pageTab = $state(PAGE_TABS.KEYS);

  function setTab(tabId: string) {
    pageTab = tabId;
  }
</script>

<div class="crypto-container" data-widget-name="CryptoPage" data-theme="{$theme}">
    <header class="crypto-header">
      <div class="back-link-container">
        <Link href={'#'+ROUTES.HOME} className="back-link">
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
          <span>ГЛАВНАЯ</span>
        </Link>
      </div>
      
      <div class="animated-title-container">
        <div class="matrix-rain">
          {#each Array(18) as _, i}
            <div class="matrix-column" style="animation-delay: {i * 0.12}s;">
              {#each Array(12) as _, j}
                <span class="matrix-char" style="animation-delay: {(i * 0.12) + (j * 0.06)}s;">
                  {String.fromCharCode(65 + Math.floor(Math.random() * 26))}
                </span>
              {/each}
            </div>
          {/each}
        </div>
        
        <h1 class="animated-title">
          <span class="title-word glitch-word" style="animation-delay: 0s;">CRYPTO</span>
          <span class="title-separator">_</span>
          <span class="title-word glitch-word" style="animation-delay: 0.3s;">TERMINAL</span>
        </h1>
        
        <div class="subtitle">
          <span class="typing-text">КРИПТОГРАФИЧЕСКИЙ_МОДУЛЬ_СИСТЕМЫ</span>
          <span class="cursor">█</span>
        </div>
        
        <div class="security-badges">
          <div class="security-badge">
            <span class="badge-icon">🛡️</span>
            <span class="badge-text">CURVE25519</span>
          </div>
          <div class="security-badge">
            <span class="badge-icon">🔐</span>
            <span class="badge-text">ED25519</span>
          </div>
          <div class="security-badge">
            <span class="badge-icon">⚡</span>
            <span class="badge-text">LIBSODIUM</span>
          </div>
        </div>
      </div>

      <div class="theme-switcher-container">
        <ThemeSwitcher />
      </div>
    </header>

    <nav class="crypto-nav">
      {#each tabsConfig as tab}
        <button 
          class="nav-tab {pageTab === tab.id ? 'active' : ''}"
          onclick={() => setTab(tab.id)}
          title={tab.description}
        >
          <span class="nav-icon">{tab.icon}</span>
          <span class="nav-text">{tab.title}</span>
          <div class="nav-indicator"></div>
        </button>
      {/each}
    </nav>

    <main class="crypto-content">
      <div class="content-wrapper">
        <div class="content-header">
          <h2 class="section-title">
            // {tabsConfig.find(t => t.id === pageTab)?.title} //
          </h2>
          <p class="section-description">
            {tabsConfig.find(t => t.id === pageTab)?.description}
          </p>
        </div>

        <div class="content-body">
          {#if pageTab === PAGE_TABS.KEYS}
            <CryptoPageKeys />
          {:else if pageTab === PAGE_TABS.ENCRYPT}
            <CryptoPageEncrypt />
          {:else if pageTab === PAGE_TABS.DECRYPT}
            <CryptoPageDecrypt />
          {:else if pageTab === PAGE_TABS.SIGN}
            <CryptoPageSign />
          {/if}
        </div>
      </div>
    </main>

    <footer class="crypto-footer">
      <div class="footer-info">
        <span class="footer-version">// CRYPTO_TERMINAL_{VIEW_VERSION_APP} //</span>
        <span class="footer-security">SECURITY: MAXIMUM</span>
      </div>
    </footer>
  </div>

<style>
  .crypto-container {
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
  .crypto-header {
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
    color: var(--les-text-secondary);
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
    left: calc(var(--i, 0) * 5.56%);
  }

  .matrix-column:nth-child(even) {
    left: calc(var(--i, 0) * 5.56% + 2.78%);
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
    animation: crypto-glitch 3.5s ease-in-out infinite;
    position: relative;
  }

  .title-separator {
    color: var(--les-accent-secondary);
    animation: separator-pulse 1.8s ease-in-out infinite;
  }

  @keyframes crypto-glitch {
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
    color: var(--les-text-secondary);
  }

  .typing-text {
    animation: typing 4.5s steps(45) infinite;
    border-right: 2px solid var(--les-accent-secondary);
  }

  .cursor {
    animation: cursor-blink 1s infinite;
    color: var(--les-accent-secondary);
  }

  @keyframes typing {
    0%, 45% { width: 0; }
    85%, 100% { width: 100%; }
  }

  @keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .security-badges {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: center;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.8rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--les-border-primary);
    border-radius: 2px;
    font-size: 0.8rem;
    animation: badge-glow 3s ease-in-out infinite alternate;
  }

  .badge-icon {
    font-size: 1rem;
  }

  .badge-text {
    color: var(--les-accent-secondary);
    font-weight: bold;
  }

  @keyframes badge-glow {
    0% { box-shadow: 0 0 5px transparent; }
    100% { box-shadow: 0 0 10px var(--les-accent-secondary); }
  }

  .theme-switcher-container {
    z-index: 10;
  }

  /* Navigation */
  .crypto-nav {
    display: flex;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid var(--les-border-primary);
    background: rgba(0, 0, 0, 0.3);
    gap: 0.5rem;
    overflow-x: auto;
  }

  .nav-tab {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 1.5rem;
    background: transparent;
    border: 1px solid var(--les-border-primary);
    color: var(--les-text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    white-space: nowrap;
    font-family: inherit;
    position: relative;
    overflow: hidden;
  }

  .nav-tab::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .nav-tab:hover::before {
    left: 100%;
  }

  .nav-tab:hover {
    background: rgba(255, 255, 255, 0.05);
    box-shadow: 0 0 15px var(--les-accent-primary);
    transform: translateY(-2px);
  }

  .nav-tab.active {
    background: var(--les-accent-primary);
    color: var(--les-bg-primary);
    box-shadow: 0 0 20px var(--les-accent-primary);
    border-color: var(--les-accent-primary);
  }

  .nav-tab.active .nav-indicator {
    background: var(--les-bg-primary);
  }

  .nav-icon {
    font-size: 1.3rem;
  }

  .nav-text {
    font-weight: bold;
  }

  .nav-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--les-accent-primary);
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .nav-tab:hover .nav-indicator {
    transform: scaleX(1);
  }

  /* Content */
  .crypto-content {
    flex: 1;
    padding: 2rem;
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    overflow-y: auto;
  }

  .content-wrapper {
    max-width: 1200px;
    margin: 0 auto;
  }

  .content-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .section-title {
    font-size: 2rem;
    color: var(--les-accent-primary);
    margin-bottom: 1rem;
    text-shadow: 0 0 10px var(--les-accent-primary);
  }

  .section-description {
    color: var(--les-text-secondary);
    font-size: 1rem;
    margin-bottom: 0;
  }

  .content-body {
    background: var(--les-bg-secondary);
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    padding: 2rem;
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.02);
  }

  /* Footer */
  .crypto-footer {
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
    color: var(--les-text-secondary);
  }

  .footer-security {
    color: var(--les-accent-secondary);
    animation: security-pulse 2.5s ease-in-out infinite;
  }

  @keyframes security-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .animated-title {
      font-size: 2.2rem;
    }
    
    .crypto-header {
      padding: 1rem;
      min-height: 120px;
    }
    
    .crypto-nav {
      flex-wrap: wrap;
    }
    
    .crypto-content {
      padding: 1.5rem 1rem;
    }
    
    .content-body {
      padding: 1.5rem;
    }
    
    .security-badges {
      flex-wrap: wrap;
      gap: 0.5rem;
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
    
    .nav-tab {
      padding: 0.8rem 1rem;
    }
    
    .nav-text {
      font-size: 0.9rem;
    }
    
    .section-title {
      font-size: 1.5rem;
    }
  }
</style>
