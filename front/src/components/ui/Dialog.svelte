<script lang="ts">
  import { Button } from '.';
  import layoutStyles from '../../styles/modules/layout.module.css';
  
  interface Props {
    open: boolean;
    onClose: () => void;
    title?: string;
    children?: any;
  }
  
  let { open, onClose, title, children }: Props = $props();
</script>

{#if open}
  <div class={`${layoutStyles.fixed} ${layoutStyles.z50}`} style="top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5);" onclick={onClose}>
    <div class={`${layoutStyles.flexCenter} ${layoutStyles.hFull}`}>
      <div class="dialog" onclick={(e) => e.stopPropagation()}>
        {#if title}
          <div class="dialog-header">
            <h3>{title}</h3>
            <Button onclick={onClose} variant="ghost" size="sm">✕</Button>
          </div>
        {/if}
        
        <div class="dialog-content">
          {@render children?.()}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .dialog {
    background: var(--les-bg-secondary);
    border: 1px solid var(--les-border-primary);
    border-radius: 8px;
    padding: 1.5rem;
    min-width: 300px;
    max-width: 90vw;
    max-height: 90vh;
    overflow-y: auto;
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .dialog-header h3 {
    margin: 0;
    color: var(--les-text-primary);
  }

  .dialog-content {
    color: var(--les-text-primary);
  }
</style>
