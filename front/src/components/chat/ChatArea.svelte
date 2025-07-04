<script lang="ts">
  interface Props {
    room: any | null;
    showOnMobile?: boolean;
    onBackToRooms?: () => void;
    onSendMessage?: (message: string) => void;
  }

  let {
    room,
    showOnMobile = true,
    onBackToRooms,
    onSendMessage
  }: Props = $props();

  let newMessage = $state('');

  function sendMessage() {
    if (newMessage.trim() && onSendMessage) {
      onSendMessage(newMessage.trim());
      newMessage = '';
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      sendMessage();
    }
  }
</script>

<section class="chat-area" class:mobile-hidden={!showOnMobile}>
  {#if room}
    <!-- Chat Header -->
    <div class="chat-area-header">
      <button class="mobile-back-btn" onclick={onBackToRooms}>
        ← КАНАЛЫ
      </button>
      <h2 class="chat-title">{room.name}</h2>
      <div class="chat-status">
        <span class="status-dot active"></span>
        АКТИВЕН
      </div>
    </div>

    <!-- Messages Area -->
    <div class="messages-area">
      {#each Object.values(room.messages) as message}
        <div class="message">
          <div class="message-content">{message.text}</div>
          <div class="message-time">
            {new Date(message.created_date).toLocaleTimeString()}
          </div>
        </div>
      {/each}
      
      {#if Object.keys(room.messages).length === 0}
        <div class="no-messages">
          <div class="no-messages-icon">💭</div>
          <p>Начните общение в защищенном канале</p>
        </div>
      {/if}
    </div>

    <!-- Message Input -->
    <div class="message-input-area">
      <div class="input-container">
        <input
          type="text"
          bind:value={newMessage}
          placeholder="Введите сообщение..."
          class="message-input"
          onkeydown={handleKeydown}
        />
        <button 
          class="send-button" 
          onclick={sendMessage}
          disabled={!newMessage.trim()}
        >
          ОТПРАВИТЬ
        </button>
      </div>
    </div>
  {:else}
    <!-- No Room Selected -->
    <div class="no-room-selected">
      <div class="no-room-icon">💬</div>
      <h3 class="no-room-title">ВЫБЕРИТЕ КАНАЛ</h3>
      <p class="no-room-description">Выберите канал из списка для начала общения</p>
    </div>
  {/if}
</section>

<style>
  .chat-area {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .chat-area-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    border-bottom: 1px solid var(--les-border-primary);
    background: var(--les-bg-secondary);
  }

  .mobile-back-btn {
    display: none;
    background: transparent;
    border: 1px solid var(--les-border-primary);
    color: var(--les-accent-secondary);
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .mobile-back-btn:hover {
    color: var(--les-accent-primary);
    border-color: var(--les-accent-primary);
  }

  .chat-title {
    flex: 1;
    color: var(--les-accent-primary);
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0;
    text-shadow: 0 0 5px var(--les-accent-primary);
  }

  .chat-status {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--les-accent-secondary);
    font-size: 0.8rem;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--les-accent-secondary);
    animation: status-pulse 2s ease-in-out infinite;
  }

  @keyframes status-pulse {
    0%, 100% { 
      opacity: 1;
      box-shadow: 0 0 0 0 var(--les-accent-secondary);
    }
    50% { 
      opacity: 0.7;
      box-shadow: 0 0 0 6px transparent;
    }
  }

  .messages-area {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
    background: rgba(0, 0, 0, 0.1);
  }

  .message {
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--les-bg-secondary);
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    border-left: 3px solid var(--les-accent-primary);
  }

  .message-content {
    color: var(--les-text-primary);
    margin-bottom: 0.5rem;
    line-height: 1.4;
  }

  .message-time {
    color: var(--les-text-secondary);
    font-size: 0.7rem;
  }

  .no-messages {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--les-text-secondary);
  }

  .no-messages-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .message-input-area {
    padding: 1rem;
    border-top: 1px solid var(--les-border-primary);
    background: var(--les-bg-secondary);
  }

  .input-container {
    display: flex;
    gap: 1rem;
  }

  .message-input {
    flex: 1;
    padding: 0.8rem;
    background: var(--les-bg-primary);
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    color: var(--les-text-primary);
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9rem;
  }

  .message-input:focus {
    outline: none;
    border-color: var(--les-accent-primary);
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
  }

  .send-button {
    padding: 0.8rem 1.5rem;
    background: transparent;
    border: 1px solid var(--les-accent-primary);
    color: var(--les-accent-primary);
    border-radius: 4px;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.8rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .send-button:hover:not(:disabled) {
    background: var(--les-accent-primary);
    color: var(--les-bg-primary);
    box-shadow: 0 0 15px rgba(0, 255, 157, 0.4);
  }

  .send-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .no-room-selected {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--les-text-secondary);
  }

  .no-room-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .no-room-title {
    color: var(--les-accent-primary);
    font-size: 1.2rem;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    letter-spacing: 1px;
  }

  .no-room-description {
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.7;
  }

  /* Scrollbar */
  .messages-area::-webkit-scrollbar {
    width: 6px;
  }

  .messages-area::-webkit-scrollbar-track {
    background: var(--les-bg-secondary);
    border-radius: 3px;
  }

  .messages-area::-webkit-scrollbar-thumb {
    background: var(--les-accent-primary);
    border-radius: 3px;
    box-shadow: 0 0 3px var(--les-accent-primary);
  }

  .messages-area::-webkit-scrollbar-thumb:hover {
    background: var(--les-accent-secondary);
    box-shadow: 0 0 5px var(--les-accent-secondary);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .chat-area {
      width: 100%;
    }

    .mobile-hidden {
      display: none;
    }

    .mobile-back-btn {
      display: block;
    }

    .chat-area-header {
      padding: 1rem;
    }

    .message {
      padding: 0.8rem;
    }

    .message-input-area {
      padding: 0.8rem;
    }

    .input-container {
      gap: 0.5rem;
    }

    .send-button {
      padding: 0.8rem 1rem;
      font-size: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    .message-content {
      font-size: 0.8rem;
    }

    .message-input {
      font-size: 0.8rem;
    }
  }
</style>
