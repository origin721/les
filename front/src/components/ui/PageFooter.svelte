<script lang="ts">
  interface Props {
    version?: string;
    status?: string;
    className?: string;
  }

  let {
    version = "SECURE_MESSAGE_TERMINAL_v0.1.0",
    status = "STATUS: OPERATIONAL",
    className = ""
  }: Props = $props();
</script>

<footer class="page-footer {className}">
  <div class="footer-info">
    <span class="footer-version">// {version} //</span>
    <span class="footer-status">{status}</span>
  </div>
</footer>

<style>
  .page-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--les-border-primary);
    background: rgba(0, 0, 0, 0.3);
    font-family: "Courier New", Courier, monospace;
  }

  .footer-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1400px;
    margin: 0 auto;
    font-size: 0.8rem;
  }

  .footer-version {
    color: var(--les-text-secondary);
  }

  .footer-status {
    color: var(--les-accent-secondary);
    animation: status-blink 3s ease-in-out infinite;
  }

  @keyframes status-blink {
    0%, 90%, 100% { opacity: 1; }
    95% { opacity: 0.5; }
  }

  /* Responsive */
  @media (max-width: 768px) {
    .footer-info {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }
</style>
