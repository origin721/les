<script lang="ts">
  import { events_store } from "../../../processes/create_my_events/events_store";
  import { Link, ROUTES } from "../../../routing";
  import { search_params_to_string } from "../../../core";
  import { QUERY_PARAMS } from "../../../routing/constants";
  import { theme } from "../../../stores/theme";

  // Состояние для мобильного вида
  let showRoomsList = $state(true);
  let selectedRoomId = $state<string | null>(null);
  let newMessage = $state('');

  // Получаем выбранную комнату
  let selectedRoom = $derived(
    selectedRoomId ? events_store.get_room_by_id(selectedRoomId) : null
  );

  // Функция для отправки сообщения
  function sendMessage() {
    if (newMessage.trim() && selectedRoomId) {
      events_store.add_message({
        roomId: selectedRoomId,
        message: newMessage.trim(),
      });
      newMessage = '';
    }
  }

  // Функция для выбора комнаты
  function selectRoom(roomId: string) {
    selectedRoomId = roomId;
    // На мобильных скрываем список комнат при выборе
    if (window.innerWidth < 768) {
      showRoomsList = false;
    }
  }

  // Функция для возврата к списку комнат на мобильных
  function backToRooms() {
    showRoomsList = true;
    selectedRoomId = null;
  }

  // Добавим тестовую комнату если их нет
  $effect(() => {
    if (Object.keys($events_store.rooms).length === 0) {
      events_store.add_room({ name: 'Общий чат' });
      events_store.add_room({ name: 'Техподдержка' });
    }
  });
</script>

