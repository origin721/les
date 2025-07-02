<script lang="ts">
  import { writable } from "svelte/store";
  import { copyTextToClipboard, defaultCharRanges, randomByRange } from "../../../core";
  import { Link, ROUTES } from "../../../routing";
  import { gen_pass } from "../../../core/random/gen_pass";
  import { theme } from "../../../stores/theme";

  // Import theme styles
  import "../../../styles/cyberpunk.css";
  import "../../../styles/pixel.css";

  const randomString = writable(getNewRandomString());
  let isGenerating = false;
  let copyStatus = "";

  function getNewRandomString() {
    return gen_pass();
  }

  async function handleRegenerate() {
    isGenerating = true;
    // Добавляем небольшую задержку для эффекта
    await new Promise(resolve => setTimeout(resolve, 200));
    randomString.set(getNewRandomString());
    isGenerating = false;
    copyStatus = "";
  }

  async function handleClip() {
    try {
      await copyTextToClipboard($randomString);
      copyStatus = "СКОПИРОВАНО";
      setTimeout(() => {
        copyStatus = "";
      }, 2000);
    } catch (error) {
      copyStatus = "ОШИБКА";
      setTimeout(() => {
        copyStatus = "";
      }, 2000);
    }
  }

  // Генерация разных типов данных
  const generatorTypes = [
    { id: 'password', name: 'ПАРОЛЬ', icon: '🔐', description: 'Криптостойкий пароль' },
    { id: 'hex', name: 'HEX', icon: '🔢', description: 'Шестнадцатеричная строка' },
    { id: 'base64', name: 'BASE64', icon: '📝', description: 'Base64 строка' },
    { id: 'uuid', name: 'UUID', icon: '🆔', description: 'Уникальный идентификатор' }
  ];

  let currentType = 'password';

  function generateByType(type: string) {
    switch (type) {
      case 'hex':
        return Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');
      case 'base64':
        const bytes = new Uint8Array(24);
        crypto.getRandomValues(bytes);
        return btoa(String.fromCharCode(...bytes));
      case 'uuid':
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0;
          const v = c == 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      default:
        return gen_pass();
    }
  }

  async function handleTypeChange(type: string) {
    currentType = type;
    isGenerating = true;
    await new Promise(resolve => setTimeout(resolve, 150));
    randomString.set(generateByType(type));
    isGenerating = false;
    copyStatus = "";
  }
</script>

