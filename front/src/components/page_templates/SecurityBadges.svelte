<script lang="ts">
  interface Badge {
    icon: string;
    text: string;
  }

  interface Props {
    badges: Badge[];
  }

  let { badges }: Props = $props();
</script>

<div class="security-badges">
  {#each badges as badge}
    <div class="security-badge">
      <span class="badge-icon">{badge.icon}</span>
      <span class="badge-text">{badge.text}</span>
    </div>
  {/each}
</div>

<style>
  .security-badges {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .security-badge {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0.8rem;
    background: rgba(0, 0, 0, 0.5);
    border: 1px solid var(--border-color);
    border-radius: 2px;
    font-size: 0.8rem;
    animation: badge-glow 3s ease-in-out infinite alternate;
  }

  .badge-icon {
    font-size: 1rem;
  }

  .badge-text {
    color: var(--accent-color);
    font-weight: bold;
  }

  @keyframes badge-glow {
    0% { box-shadow: 0 0 5px transparent; }
    100% { box-shadow: 0 0 10px var(--accent-color); }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .security-badges {
      gap: 0.5rem;
    }
  }
</style>
