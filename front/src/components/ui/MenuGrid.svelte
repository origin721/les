<script lang="ts">
  import MenuCard from "./MenuCard.svelte";

  interface MenuItem {
    href: string;
    title: string;
    icon: string;
    description: string;
  }

  interface Props {
    items: MenuItem[];
    className?: string;
  }

  let {
    items,
    className = ""
  }: Props = $props();
</script>

<div class="menu-grid {className}">
  {#each items as item}
    <MenuCard 
      href={item.href}
      title={item.title}
      icon={item.icon}
      description={item.description}
    />
  {/each}
</div>

<style>
  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .menu-grid {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }
  }
</style>
