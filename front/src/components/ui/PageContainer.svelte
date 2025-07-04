<script lang="ts">
  interface Props {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    className?: string;
    children?: any;
  }
  
  let {
    maxWidth = 'lg',
    padding = 'md',
    className = '',
    children
  }: Props = $props();

  const getContainerClasses = () => {
    let classes = ['page-container'];
    
    // Max width classes
    if (maxWidth === 'sm') classes.push('max-w-sm');
    else if (maxWidth === 'md') classes.push('max-w-md');
    else if (maxWidth === 'lg') classes.push('max-w-lg');
    else if (maxWidth === 'xl') classes.push('max-w-xl');
    else if (maxWidth === 'full') classes.push('max-w-full');
    
    // Padding classes
    if (padding === 'sm') classes.push('padding-sm');
    else if (padding === 'md') classes.push('padding-md');
    else if (padding === 'lg') classes.push('padding-lg');
    else if (padding === 'none') classes.push('padding-none');
    
    if (className) classes.push(className);
    
    return classes.join(' ');
  };
</script>

<div class={getContainerClasses()}>
  {@render children?.()}
</div>

<style>
  .page-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100%;
    background-color: var(--les-bg-primary);
    color: var(--les-text-primary);
    font-family: "Courier New", Courier, monospace;
    margin: 0 auto;
    border: 2px solid var(--les-border-primary);
    box-shadow: 0 0 25px var(--les-accent-primary) inset;
    position: relative;
    overflow-x: hidden;
  }

  /* Max width variants */
  .max-w-sm {
    max-width: 600px;
  }

  .max-w-md {
    max-width: 800px;
  }

  .max-w-lg {
    max-width: 1200px;
  }

  .max-w-xl {
    max-width: 1400px;
  }

  .max-w-full {
    max-width: 100%;
  }

  /* Padding variants */
  .padding-none {
    padding: 0;
  }

  .padding-sm {
    padding: 1rem;
  }

  .padding-md {
    padding: 2rem;
  }

  .padding-lg {
    padding: 3rem;
  }

  /* Cyberpunk background effect */
  .page-container::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  .page-container > :global(*) {
    position: relative;
    z-index: 1;
  }

  /* Responsive adjustments */
  @media (max-width: 768px) {
    .padding-md {
      padding: 1.5rem;
    }
    
    .padding-lg {
      padding: 2rem;
    }
  }

  @media (max-width: 480px) {
    .padding-sm {
      padding: 0.8rem;
    }
    
    .padding-md {
      padding: 1rem;
    }
    
    .padding-lg {
      padding: 1.5rem;
    }
  }
</style>
