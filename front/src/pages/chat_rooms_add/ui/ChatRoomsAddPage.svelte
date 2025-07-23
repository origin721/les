<script lang="ts">
  import { writable } from "svelte/store";
  import { Link, ROUTES } from "../../../routing";
  import { Button, Input, AnimatedTitle, PageFooter } from "../../../components/ui";
  import { submit_stop } from "../../../core/svelte_default";
  import { events_store } from "../../../processes/create_my_events/events_store";
  import { routingStore } from "../../../routing/stores";
  import { QUERY_PARAMS } from "../../../routing/constants";
  import { search_params_to_string } from "../../../core";
  import { theme } from "../../../stores/theme";
  import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { setQueryParam } from "../../../routing/stores/routing-store.create";

  const defaultRoomName = "no name";
  let name_field = writable("");
  let isSubmitting = $state(false);

  function handleSubmit() {
    if (isSubmitting || !$name_field?.trim()) return;
    
    isSubmitting = true;
    
    try {
      const room = events_store.add_room({name: $name_field.trim() || defaultRoomName});
        
      setQueryParam([
        [QUERY_PARAMS.ROOM_ID, room.roomId],
      ])
          
      routingStore.setRoute({hash: ROUTES.CHAT_ROOMS});
    } catch (error) {
      console.error("Ошибка при создании комнаты:", error);
      isSubmitting = false;
    }
  }

  function handleCancel() {
    routingStore.setRoute({hash: ROUTES.CHAT_ROOMS});
  }
</script>

<div class="add-room-container" 
     data-widget-name="ChatRoomsAddPage" 
     data-theme="{$theme}">
  
  <!-- Header -->
  <header class="add-room-header">
    <AnimatedTitle 
      title="CREATE_NEW_CHAT_ROOM"
      subtitle="СОЗДАНИЕ_НОВОЙ_КОМНАТЫ"
      statusText="СИСТЕМА АКТИВНА"
      className="add-room-title"
    />

    <div class="z-10">
      <ThemeSwitcher />
    </div>
  </header>

  <!-- Main Content -->
  <main class="add-room-content">
    <div class="max-w-2xl mx-auto">
      <!-- Navigation -->
      <div class="mb-8">
        <Link hash={ROUTES.CHAT_ROOMS} 
              className="inline-flex items-center gap-2 text-[var(--les-accent-primary)] hover:text-[var(--les-accent-secondary)] transition-colors duration-200 text-sm font-mono uppercase tracking-wider">
          <span class="text-lg">←</span>
          НАЗАД К ЧАТАМ
        </Link>
      </div>

      <!-- Form Card -->
      <div class="bg-[var(--les-bg-secondary)] border border-[var(--les-border-primary)] rounded-lg p-8 shadow-lg shadow-[var(--les-accent-primary)]/10">
        <div class="mb-6">
          <h2 class="text-2xl font-mono uppercase tracking-wider text-[var(--les-text-primary)] mb-2">
            💬 Новая комната
          </h2>
          <p class="text-[var(--les-text-secondary)] font-mono text-sm">
            Создайте новую безопасную комнату для общения
          </p>
        </div>

        <form onsubmit={submit_stop} class="space-y-6">
          <!-- Room Name Input -->
          <div class="space-y-2">
            <label for="room-name" class="block text-sm font-mono uppercase tracking-wider text-[var(--les-text-primary)]">
              Название комнаты *
            </label>
            <Input 
              id="room-name"
              bind:value={$name_field}
              placeholder={defaultRoomName}
              disabled={isSubmitting}
              onkeydown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <p class="text-xs text-[var(--les-text-secondary)] font-mono">
              Введите уникальное название для вашей комнаты
            </p>
          </div>

          <!-- Room Features Info -->
          <div class="bg-[var(--les-bg-primary)] border border-[var(--les-border-secondary)] rounded-lg p-4">
            <h3 class="text-sm font-mono uppercase tracking-wider text-[var(--les-accent-primary)] mb-3">
              🔒 Возможности комнаты
            </h3>
            <ul class="space-y-2 text-xs font-mono text-[var(--les-text-secondary)]">
              <li class="flex items-center gap-2">
                <span class="text-[var(--les-accent-primary)]">•</span>
                End-to-End шифрование сообщений
              </li>
              <li class="flex items-center gap-2">
                <span class="text-[var(--les-accent-primary)]">•</span>
                P2P соединение без серверов
              </li>
              <li class="flex items-center gap-2">
                <span class="text-[var(--les-accent-primary)]">•</span>
                Безопасное хранение истории
              </li>
              <li class="flex items-center gap-2">
                <span class="text-[var(--les-accent-primary)]">•</span>
                Управление участниками
              </li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-4 justify-end pt-4">
            <div class="min-w-[7.5rem]">
              <Button 
                onclick={handleCancel}
                variant="ghost"
                disabled={isSubmitting}
              >
                Отмена
              </Button>
            </div>
            <div class="min-w-[7.5rem] create-button">
              <Button 
                onclick={handleSubmit}
                disabled={isSubmitting || !$name_field?.trim()}
              >
                {#if isSubmitting}
                  Создание...
                {:else}
                  🚀 Создать
                {/if}
              </Button>
            </div>
          </div>
        </form>
      </div>

      <!-- Security Notice -->
      <div class="mt-8 bg-[var(--les-bg-warning)] border border-[var(--les-border-warning)] rounded-lg p-4">
        <div class="flex items-start gap-3">
          <span class="text-[var(--les-accent-warning)] text-lg mt-1">⚠️</span>
          <div>
            <h4 class="text-sm font-mono uppercase tracking-wider text-[var(--les-text-primary)] mb-1">
              Безопасность
            </h4>
            <p class="text-xs font-mono text-[var(--les-text-secondary)]">
              Все сообщения в комнате шифруются локально. Убедитесь, что вы доверяете участникам комнаты.
            </p>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <PageFooter />
</div>

<style>
  .add-room-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    width: 100vw;
    background-color: var(--les-bg-primary);
    color: var(--les-text-primary);
    font-family: "Courier New", Courier, monospace;
    overflow-x: hidden;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    border: 2px solid var(--les-border-primary);
    box-shadow: 0 0 25px var(--les-accent-primary) inset;
  }

  .add-room-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid var(--les-border-primary);
    min-height: 12.5rem;
    position: relative;
    overflow: hidden;
  }

  .add-room-content {
    flex: 1;
    padding: 3rem 2rem;
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
  }

  :global(.add-room-title) {
    opacity: 0.7;
  }

  .create-button :global(button) {
    background-color: var(--les-accent-primary);
    color: var(--les-text-contrast);
    border-color: var(--les-accent-primary);
  }

  .create-button :global(button:hover:not(:disabled)) {
    background-color: var(--les-accent-secondary);
    border-color: var(--les-accent-secondary);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .add-room-header {
      padding: 1.5rem;
      min-height: 150px;
    }
    
    .add-room-content {
      padding: 2rem 1rem;
    }
  }
</style>
