<script lang="ts">
  interface Props {
    status: 'active' | 'inactive' | 'warning' | 'error' | 'loading';
    text?: string;
    size?: 'sm' | 'md' | 'lg';
    animated?: boolean;
    className?: string;
  }
  
  let {
    status,
    text,
    size = 'md',
    animated = true,
    className = ''
  }: Props = $props();

  const getStatusClasses = () => {
    let classes = ['status-indicator', `status-${status}`, `size-${size}`];
    
    if (animated) classes.push('animated');
    if (className) classes.push(className);
    
    return classes.join(' ');
  };
</script>

<div class={getStatusClasses()}>
  <span class="status-dot"></span>
  {#if text}
    <span class="status-text">{text}</span>
  {/if}
</div>

<style>
  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Courier New", Courier, monospace;
    font-weight: bold;
  }

  .status-dot {
    border-radius: 50%;
    flex-shrink: 0;
  }

  .status-text {
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  /* Size variants */
  .size-sm .status-dot {
    width: 8px;
    height: 8px;
  }

  .size-sm .status-text {
    font-size: 0.75rem;
  }

  .size-md .status-dot {
    width: 12px;
    height: 12px;
  }

  .size-md .status-text {
    font-size: 0.9rem;
  }

  .size-lg .status-dot {
    width: 16px;
    height: 16px;
  }

  .size-lg .status-text {
    font-size: 1rem;
  }

  /* Status variants */
  .status-active .status-dot {
    background: var(--secondary-color);
    box-shadow: 0 0 10px var(--secondary-color);
  }

  .status-active .status-text {
    color: var(--secondary-color);
  }

  .status-inactive .status-dot {
    background: var(--text-color);
    opacity: 0.5;
  }

  .status-inactive .status-text {
    color: var(--text-color);
    opacity: 0.7;
  }

  .status-warning .status-dot {
    background: #fbbf24;
    box-shadow: 0 0 10px #fbbf24;
  }

  .status-warning .status-text {
    color: #fbbf24;
  }

  .status-error .status-dot {
    background: #ef4444;
    box-shadow: 0 0 10px #ef4444;
  }

  .status-error .status-text {
    color: #ef4444;
  }

  .status-loading .status-dot {
    background: var(--primary-color);
    box-shadow: 0 0 10px var(--primary-color);
  }

  .status-loading .status-text {
    color: var(--primary-color);
  }

  /* Animations */
  .animated.status-active .status-dot {
    animation: status-pulse 2s ease-in-out infinite;
  }

  .animated.status-warning .status-dot {
    animation: status-warning-pulse 1.5s ease-in-out infinite;
  }

  .animated.status-error .status-dot {
    animation: status-error-pulse 1s ease-in-out infinite;
  }

  .animated.status-loading .status-dot {
    animation: status-loading-spin 1s linear infinite;
  }

  @keyframes status-pulse {
    0%, 100% { 
      opacity: 1;
      transform: scale(1);
      box-shadow: 0 0 0 0 var(--secondary-color);
    }
    50% { 
      opacity: 0.8;
      transform: scale(1.1);
      box-shadow: 0 0 0 8px transparent;
    }
  }

  @keyframes status-warning-pulse {
    0%, 100% { 
      opacity: 1;
      box-shadow: 0 0 0 0 #fbbf24;
    }
    50% { 
      opacity: 0.7;
      box-shadow: 0 0 0 6px transparent;
    }
  }

  @keyframes status-error-pulse {
    0%, 100% { 
      opacity: 1;
      box-shadow: 0 0 0 0 #ef4444;
    }
    50% { 
      opacity: 0.8;
      box-shadow: 0 0 0 4px transparent;
    }
  }

  @keyframes status-loading-spin {
    0% { 
      transform: rotate(0deg);
      border-radius: 50%;
    }
    25% { 
      border-radius: 30% 70% 70% 30%;
    }
    50% { 
      transform: rotate(180deg);
      border-radius: 50%;
    }
    75% { 
      border-radius: 70% 30% 30% 70%;
    }
    100% { 
      transform: rotate(360deg);
      border-radius: 50%;
    }
  }
</style>
