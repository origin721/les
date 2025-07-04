<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    statusText?: string;
    showMatrixRain?: boolean;
    className?: string;
  }

  let {
    title,
    subtitle = "",
    statusText = "СИСТЕМА АКТИВНА",
    showMatrixRain = true,
    className = ""
  }: Props = $props();

  // Разбиваем заголовок на слова для анимации
  const titleWords = title.split('_');
</script>

<div class="animated-title-container {className}">
  {#if showMatrixRain}
    <div class="matrix-rain">
      {#each Array(15) as _, i}
        <div class="matrix-column" style="animation-delay: {i * 0.15}s;">
          {#each Array(8) as _, j}
            <span class="matrix-char" style="animation-delay: {(i * 0.15) + (j * 0.08)}s;">
              {String.fromCharCode(48 + Math.floor(Math.random() * 10))}
            </span>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
  
  <h1 class="animated-title">
    {#each titleWords as word, index}
      <span class="title-word glitch-word" style="animation-delay: {index * 0.4}s;">{word}</span>
      {#if index < titleWords.length - 1}
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
  
  {#if statusText}
    <div class="status-indicator">
      <span class="status-dot active"></span>
      <span class="status-text">{statusText}</span>
    </div>
  {/if}
</div>

<style>
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
    top: -3.125rem;
    left: -9.375rem;
    right: -9.375rem;
    bottom: -3.125rem;
    overflow: hidden;
    opacity: 0.1;
    z-index: 1;
  }

  .matrix-column {
    position: absolute;
    top: 0;
    width: 1.25rem;
    height: 100%;
    animation: matrix-fall 4s linear infinite;
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
    font-size: 0.875rem;
    line-height: 1.4;
    animation: matrix-glow 3s ease-in-out infinite alternate;
  }

  @keyframes matrix-fall {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes matrix-glow {
    0% { opacity: 0.2; }
    100% { opacity: 0.8; }
  }

  .animated-title {
    font-size: 3.5rem;
    font-weight: bold;
    margin: 0;
    position: relative;
    z-index: 2;
    font-family: "Courier New", Courier, monospace;
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
    animation: title-glitch 4s ease-in-out infinite;
    position: relative;
  }

  .title-separator {
    color: var(--les-accent-secondary);
    animation: separator-pulse 2s ease-in-out infinite;
  }

  @keyframes title-glitch {
    0%, 90%, 100% { 
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
    3% { 
      transform: translate(-0.125rem, 0.125rem);
      filter: hue-rotate(90deg);
    }
    6% { 
      transform: translate(0.125rem, -0.125rem);
      filter: hue-rotate(180deg);
    }
    9% { 
      transform: translate(-0.125rem, -0.125rem);
      filter: hue-rotate(270deg);
    }
    12% { 
      transform: translate(0.125rem, 0.125rem);
      filter: hue-rotate(360deg);
    }
    15% { 
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
  }

  @keyframes separator-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .subtitle {
    margin-top: 1.5rem;
    font-size: 1.1rem;
    color: var(--les-text-secondary);
    font-family: "Courier New", Courier, monospace;
  }

  .typing-text {
    animation: typing 5s steps(50) infinite;
    border-right: 2px solid var(--les-accent-secondary);
  }

  .cursor {
    animation: cursor-blink 1s infinite;
    color: var(--les-accent-secondary);
  }

  @keyframes typing {
    0%, 40% { width: 0; }
    80%, 100% { width: 100%; }
  }

  @keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1rem;
    justify-content: center;
  }

  .status-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--les-accent-secondary);
    animation: status-pulse 2s ease-in-out infinite;
  }

  .status-text {
    color: var(--les-accent-secondary);
    font-size: 0.9rem;
    font-weight: bold;
    font-family: "Courier New", Courier, monospace;
  }

  @keyframes status-pulse {
    0%, 100% { 
      opacity: 1;
      box-shadow: 0 0 0 0 var(--les-accent-secondary);
    }
    50% { 
      opacity: 0.7;
      box-shadow: 0 0 0 8px transparent;
    }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .animated-title {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 480px) {
    .animated-title {
      font-size: 2rem;
    }
    
    .subtitle {
      font-size: 0.9rem;
    }
  }
</style>