<div class="chat-container" data-widget-name="ChatRoomsPage" data-theme="{$theme}">
  <!-- Header -->
  <header class="chat-header">
    <div class="animated-title-container">
      <div class="matrix-rain">
        {#each Array(12) as _, i}
          <div class="matrix-column" style="animation-delay: {i * 0.15}s;">
            {#each Array(6) as _, j}
              <span class="matrix-char" style="animation-delay: {(i * 0.15) + (j * 0.08)}s;">
                {String.fromCharCode(48 + Math.floor(Math.random() * 10))}
              </span>
            {/each}
          </div>
        {/each}
      </div>
      
      <h1 class="animated-title">
        <span class="title-word glitch-word" style="animation-delay: 0s;">SECURE</span>
        <span class="title-separator">_</span>
        <span class="title-word glitch-word" style="animation-delay: 0.4s;">CHAT</span>
        <span class="title-separator">_</span>
        <span class="title-word glitch-word" style="animation-delay: 0.8s;">SYSTEM</span>
      </h1>
      
      <div class="subtitle">
        <span class="typing-text">ТЕРМИНАЛ_ЗАЩИЩЕННОЙ_СВЯЗИ</span>
        <span class="cursor">█</span>
      </div>
      
      <div class="status-indicator">
        <span class="status-dot active"></span>
        <span class="status-text">КАНАЛЫ АКТИВНЫ</span>
      </div>
    </div>

    <div class="header-controls">
      <Link href={ROUTES.HOME} className="back-button">
        ← ГЛАВНАЯ
      </Link>
    </div>
  </header>

  <!-- Main Content -->
  <main class="chat-content">
    <!-- Rooms List (Component 1) -->
    <aside class="rooms-sidebar" class:mobile-hidden={!showRoomsList}>
      <div class="sidebar-header">
        <h3 class="sidebar-title">// КАНАЛЫ //</h3>
        <Link href={ROUTES.CHAT_ROOMS_ADD} className="add-room-btn">
          + НОВЫЙ
        </Link>
      </div>
      
      <div class="rooms-list">
        {#each Object.values($events_store.rooms) as room (room.room_id)}
          <button 
            class="room-item" 
            class:active={selectedRoomId === room.room_id}
            onclick={() => selectRoom(room.room_id)}
          >
            <div class="room-icon">💬</div>
            <div class="room-info">
              <div class="room-name">{room.name}</div>
              <div class="room-status">
                {Object.keys(room.messages).length} сообщений
              </div>
            </div>
            <div class="room-arrow">→</div>
          </button>
        {/each}
        
        {#if Object.values($events_store.rooms).length === 0}
          <div class="empty-rooms">
            <div class="empty-icon">📡</div>
            <p class="empty-text">НЕТ КАНАЛОВ</p>
          </div>
        {/if}
      </div>
    </aside>

    <!-- Chat Area (Component 2 & 3) -->
    <section class="chat-area" class:mobile-hidden={showRoomsList}>
      {#if selectedRoom}
        <!-- Chat Header -->
        <div class="chat-area-header">
          <button class="mobile-back-btn" onclick={backToRooms}>
            ← КАНАЛЫ
          </button>
          <h2 class="chat-title">{selectedRoom.name}</h2>
          <div class="chat-status">
            <span class="status-dot active"></span>
            АКТИВЕН
          </div>
        </div>

        <!-- Messages Area (Component 2) -->
        <div class="messages-area">
          {#each Object.values(selectedRoom.messages) as message}
            <div class="message">
              <div class="message-content">{message.text}</div>
              <div class="message-time">
                {new Date(message.created_date).toLocaleTimeString()}
              </div>
            </div>
          {/each}
          
          {#if Object.keys(selectedRoom.messages).length === 0}
            <div class="no-messages">
              <div class="no-messages-icon">💭</div>
              <p>Начните общение в защищенном канале</p>
            </div>
          {/if}
        </div>

        <!-- Message Input (Component 3) -->
        <div class="message-input-area">
          <div class="input-container">
            <input
              type="text"
              bind:value={newMessage}
              placeholder="Введите сообщение..."
              class="message-input"
              onkeydown={(e) => e.key === 'Enter' && sendMessage()}
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
  </main>

  <!-- Footer -->
  <footer class="chat-footer">
    <div class="footer-info">
      <span class="footer-version">// SECURE_CHAT_TERMINAL_v1.0.0 //</span>
      <span class="footer-status">STATUS: OPERATIONAL</span>
    </div>
  </footer>
</div>

<style>
  /* Сброс отступов для всей страницы */
  :global(body) {
    margin: 0;
    padding: 0;
    overflow-x: hidden;
  }

  .chat-container {
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

  /* Header */
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    border-bottom: 1px solid var(--les-border-primary);
    min-height: 10rem;
    position: relative;
    overflow: hidden;
  }

  /* Animated Title */
  .animated-title-container {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    z-index: 5;
  }

  .matrix-rain {
    position: absolute;
    top: -2rem;
    left: -6rem;
    right: -6rem;
    bottom: -2rem;
    overflow: hidden;
    opacity: 0.1;
    z-index: 1;
  }

  .matrix-column {
    position: absolute;
    top: 0;
    width: 1rem;
    height: 100%;
    animation: matrix-fall 4s linear infinite;
  }

  .matrix-column:nth-child(odd) {
    left: calc(var(--i, 0) * 8.33%);
  }

  .matrix-column:nth-child(even) {
    left: calc(var(--i, 0) * 8.33% + 4.16%);
  }

  .matrix-char {
    display: block;
    color: var(--les-accent-primary);
    font-size: 0.8rem;
    line-height: 1.4;
    animation: matrix-glow 3s ease-in-out infinite alternate;
  }

  @keyframes matrix-fall {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100vh); }
  }

  @keyframes matrix-glow {
    0% { opacity: 0.2; }
    100% { opacity: 0.8; }
  }

  .animated-title {
    font-size: 2.5rem;
    font-weight: bold;
    margin: 0;
    position: relative;
    z-index: 2;
  }

  .title-word {
    display: inline-block;
    color: var(--les-accent-primary);
    text-shadow: 
      0 0 5px var(--les-accent-primary),
      0 0 10px var(--les-accent-primary),
      0 0 15px var(--les-accent-primary);
  }

  .glitch-word {
    animation: title-glitch 4s ease-in-out infinite;
    position: relative;
  }

  .title-separator {
    color: var(--les-accent-secondary);
    animation: separator-pulse 2s ease-in-out infinite;
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

  @keyframes separator-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.3; }
  }

  .subtitle {
    margin-top: 1rem;
    font-size: 1rem;
    color: var(--les-text-secondary);
  }

  .typing-text {
    animation: typing 5s steps(50) infinite;
    border-right: 2px solid var(--les-accent-secondary);
  }

  .cursor {
    animation: cursor-blink 1s infinite;
    color: var(--les-accent-secondary);
  }

  @keyframes typing {
    0%, 40% { width: 0; }
    80%, 100% { width: 100%; }
  }

  @keyframes cursor-blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-top: 1rem;
    justify-content: center;
  }

  .status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--les-accent-secondary);
    animation: status-pulse 2s ease-in-out infinite;
  }

  .status-text {
    color: var(--les-accent-secondary);
    font-size: 0.8rem;
    font-weight: bold;
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

  .header-controls {
    z-index: 10;
  }

  :global(.back-button) {
    color: var(--les-accent-secondary);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  :global(.back-button:hover) {
    color: var(--les-accent-primary);
    border-color: var(--les-accent-primary);
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
  }

  /* Content */
  .chat-content {
    flex: 1;
    display: flex;
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
  }

  /* Rooms Sidebar */
  .rooms-sidebar {
    width: 350px;
    display: flex;
    flex-direction: column;
    background: var(--les-bg-secondary);
    border-right: 1px solid var(--les-border-primary);
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.02);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--les-border-primary);
  }

  .sidebar-title {
    color: var(--les-accent-primary);
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 0 3px var(--les-accent-primary);
  }

  :global(.add-room-btn) {
    color: var(--les-accent-secondary);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: bold;
    padding: 0.5rem 1rem;
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    transition: all 0.3s ease;
  }

  :global(.add-room-btn:hover) {
    color: var(--les-accent-primary);
    border-color: var(--les-accent-primary);
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
  }

  .rooms-list {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
  }

  .room-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    margin-bottom: 0.5rem;
    background: transparent;
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--les-text-primary);
    font-family: "Courier New", Courier, monospace;
    width: 100%;
  }

  .room-item:hover {
    border-color: var(--les-accent-primary);
    box-shadow: 0 0 10px rgba(0, 255, 157, 0.3);
    background: rgba(0, 255, 157, 0.05);
  }

  .room-item.active {
    border-color: var(--les-accent-primary);
    background: rgba(0, 255, 157, 0.1);
    box-shadow: 0 0 15px rgba(0, 255, 157, 0.4);
  }

  .room-icon {
    font-size: 1.5rem;
    filter: drop-shadow(0 0 5px var(--les-accent-primary));
  }

  .room-info {
    flex: 1;
  }

  .room-name {
    color: var(--les-accent-primary);
    font-weight: bold;
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
  }

  .room-status {
    color: var(--les-text-secondary);
    font-size: 0.7rem;
  }

  .room-arrow {
    color: var(--les-accent-secondary);
    font-size: 1.2rem;
    transition: transform 0.3s ease;
  }

  .room-item:hover .room-arrow {
    transform: translateX(5px);
    color: var(--les-accent-primary);
  }

  .empty-rooms {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    color: var(--les-text-secondary);
  }

  .empty-icon {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
  }

  .empty-text {
    font-size: 0.8rem;
    margin: 0;
  }

  /* Chat Area */
  .chat-area {
    flex: 1;
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

  /* Footer */
  .chat-footer {
    padding: 1.5rem 2rem;
    border-top: 1px solid var(--les-border-primary);
    background: rgba(0, 0, 0, 0.3);
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

  /* Scrollbar */
  .rooms-list::-webkit-scrollbar,
  .messages-area::-webkit-scrollbar {
    width: 6px;
  }

  .rooms-list::-webkit-scrollbar-track,
  .messages-area::-webkit-scrollbar-track {
    background: var(--les-bg-secondary);
    border-radius: 3px;
  }

  .rooms-list::-webkit-scrollbar-thumb,
  .messages-area::-webkit-scrollbar-thumb {
    background: var(--les-accent-primary);
    border-radius: 3px;
    box-shadow: 0 0 3px var(--les-accent-primary);
  }

  .rooms-list::-webkit-scrollbar-thumb:hover,
  .messages-area::-webkit-scrollbar-thumb:hover {
    background: var(--les-accent-secondary);
    box-shadow: 0 0 5px var(--les-accent-secondary);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .chat-content {
      position: relative;
    }

    .rooms-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
    }

    .chat-area {
      width: 100%;
    }

    .mobile-hidden {
      display: none;
    }

    .mobile-back-btn {
      display: block;
    }

    .animated-title {
      font-size: 2rem;
    }

    .chat-header {
      padding: 1.5rem;
      min-height: 8rem;
    }

    .sidebar-header,
    .chat-area-header {
      padding: 1rem;
    }

    .rooms-list {
      padding: 0.5rem;
    }

    .room-item {
      padding: 0.8rem;
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
    .animated-title {
      font-size: 1.5rem;
    }

    .subtitle {
      font-size: 0.8rem;
    }

    .chat-header {
      padding: 1rem;
    }

    .room-name {
      font-size: 0.8rem;
    }

    .room-status {
      font-size: 0.6rem;
    }

    .message-content {
      font-size: 0.8rem;
    }

    .message-input {
      font-size: 0.8rem;
    }
  }
</style>
