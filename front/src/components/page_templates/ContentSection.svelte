<script lang="ts">
  interface Props {
    title: string;
    description?: string;
    children: any;
  }

  let {
    title,
    description = "",
    children
  }: Props = $props();
</script>

<div class="content-wrapper">
  <div class="content-header">
    <h2 class="section-title">{title}</h2>
    {#if description}
      <p class="section-description">{description}</p>
    {/if}
  </div>

  <div class="content-body">
    {@render children()}
  </div>
</div>

<style>
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

  /* Responsive */
  @media (max-width: 768px) {
    .content-body {
      padding: 1.5rem;
    }
    
    .section-title {
      font-size: 1.5rem;
    }
  }
</style>
