<script lang="ts">
  interface ActionConfig {
    id: string;
    title: string;
    icon: string;
    description?: string;
    href?: string;
    onclick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    disabled?: boolean;
  }

  interface Props {
    actions: ActionConfig[];
    className?: string;
  }

  let { actions, className = '' }: Props = $props();
</script>

<nav class="action-bar {className}">
  {#each actions as action}
    {#if action.href}
      <a 
        href={action.href}
        class="action-tab action-{action.variant || 'primary'} {action.disabled ? 'disabled' : ''}"
        title={action.description}
        class:disabled={action.disabled}
      >
        <span class="action-icon">{action.icon}</span>
        <span class="action-text">{action.title}</span>
        <div class="action-indicator"></div>
      </a>
    {:else}
      <button 
        class="action-tab action-{action.variant || 'primary'} {action.disabled ? 'disabled' : ''}"
        onclick={action.onclick}
        title={action.description}
        disabled={action.disabled}
      >
        <span class="action-icon">{action.icon}</span>
        <span class="action-text">{action.title}</span>
        <div class="action-indicator"></div>
      </button>
    {/if}
  {/each}
</nav>

<style>
  .action-bar {
    display: flex;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--les-border-primary);
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.03), rgba(255, 0, 255, 0.03));
    gap: 0.75rem;
    overflow-x: auto;
    position: relative;
  }

  .action-bar::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(0, 255, 255, 0.1), transparent);
    animation: actionsSweep 4s ease-in-out infinite;
  }

  @keyframes actionsSweep {
    0% { left: -100%; }
    100% { left: 100%; }
  }

  .action-tab {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 1rem 1.5rem;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--les-border-primary);
    color: var(--les-text-primary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    white-space: nowrap;
    font-family: "Courier New", Courier, monospace;
    text-decoration: none;
    position: relative;
    overflow: hidden;
    z-index: 2;
    border-radius: 4px;
  }

  .action-tab::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
    transition: left 0.5s ease;
  }

  .action-tab:hover::before {
    left: 100%;
  }

  .action-tab:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.3);
  }

  .action-tab.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }

  .action-tab.disabled:hover::before {
    left: -100%;
  }

  /* Variants */
  .action-primary {
    border-color: var(--les-accent-primary);
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 255, 255, 0.05));
  }

  .action-primary:hover {
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.2), rgba(0, 255, 255, 0.1));
    box-shadow: 0 8px 25px rgba(0, 255, 255, 0.4);
    border-color: var(--les-accent-primary);
  }

  .action-secondary {
    border-color: var(--les-accent-secondary);
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 255, 0.05));
  }

  .action-secondary:hover {
    background: linear-gradient(135deg, rgba(255, 0, 255, 0.2), rgba(255, 0, 255, 0.1));
    box-shadow: 0 8px 25px rgba(255, 0, 255, 0.4);
    border-color: var(--les-accent-secondary);
  }

  .action-danger {
    border-color: #ff4444;
    background: linear-gradient(135deg, rgba(255, 68, 68, 0.1), rgba(255, 68, 68, 0.05));
  }

  .action-danger:hover {
    background: linear-gradient(135deg, rgba(255, 68, 68, 0.2), rgba(255, 68, 68, 0.1));
    box-shadow: 0 8px 25px rgba(255, 68, 68, 0.4);
    border-color: #ff4444;
  }

  .action-outline {
    border-color: var(--les-border-primary);
    background: rgba(0, 0, 0, 0.2);
  }

  .action-outline:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: var(--les-accent-primary);
  }

  .action-icon {
    font-size: 1.3rem;
    display: flex;
    align-items: center;
  }

  .action-text {
    font-weight: bold;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .action-indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: currentColor;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  .action-tab:hover .action-indicator {
    transform: scaleX(1);
  }

  .action-primary .action-indicator {
    background: var(--les-accent-primary);
  }

  .action-secondary .action-indicator {
    background: var(--les-accent-secondary);
  }

  .action-danger .action-indicator {
    background: #ff4444;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .action-bar {
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .action-tab {
      padding: 0.8rem 1.2rem;
      flex: 1;
      min-width: 150px;
    }

    .action-text {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    .action-tab {
      padding: 0.7rem 1rem;
      min-width: 120px;
    }

    .action-icon {
      font-size: 1.1rem;
    }

    .action-text {
      font-size: 0.75rem;
    }
  }
</style>
