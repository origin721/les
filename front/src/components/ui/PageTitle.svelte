<script lang="ts">
  interface Props {
    title: string;
    subtitle?: string;
    animated?: boolean;
    glitch?: boolean;
    className?: string;
  }
  
  let {
    title,
    subtitle,
    animated = true,
    glitch = true,
    className = ''
  }: Props = $props();
</script>

<div class="page-title-container {className}">
  <h1 class="page-title" class:glitch-title={glitch} class:animated-title={animated}>
    {title}
  </h1>
  {#if subtitle}
    <div class="page-subtitle">
      <span class="typing-text">{subtitle}</span>
      <span class="cursor">█</span>
    </div>
  {/if}
</div>

<style>
  .page-title-container {
    text-align: center;
    margin-bottom: 2rem;
  }

  .page-title {
    font-family: "Courier New", Courier, monospace;
    font-size: 2.5rem;
    font-weight: bold;
    color: var(--les-accent-primary);
    text-shadow: 
      0 0 5px var(--les-accent-primary),
      0 0 10px var(--les-accent-primary),
      0 0 15px var(--les-accent-primary);
    margin: 0;
    letter-spacing: 3px;
  }

  .glitch-title {
    animation: title-glitch 4s ease-in-out infinite;
    position: relative;
  }

  .animated-title {
    animation: title-appear 1s ease-out;
  }

  .page-subtitle {
    margin-top: 1rem;
    font-family: "Courier New", Courier, monospace;
    font-size: 1rem;
    color: var(--les-text-secondary);
  }

  .typing-text {
    animation: typing 3s steps(50) infinite;
    border-right: 2px solid var(--les-accent-secondary);
  }

  .cursor {
    animation: cursor-blink 1s infinite;
    color: var(--les-accent-secondary);
  }

  @keyframes title-glitch {
    0%, 90%, 100% { 
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
    3% { 
      transform: translate(-2px, 2px);
      filter: hue-rotate(90deg);
    }
    6% { 
      transform: translate(2px, -2px);
      filter: hue-rotate(180deg);
    }
    9% { 
      transform: translate(-2px, -2px);
      filter: hue-rotate(270deg);
    }
    12% { 
      transform: translate(2px, 2px);
      filter: hue-rotate(360deg);
    }
    15% { 
      transform: translate(0);
      filter: hue-rotate(0deg);
    }
  }

  @keyframes title-appear {
    0% { 
      opacity: 0;
      transform: translateY(-20px);
    }
    100% { 
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes typing {
    0%, 40% { width: 0; }
    80%, 100% { width: 100%; }
  }

  @keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .page-title {
      font-size: 2rem;
      letter-spacing: 2px;
    }
    
    .page-subtitle {
      font-size: 0.9rem;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 1.8rem;
      letter-spacing: 1px;
    }
  }
</style>
