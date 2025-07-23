<script>
  import { ROUTES } from "../../../routing";
  import { Link } from "../../../routing";
  import { onMount } from "svelte";
    import { routingStore } from "../../../routing/stores";
  
  let mounted = false;
  let glitchText = "404";
  let randomChars = "АБВГДЕЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ0123456789!@#$%^&*()";
  
  onMount(() => {
    mounted = true;
    
    // Глитч эффект для текста
    const glitchInterval = setInterval(() => {
      if (Math.random() < 0.1) {
        const originalText = "404";
        let glitched = "";
        
        for (let i = 0; i < originalText.length; i++) {
          if (Math.random() < 0.3) {
            glitched += randomChars[Math.floor(Math.random() * randomChars.length)];
          } else {
            glitched += originalText[i];
          }
        }
        
        glitchText = glitched;
        
        setTimeout(() => {
          glitchText = originalText;
        }, 100);
      }
    }, 200);
    
    return () => clearInterval(glitchInterval);
  });
</script>

<div class="error-page">
  <div class="error-container" class:mounted>
    <!-- Фоновые элементы -->
    <div class="bg-elements">
      <div class="grid-bg"></div>
      <div class="floating-particles">
        {#each Array(20) as _, i}
          <div class="particle" style="--delay: {i * 0.2}s"></div>
        {/each}
      </div>
    </div>
    
    <!-- Основной контент -->
    <div class="main-content">
      <div class="error-code">
        <span class="glitch-text" data-text={glitchText}>{glitchText}</span>
      </div>
      
      <div class="error-message">
        <h2>СТРАНИЦА НЕ НАЙДЕНА</h2>
        <p>Похоже, эта страница исчезла в цифровой пустоте. Возможно, она была зашифрована и ключ потерялся...</p>
      </div>
      
      <div class="action-buttons">
        <Link hash={ROUTES.HOME} className="btn-primary">
          <span class="btn-text">ВЕРНУТЬСЯ ДОМОЙ</span>
          <span class="btn-glow"></span>
        </Link>
        
        <button class="btn-secondary" on:click={() => routingStore.setRoute({hash: ROUTES.HOME})}>
          <span class="btn-text">НАЗАД</span>
          <span class="btn-glow"></span>
        </button>
      </div>
      
      <!-- Дополнительная информация -->
      <div class="error-details">
        <div class="error-code-detail">
          <span class="label">ERROR_CODE:</span>
          <span class="value">PAGE_NOT_FOUND</span>
        </div>
        <div class="error-timestamp">
          <span class="label">TIMESTAMP:</span>
          <span class="value">{new Date().toISOString()}</span>
        </div>
      </div>
    </div>
    
    <!-- Декоративные элементы -->
    <div class="decorative-elements">
      <div class="corner-bracket top-left"></div>
      <div class="corner-bracket top-right"></div>
      <div class="corner-bracket bottom-left"></div>
      <div class="corner-bracket bottom-right"></div>
    </div>
  </div>
</div>

<style>
  .error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
    color: #ffffff;
    font-family: 'Courier New', monospace;
    overflow: hidden;
    position: relative;
  }
  
  .error-container {
    position: relative;
    text-align: center;
    max-width: 800px;
    padding: 2rem;
    opacity: 0;
    transform: translateY(50px);
    transition: all 1s cubic-bezier(0.23, 1, 0.32, 1);
  }
  
  .error-container.mounted {
    opacity: 1;
    transform: translateY(0);
  }
  
  /* Фоновые элементы */
  .bg-elements {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .grid-bg {
    background-image: 
      linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px);
    background-size: 50px 50px;
    width: 100%;
    height: 100%;
    animation: grid-move 20s linear infinite;
  }
  
  @keyframes grid-move {
    0% { transform: translate(0, 0); }
    100% { transform: translate(50px, 50px); }
  }
  
  .floating-particles {
    position: absolute;
    width: 100%;
    height: 100%;
  }
  
  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: #00ffff;
    border-radius: 50%;
    animation: float 6s ease-in-out infinite;
    animation-delay: var(--delay);
    left: calc(var(--delay) * 50px);
    top: calc(var(--delay) * 30px);
    box-shadow: 0 0 10px #00ffff;
  }
  
  @keyframes float {
    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
    50% { transform: translateY(-100px) rotate(180deg); opacity: 1; }
  }
  
  /* Основной контент */
  .main-content {
    position: relative;
    z-index: 10;
  }
  
  .error-code {
    margin-bottom: 2rem;
  }
  
  .glitch-text {
    font-size: clamp(6rem, 15vw, 12rem);
    font-weight: bold;
    position: relative;
    color: #00ffff;
    text-shadow: 
      0 0 20px #00ffff,
      0 0 40px #00ffff,
      0 0 60px #00ffff;
    animation: glow 2s ease-in-out infinite alternate;
  }
  
  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
  
  .glitch-text::before {
    animation: glitch-1 0.5s infinite linear alternate-reverse;
    color: #ff00ff;
    z-index: -1;
  }
  
  .glitch-text::after {
    animation: glitch-2 0.5s infinite linear alternate-reverse;
    color: #ffff00;
    z-index: -2;
  }
  
  @keyframes glow {
    from { text-shadow: 0 0 20px #00ffff, 0 0 40px #00ffff, 0 0 60px #00ffff; }
    to { text-shadow: 0 0 30px #00ffff, 0 0 50px #00ffff, 0 0 70px #00ffff; }
  }
  
  @keyframes glitch-1 {
    0% { transform: translate(0); }
    20% { transform: translate(-2px, 2px); }
    40% { transform: translate(-2px, -2px); }
    60% { transform: translate(2px, 2px); }
    80% { transform: translate(2px, -2px); }
    100% { transform: translate(0); }
  }
  
  @keyframes glitch-2 {
    0% { transform: translate(0); }
    20% { transform: translate(2px, 2px); }
    40% { transform: translate(2px, -2px); }
    60% { transform: translate(-2px, 2px); }
    80% { transform: translate(-2px, -2px); }
    100% { transform: translate(0); }
  }
  
  .error-message {
    margin-bottom: 3rem;
  }
  
  .error-message h2 {
    font-size: clamp(1.5rem, 4vw, 2.5rem);
    color: #ff6b6b;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 3px;
    animation: pulse-red 2s ease-in-out infinite;
  }
  
  @keyframes pulse-red {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
  
  .error-message p {
    font-size: 1.1rem;
    color: #cccccc;
    line-height: 1.6;
    max-width: 500px;
    margin: 0 auto;
  }
  
  .action-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    margin-bottom: 3rem;
    flex-wrap: wrap;
  }
  
  .btn-primary,
  .btn-secondary {
    position: relative;
    padding: 1rem 2rem;
    border: 2px solid #00ffff;
    background: transparent;
    color: #00ffff;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: bold;
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;
    font-family: inherit;
    font-size: 0.9rem;
    display: inline-block;
  }
  
  /* Сброс стилей для Link компонента */
  :global(.btn-primary) {
    position: relative;
    padding: 1rem 2rem;
    border: 2px solid #00ffff;
    background: transparent;
    color: #00ffff !important;
    text-decoration: none !important;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: bold;
    transition: all 0.3s ease;
    overflow: hidden;
    cursor: pointer;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    display: inline-block;
  }
  
  :global(.btn-primary:hover) {
    transform: translateY(-2px) !important;
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3) !important;
    color: #00ffff !important;
  }
  
  :global(.btn-primary .btn-glow) {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  :global(.btn-primary:hover .btn-glow) {
    left: 100% !important;
  }
  
  .btn-secondary {
    border-color: #ff6b6b;
    color: #ff6b6b;
  }
  
  .btn-text {
    position: relative;
    z-index: 2;
  }
  
  .btn-glow {
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }
  
  .btn-secondary .btn-glow {
    background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.2), transparent);
  }
  
  .btn-primary:hover,
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
  }
  
  .btn-secondary:hover {
    box-shadow: 0 10px 30px rgba(255, 107, 107, 0.3);
  }
  
  .btn-primary:hover .btn-glow,
  .btn-secondary:hover .btn-glow {
    left: 100%;
  }
  
  .error-details {
    font-family: 'Courier New', monospace;
    font-size: 0.8rem;
    color: #666;
    text-align: left;
    max-width: 400px;
    margin: 0 auto;
  }
  
  .error-code-detail,
  .error-timestamp {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    padding: 0.5rem;
    border: 1px solid #333;
    background: rgba(0, 0, 0, 0.3);
  }
  
  .label {
    color: #00ffff;
  }
  
  .value {
    color: #ffffff;
  }
  
  /* Декоративные элементы */
  .decorative-elements {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
  }
  
  .corner-bracket {
    position: absolute;
    width: 40px;
    height: 40px;
    border: 2px solid #00ffff;
  }
  
  .corner-bracket.top-left {
    top: 2rem;
    left: 2rem;
    border-right: none;
    border-bottom: none;
  }
  
  .corner-bracket.top-right {
    top: 2rem;
    right: 2rem;
    border-left: none;
    border-bottom: none;
  }
  
  .corner-bracket.bottom-left {
    bottom: 2rem;
    left: 2rem;
    border-right: none;
    border-top: none;
  }
  
  .corner-bracket.bottom-right {
    bottom: 2rem;
    right: 2rem;
    border-left: none;
    border-top: none;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .error-container {
      padding: 1rem;
    }
    
    .action-buttons {
      flex-direction: column;
      align-items: center;
    }
    
    .btn-primary,
    .btn-secondary {
      width: 100%;
      max-width: 250px;
    }
    
    .corner-bracket {
      width: 20px;
      height: 20px;
    }
    
    .corner-bracket.top-left,
    .corner-bracket.top-right {
      top: 1rem;
    }
    
    .corner-bracket.top-left,
    .corner-bracket.bottom-left {
      left: 1rem;
    }
    
    .corner-bracket.top-right,
    .corner-bracket.bottom-right {
      right: 1rem;
    }
    
    .corner-bracket.bottom-left,
    .corner-bracket.bottom-right {
      bottom: 1rem;
    }
  }
</style>
