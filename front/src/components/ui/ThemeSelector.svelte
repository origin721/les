<script lang="ts">
  import { theme, themes, setTheme } from "../../stores/theme";
  import { Button } from "./";

  // Иконки для каждой темы
  const themeIcons: Record<string, string> = {
    cyberpunk: "🌆",
    watchdogs: "🔍",
    pixel: "🎮",
    terminal: "💻",
    arabic: "🕌"
  };

  // Описания тем
  const themeDescriptions: Record<string, string> = {
    cyberpunk: "Темная киберпанк тема с неоновыми акцентами",
    watchdogs: "Стиль в духе хакерских фильмов",
    pixel: "Ретро пиксельная графика",
    terminal: "Классический терминальный интерфейс",
    arabic: "Традиционный арабский стиль"
  };
</script>

<div class="theme-selector">
  <div class="themes-grid">
    {#each themes as themeName}
      <div 
        class="theme-option"
        class:active={$theme === themeName}
      >
        <div class="theme-preview">
          <span class="theme-icon">{themeIcons[themeName] || "🎨"}</span>
          <div class="theme-info">
            <div class="theme-name">{themeName.toUpperCase()}</div>
            <div class="theme-description">{themeDescriptions[themeName]}</div>
          </div>
        </div>
        <div class="theme-actions">
          <Button
            variant={$theme === themeName ? "primary" : "outline"}
            size="sm"
            onclick={() => setTheme(themeName)}
            disabled={$theme === themeName}
          >
            {$theme === themeName ? "✓ Активна" : "Применить"}
          </Button>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .theme-selector {
    width: 100%;
  }

  .themes-grid {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1fr;
  }

  .theme-option {
    border: 1px solid var(--les-border-primary);
    border-radius: 8px;
    padding: 1rem;
    background: var(--les-bg-secondary);
    transition: all 0.2s ease;
  }

  .theme-option:hover {
    border-color: var(--les-accent-primary);
    transform: translateY(-1px);
  }

  .theme-option.active {
    border-color: var(--les-accent-primary);
    background: var(--les-bg-primary);
  }

  .theme-preview {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .theme-icon {
    font-size: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 3rem;
    height: 3rem;
    border-radius: 50%;
    background: var(--les-accent-primary);
    color: var(--les-text-contrast);
  }

  .theme-info {
    flex: 1;
  }

  .theme-name {
    font-size: 1.1rem;
    font-weight: bold;
    color: var(--les-text-primary);
    margin-bottom: 0.25rem;
  }

  .theme-description {
    font-size: 0.9rem;
    color: var(--les-text-secondary);
    line-height: 1.4;
  }

  .theme-actions {
    display: flex;
    justify-content: flex-end;
  }

  @media (min-width: 768px) {
    .themes-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1024px) {
    .themes-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  }
</style>
