<script lang="ts">
  import { PageLayout } from "../../../components/layout";
  import RandomContent from "./RandomContent.svelte";

  // Создаем компонент для security badges
  const securityBadges = [
    { icon: "🎲", text: "CRYPTO-SECURE" },
    { icon: "🔐", text: "HIGH-ENTROPY" },
    { icon: "⚡", text: "FAST-GEN" }
  ];
</script>

<PageLayout
  title="RANDOM_GENERATOR"
  subtitle="ГЕНЕРАТОР_СЛУЧАЙНЫХ_ДАННЫХ"
  statusText="ENTROPY: MAXIMUM"
  backButtonText="← ГЛАВНАЯ"
  version="RANDOM_GENERATOR_v0.1.0"
  status="ENTROPY: MAXIMUM"
  containerClass="random-page"
  contentClass="random-content"
>
  {#snippet children()}
    <div class="content-wrapper">
      <div class="content-header">
        <div class="security-badges">
          {#each securityBadges as badge}
            <div class="security-badge">
              <span class="badge-icon">{badge.icon}</span>
              <span class="badge-text">{badge.text}</span>
            </div>
          {/each}
        </div>
        
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
  {/snippet}
</PageLayout>

<style>
  /* Дополнительные стили для страницы Random */
  :global(.random-page) {
    /* Используем CSS переменные из themes.css */
    font-family: "Courier New", Courier, monospace;
  }

  :global(.random-content) {
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
  }

  .security-badges {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 2rem;
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
    font-family: "Courier New", Courier, monospace;
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

  /* Responsive */
  @media (max-width: 768px) {
    .content-body {
      padding: 1.5rem;
    }
    
    .security-badges {
      gap: 0.5rem;
    }
    
    .section-title {
      font-size: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .section-title {
      font-size: 1.2rem;
    }
    
    .security-badge {
      font-size: 0.7rem;
      padding: 0.2rem 0.6rem;
    }
  }
</style>
