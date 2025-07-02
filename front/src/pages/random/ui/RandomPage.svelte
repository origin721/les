<script lang="ts">
  import { Link, ROUTES } from "../../../routing";
  import { theme } from "../../../stores/theme";
  import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
  import RandomContent from "./RandomContent.svelte";

  // Import theme styles
  import "../../../styles/cyberpunk.css";
  import "../../../styles/pixel.css";
</script>

<div class="theme-{$theme}">
  <div class="random-container" data-widget-name="RandomPage">
    <header class="random-header">
      <div class="back-link-container">
        <Link href={ROUTES.HOME} className="back-link">
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
          <span class="title-word glitch-word" style="animation-delay: 0s;">RANDOM</span>
          <span class="title-separator">_</span>
          <span class="title-word glitch-word" style="animation-delay: 0.3s;">GENERATOR</span>
        </h1>
        
        <div class="subtitle">
          <span class="typing-text">ГЕНЕРАТОР_СЛУЧАЙНЫХ_ДАННЫХ</span>
          <span class="cursor">█</span>
        </div>
        
        <div class="security-badges">
          <div class="security-badge">
            <span class="badge-icon">🎲</span>
            <span class="badge-text">CRYPTO-SECURE</span>
          </div>
          <div class="security-badge">
            <span class="badge-icon">🔐</span>
            <span class="badge-text">HIGH-ENTROPY</span>
          </div>
          <div class="security-badge">
            <span class="badge-icon">⚡</span>
            <span class="badge-text">FAST-GEN</span>
          </div>
        </div>
      </div>

      <div class="theme-switcher-container">
        <ThemeSwitcher />
      </div>
    </header>

    <main class="random-content">
      <div class="content-wrapper">
        <div class="content-header">
          <h2 class="section-title">
            // ГЕНЕРАТОР СЛУЧАЙНЫХ ДАННЫХ //
          </h2>
          <p class="section-description">
            Криптографически стойкий генератор паролей и случайных строк
          </p>
        </div>

        <div class="content-body">
          <RandomContent />
        </div>
      </div>
    </main>

    <footer class="random-footer">
      <div class="footer-info">
        <span class="footer-version">// RANDOM_GENERATOR_v0.1.0 //</span>
        <span class="footer-security">ENTROPY: MAXIMUM</span>
      </div>
    </footer>
  </div>
</div>

<style>
  /* Theme Variables */
  .theme-cyberpunk {
    --background-color: #0a0a0a;
    --text-color: #00ff00;
    --primary-color: #ff00ff;
    --secondary-color: #00ffff;
    --border-color: #00ff00;
    --card-background: #1a1a1a;
    --nav-active: #ff00ff;
    --accent-color: #ffff00;
  }
  
  .theme-watchdogs {
    --background-color: #1a1a1a;
    --text-color: #cccccc;
    --primary-color: #ffc400;
    --secondary-color: #00aaff;
    --border-color: #444444;
    --card-background: #222222;
    --nav-active: #ffc400;
    --accent-color: #00aaff;
  }
  
  .theme-pixel {
    --background-color: #000000;
    --text-color: #00ff00;
    --primary-color: #00ff00;
    --secondary-color: #ff00ff;
    --border-color: #00ff00;
    --card-background: #222222;
    --nav-active: #ff00ff;
    --accent-color: #00ff00;
  }

  .random-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    background-color: var(--background-color);
    color: var(--text-color);
    font-family: "Courier New", Courier, monospace;
    overflow-x: hidden;
    border: 2px solid var(--border-color);
    box-shadow: 0 0 25px var(--primary-color) inset;
  }

  /* Header */
  .random-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
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
    color: var(--secondary-color);
    text-decoration: none;
    transition: all 0.2s;
    padding: 0.5rem 1rem;
    border: 1px solid var(--border-color);
    border-radius: 4px;
  }
  
  :global(.back-link:hover) {
    color: var(--primary-color);
    text-shadow: 0 0 5px var(--primary-color);
    border-color: var(--primary-color);
    box-shadow: 0 0 10px var(--primary-color);
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
    color: var(--primary-color);
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
    color: var(--primary-color);
    text-shadow: 
      0 0 5px var(--primary-color),
      0 0 10px var(--primary-color),
      0 0 15px var(--primary-color);
  }

  .glitch-word {
    animation: random-glitch 3.5s ease-in-out infinite;
    position: relative;
  }

  .title-separator {
    color: var(--secondary-color);
    animation: separator-pulse 1.8s ease-in-out infinite;
  }

  @keyframes random-glitch {
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
    color: var(--secondary-color);
  }

  .typing-text {
    animation: typing 4.5s steps(35) infinite;
    border-right: 2px solid var(--accent-color);
  }

  .cursor {
    animation: cursor-blink 1s infinite;
    color: var(--accent-color);
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
    border: 1px solid var(--border-color);
    border-radius: 2px;
    font-size: 0.8rem;
    animation: badge-glow 3s ease-in-out infinite alternate;
  }

  .badge-icon {
    font-size: 1rem;
  }

  .badge-text {
    color: var(--accent-color);
    font-weight: bold;
  }

  @keyframes badge-glow {
    0% { box-shadow: 0 0 5px transparent; }
    100% { box-shadow: 0 0 10px var(--accent-color); }
  }

  .theme-switcher-container {
    z-index: 10;
  }

  /* Content */
  .random-content {
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
    color: var(--primary-color);
    margin-bottom: 1rem;
    text-shadow: 0 0 10px var(--primary-color);
  }

  .section-description {
    color: var(--secondary-color);
    font-size: 1rem;
    margin-bottom: 0;
  }

  .content-body {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 2rem;
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.02);
  }

  /* Footer */
  .random-footer {
    padding: 1rem 2rem;
    border-top: 1px solid var(--border-color);
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
    color: var(--secondary-color);
  }

  .footer-security {
    color: var(--accent-color);
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
    
    .random-header {
      padding: 1rem;
      min-height: 120px;
    }
    
    .random-content {
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
    
    .section-title {
      font-size: 1.5rem;
    }
  }
</style>
