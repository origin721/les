<script lang="ts">
  import { Link } from "../../routing";

  interface Props {
    href: string;
    title: string;
    icon: string;
    description: string;
    className?: string;
  }

  let {
    href,
    title,
    icon,
    description,
    className = ""
  }: Props = $props();
</script>

<Link href={href} className="menu-card {className}">
  <div class="menu-icon">{icon}</div>
  <h3 class="menu-title">{title}</h3>
  <p class="menu-description">{description}</p>
  <div class="menu-arrow">→</div>
</Link>

<style>
  :global(.menu-card) {
    display: block;
    background: var(--les-bg-secondary);
    border: 1px solid var(--les-border-primary);
    padding: 2rem;
    border-radius: 4px;
    text-decoration: none;
    color: var(--les-text-primary);
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.02);
    font-family: "Courier New", Courier, monospace;
  }

  :global(.menu-card::before) {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.5s;
  }

  :global(.menu-card:hover::before) {
    left: 100%;
  }

  :global(.menu-card:hover) {
    border-color: var(--les-accent-primary);
    box-shadow: 
      0 0 25px var(--les-accent-primary),
      inset 0 0 25px rgba(255, 255, 255, 0.05);
    transform: translateY(-5px);
  }

  .menu-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    text-align: center;
    filter: drop-shadow(0 0 10px var(--les-accent-primary));
  }

  .menu-title {
    color: var(--les-accent-primary);
    font-size: 1.3rem;
    margin-bottom: 0.8rem;
    text-align: center;
    font-weight: bold;
    text-shadow: 0 0 5px var(--les-accent-primary);
  }

  .menu-description {
    color: var(--les-text-secondary);
    font-size: 0.9rem;
    text-align: center;
    margin-bottom: 1.5rem;
    line-height: 1.4;
  }

  .menu-arrow {
    position: absolute;
    bottom: 1rem;
    right: 1.5rem;
    color: var(--les-accent-secondary);
    font-size: 1.5rem;
    font-weight: bold;
    transition: transform 0.3s ease;
  }

  :global(.menu-card:hover) .menu-arrow {
    transform: translateX(5px);
    color: var(--les-accent-primary);
  }

  /* Responsive */
  @media (max-width: 480px) {
    :global(.menu-card) {
      padding: 1.5rem;
    }
    
    .menu-icon {
      font-size: 2.5rem;
    }
    
    .menu-title {
      font-size: 1.1rem;
    }
  }
</style>