<div class="theme-{$theme}">
  <div class="random-content-container" data-widget-name="RandomContent">
    
    <!-- Generator Type Selection -->
    <div class="generator-types">
      <h3 class="types-title">ТИП ГЕНЕРАТОРА</h3>
      <div class="types-grid">
        {#each generatorTypes as type}
          <button 
            class="type-button {currentType === type.id ? 'active' : ''}"
            onclick={() => handleTypeChange(type.id)}
            title={type.description}
          >
            <span class="type-icon">{type.icon}</span>
            <span class="type-name">{type.name}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Generated Output -->
    <div class="output-section">
      <h3 class="output-title">СГЕНЕРИРОВАННЫЕ ДАННЫЕ</h3>
      <div class="output-container">
        <div class="output-display {isGenerating ? 'generating' : ''}">
          {#if isGenerating}
            <div class="generating-animation">
              <span class="generating-text">ГЕНЕРАЦИЯ</span>
              <span class="dots">
                <span class="dot">.</span>
                <span class="dot">.</span>
                <span class="dot">.</span>
              </span>
            </div>
          {:else}
            <code class="output-text">{$randomString}</code>
          {/if}
        </div>
        
        <div class="output-info">
          <span class="output-length">ДЛИНА: {$randomString.length}</span>
          <span class="output-type">ТИП: {generatorTypes.find(t => t.id === currentType)?.name}</span>
        </div>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="controls-section">
      <div class="controls-grid">
        <button 
          class="control-button regenerate-btn"
          onclick={handleRegenerate}
          disabled={isGenerating}
        >
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
            <path d="M21 3v5h-5"/>
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
            <path d="M3 21v-5h5"/>
          </svg>
          <span>ПЕРЕГЕНЕРИРОВАТЬ</span>
        </button>

        <button 
          class="control-button copy-btn {copyStatus ? 'status-active' : ''}"
          onclick={handleClip}
          disabled={isGenerating}
        >
          <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>{copyStatus || 'КОПИРОВАТЬ'}</span>
        </button>
      </div>
    </div>

    <!-- Security Info -->
    <div class="security-info">
      <div class="security-card">
        <div class="security-header">
          <span class="security-icon">🛡️</span>
          <h4 class="security-title">ИНФОРМАЦИЯ О БЕЗОПАСНОСТИ</h4>
        </div>
        <div class="security-details">
          <div class="security-item">
            <span class="security-label">ЭНТРОПИЯ:</span>
            <span class="security-value">МАКСИМАЛЬНАЯ</span>
          </div>
          <div class="security-item">
            <span class="security-label">ИСТОЧНИК:</span>
            <span class="security-value">CRYPTO.GETRANDOMVALUES()</span>
          </div>
          <div class="security-item">
            <span class="security-label">СТАНДАРТ:</span>
            <span class="security-value">CRYPTOGRAPHICALLY SECURE</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="navigation-section">
      <Link href={ROUTES.HOME} className="nav-link">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9,22 9,12 15,12 15,22"/>
        </svg>
        <span>ВЕРНУТЬСЯ В ГЛАВНОЕ МЕНЮ</span>
      </Link>
    </div>

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
    --success-color: #00ff00;
    --warning-color: #ff6600;
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
    --success-color: #00ff88;
    --warning-color: #ff6600;
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
    --success-color: #00ff00;
    --warning-color: #ff6600;
  }

  .random-content-container {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    color: var(--text-color);
    font-family: "Courier New", Courier, monospace;
  }

  /* Generator Types */
  .generator-types {
    margin-bottom: 1rem;
  }

  .types-title {
    color: var(--primary-color);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 5px var(--primary-color);
    text-align: center;
  }

  .types-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .type-button {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .type-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .type-button:hover::before {
    left: 100%;
  }

  .type-button:hover {
    border-color: var(--primary-color);
    box-shadow: 0 0 15px var(--primary-color);
    transform: translateY(-2px);
  }

  .type-button.active {
    background: var(--primary-color);
    color: var(--background-color);
    box-shadow: 0 0 20px var(--primary-color);
    border-color: var(--primary-color);
  }

  .type-icon {
    font-size: 1.5rem;
  }

  .type-name {
    font-weight: bold;
    font-size: 0.9rem;
  }

  /* Output Section */
  .output-section {
    margin-bottom: 1rem;
  }

  .output-title {
    color: var(--secondary-color);
    font-size: 1.2rem;
    margin-bottom: 1rem;
    text-shadow: 0 0 5px var(--secondary-color);
    text-align: center;
  }

  .output-container {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1.5rem;
    box-shadow: 
      0 0 15px rgba(0, 0, 0, 0.5),
      inset 0 0 15px rgba(255, 255, 255, 0.02);
  }

  .output-display {
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .output-display.generating {
    border-color: var(--accent-color);
    box-shadow: 0 0 10px var(--accent-color);
  }

  .output-text {
    color: var(--accent-color);
    font-size: 1.1rem;
    word-break: break-all;
    text-align: center;
    text-shadow: 0 0 5px var(--accent-color);
    line-height: 1.4;
  }

  .generating-animation {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--accent-color);
  }

  .generating-text {
    font-weight: bold;
  }

  .dots {
    display: flex;
    gap: 0.2rem;
  }

  .dot {
    animation: dot-pulse 1.5s ease-in-out infinite;
  }

  .dot:nth-child(1) { animation-delay: 0s; }
  .dot:nth-child(2) { animation-delay: 0.3s; }
  .dot:nth-child(3) { animation-delay: 0.6s; }

  @keyframes dot-pulse {
    0%, 60%, 100% { opacity: 0.3; }
    30% { opacity: 1; }
  }

  .output-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--secondary-color);
  }

  .output-length, .output-type {
    padding: 0.3rem 0.6rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
    border-radius: 2px;
  }

  /* Controls */
  .controls-section {
    margin-bottom: 1rem;
  }

  .controls-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.8rem;
    padding: 1.2rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
    font-weight: bold;
    border-radius: 4px;
    position: relative;
    overflow: hidden;
  }

  .control-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .control-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  .control-button:hover:not(:disabled)::before {
    left: 100%;
  }

  .regenerate-btn:hover:not(:disabled) {
    border-color: var(--primary-color);
    box-shadow: 0 0 15px var(--primary-color);
    color: var(--primary-color);
  }

  .copy-btn:hover:not(:disabled) {
    border-color: var(--secondary-color);
    box-shadow: 0 0 15px var(--secondary-color);
    color: var(--secondary-color);
  }

  .copy-btn.status-active {
    border-color: var(--success-color);
    color: var(--success-color);
    box-shadow: 0 0 15px var(--success-color);
  }

  .button-icon {
    width: 20px;
    height: 20px;
  }

  /* Security Info */
  .security-info {
    margin-bottom: 1rem;
  }

  .security-card {
    background: var(--card-background);
    border: 1px solid var(--border-color);
    border-radius: 4px;
    padding: 1.5rem;
    box-shadow: 
      0 0 15px rgba(0, 0, 0, 0.5),
      inset 0 0 15px rgba(255, 255, 255, 0.02);
  }

  .security-header {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1rem;
  }

  .security-icon {
    font-size: 1.5rem;
  }

  .security-title {
    color: var(--accent-color);
    font-size: 1rem;
    margin: 0;
    text-shadow: 0 0 5px var(--accent-color);
  }

  .security-details {
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
  }

  .security-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border-color);
    border-radius: 2px;
  }

  .security-label {
    color: var(--secondary-color);
    font-size: 0.8rem;
    font-weight: bold;
  }

  .security-value {
    color: var(--success-color);
    font-size: 0.8rem;
    font-weight: bold;
    text-shadow: 0 0 3px var(--success-color);
  }

  /* Navigation */
  .navigation-section {
    text-align: center;
  }

  :global(.nav-link) {
    display: inline-flex;
    align-items: center;
    gap: 0.8rem;
    padding: 1rem 2rem;
    background: var(--card-background);
    border: 1px solid var(--border-color);
    color: var(--text-color);
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 4px;
    font-weight: bold;
    position: relative;
    overflow: hidden;
  }

  :global(.nav-link::before) {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  :global(.nav-link:hover::before) {
    left: 100%;
  }

  :global(.nav-link:hover) {
    border-color: var(--primary-color);
    box-shadow: 0 0 15px var(--primary-color);
    color: var(--primary-color);
    transform: translateY(-2px);
  }

  .nav-icon {
    width: 20px;
    height: 20px;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .types-grid {
      grid-template-columns: 1fr;
    }
    
    .controls-grid {
      grid-template-columns: 1fr;
    }
    
    .output-info {
      flex-direction: column;
      gap: 0.5rem;
    }
    
    .security-item {
      flex-direction: column;
      gap: 0.3rem;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .random-content-container {
      gap: 1.5rem;
    }
    
    .output-container, .security-card {
      padding: 1rem;
    }
    
    .control-button {
      padding: 1rem;
      font-size: 0.9rem;
    }
    
    .output-text {
      font-size: 1rem;
    }
  }
</style>
