<script lang="ts">
  import { PageContainer, PageTitle, Card, Button, Input, StatusIndicator } from '../../../components/ui';
  import { Link } from '../../../routing';
  import { theme } from '../../../stores/theme';
  import { 
    type ChatRoom, 
    type OptimizedMessageByIdDate,
    extractMessages,
    addMessageToStructure,
    getMessageStats
  } from '../services/chatService';

  // Состояние
  let rooms = $state<ChatRoom[]>([]);
  let selectedRoomId = $state<string | null>(null);
  let newRoomName = $state('');
  let isAddingRoom = $state(false);
  let showAddRoomDialog = $state(false);

  // Эффект для инициализации тестовых данных
  $effect(() => {
    // Создаем тестовые данные с новой оптимизированной структурой
    const testRooms: ChatRoom[] = [];
    
    // Общий чат с несколькими сообщениями
    const generalRoom: ChatRoom = {
      id: '1',
      sourceName: 'Общий чат',
      localName: 'ОБЩИЙ_ЧАТ',
      myAccId: 'user1',
      messageByIdDate: {}
    };
    
    // Добавляем тестовые сообщения с правильной структурой
    const now = Date.now();
    const messages = [
      {
        id: 'msg1',
        message: [{ type: 'text' as const, content: 'Добро пожаловать в систему!' }],
        timestamp: now - 3600000, // 1 час назад
        sender: 'system'
      },
      {
        id: 'msg2', 
        message: [{ type: 'text' as const, content: 'Система активна и готова к работе' }],
        timestamp: now - 1800000, // 30 минут назад
        sender: 'system'
      }
    ];
    
    messages.forEach(msg => addMessageToStructure(generalRoom.messageByIdDate, msg));
    testRooms.push(generalRoom);
    
    // Техподдержка
    const supportRoom: ChatRoom = {
      id: '2',
      sourceName: 'Техподдержка', 
      localName: 'TECH_SUPPORT_SECURE',
      myAccId: 'user1',
      messageByIdDate: {}
    };
    
    addMessageToStructure(supportRoom.messageByIdDate, {
      id: 'msg3',
      message: [{ type: 'text' as const, content: 'Канал техподдержки активен' }],
      timestamp: now - 900000, // 15 минут назад
      sender: 'system'
    });
    testRooms.push(supportRoom);
    
    // Разработка (пустая)
    testRooms.push({
      id: '3',
      sourceName: 'Разработка',
      localName: 'DEV_TERMINAL_001', 
      myAccId: 'user1',
      messageByIdDate: {}
    });
    
    rooms = testRooms;
    // Выбираем первую комнату по умолчанию
    if (rooms.length > 0) {
      selectedRoomId = rooms[0].id;
    }
  });

  // Добавление новой комнаты
  function addRoom() {
    if (!newRoomName.trim()) return;
    
    isAddingRoom = true;
    
    setTimeout(() => {
      const newRoom: ChatRoom = {
        id: Date.now().toString(),
        sourceName: newRoomName,
        localName: newRoomName.toUpperCase().replace(/\s+/g, '_'),
        myAccId: 'user1',
        messageByIdDate: {}
      };
      
      rooms = [...rooms, newRoom];
      selectedRoomId = newRoom.id;
      newRoomName = '';
      isAddingRoom = false;
      showAddRoomDialog = false;
    }, 500);
  }

  // Удаление комнаты
  function deleteRoom(id: string) {
    rooms = rooms.filter(room => room.id !== id);
    if (selectedRoomId === id) {
      selectedRoomId = rooms.length > 0 ? rooms[0].id : null;
    }
  }

  // Подсчет сообщений в комнате
  function getMessageCount(room: ChatRoom): number {
    return extractMessages(room).length;
  }

  // Получение статуса комнаты
  function getRoomStatus(room: ChatRoom): 'active' | 'inactive' {
    return getMessageCount(room) > 0 ? 'active' : 'inactive';
  }

  // Получение выбранной комнаты
  let selectedRoom = $derived(selectedRoomId ? rooms.find(room => room.id === selectedRoomId) : null);
</script>

<!-- Сброс отступов для всей страницы -->
<div class="chat-rooms-container" data-widget-name="ChatRoomsPage" data-theme="{$theme}">
  <!-- Header -->
  <header class="chat-rooms-header">
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
      <StatusIndicator status="active" text="СИСТЕМА АКТИВНА" />
      <div class="room-counter">
        <span class="counter-label">КАНАЛОВ:</span>
        <span class="counter-value">{rooms.length.toString().padStart(3, '0')}</span>
      </div>
    </div>
  </header>

  <!-- Main Content -->
  <main class="chat-rooms-content">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h3 class="sidebar-title">// КАНАЛЫ //</h3>
        <Button 
          onclick={() => showAddRoomDialog = true} 
          variant="primary" 
          size="sm"
        >
          + НОВЫЙ
        </Button>
      </div>
      
      <div class="rooms-list">
        {#each rooms as room (room.id)}
          <button 
            class="room-item {selectedRoomId === room.id ? 'active' : ''}"
            onclick={() => selectedRoomId = room.id}
          >
            <div class="room-item-header">
              <span class="room-item-name">{room.localName}</span>
              <StatusIndicator 
                status={getRoomStatus(room)} 
                size="sm"
              />
            </div>
            
            <div class="room-item-info">
              <span class="room-item-source">{room.sourceName}</span>
              <span class="room-item-count">{getMessageCount(room)} сообщений</span>
            </div>
            
            <div class="room-item-actions">
              <Link href={`/chat_rooms?room_id=${room.id}`} className="room-enter-link">
                ВОЙТИ →
              </Link>
            </div>
          </button>
        {/each}
        
        {#if rooms.length === 0}
          <div class="empty-rooms">
            <div class="empty-icon">📡</div>
            <p class="empty-text">НЕТ КАНАЛОВ</p>
          </div>
        {/if}
      </div>
    </aside>

    <!-- Main Area -->
    <section class="main-area">
      {#if selectedRoom}
        <Card variant="elevated" size="lg" className="room-details-card">
          <div class="room-details">
            <div class="room-details-header">
              <h2 class="room-details-title">{selectedRoom.localName}</h2>
              <Button 
                onclick={() => deleteRoom(selectedRoom.id)} 
                variant="danger" 
                size="sm"
              >
                УДАЛИТЬ
              </Button>
            </div>
            
            <div class="room-details-info">
              <div class="info-item">
                <span class="info-label">ИСТОЧНИК:</span>
                <span class="info-value">{selectedRoom.sourceName}</span>
              </div>
              <div class="info-item">
                <span class="info-label">ID:</span>
                <span class="info-value">{selectedRoom.id}</span>
              </div>
              <div class="info-item">
                <span class="info-label">АККАУНТ:</span>
                <span class="info-value">{selectedRoom.myAccId}</span>
              </div>
              <div class="info-item">
                <span class="info-label">СООБЩЕНИЙ:</span>
                <span class="info-value">{getMessageCount(selectedRoom)}</span>
              </div>
              <div class="info-item">
                <span class="info-label">СТАТУС:</span>
                <StatusIndicator 
                  status={getRoomStatus(selectedRoom)} 
                  text={getRoomStatus(selectedRoom) === 'active' ? 'АКТИВЕН' : 'НЕАКТИВЕН'}
                  size="sm"
                />
              </div>
            </div>
            
            <div class="room-actions">
              <Link href={`/chat_rooms?room_id=${selectedRoom.id}`}>
                <Button variant="primary" size="lg">
                  ВОЙТИ В КАНАЛ
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      {:else}
        <Card variant="elevated" size="lg" className="no-room-selected">
          <div class="no-room-content">
            <div class="no-room-icon">💬</div>
            <h3 class="no-room-title">ВЫБЕРИТЕ КАНАЛ</h3>
            <p class="no-room-description">Выберите канал из списка или создайте новый</p>
          </div>
        </Card>
      {/if}
    </section>
  </main>

  <!-- Add Room Dialog -->
  {#if showAddRoomDialog}
    <div class="dialog-overlay" onclick={() => showAddRoomDialog = false}>
      <div class="dialog" onclick={(e) => e.stopPropagation()}>
        <Card variant="elevated" size="md">
          <div class="dialog-header">
            <h3 class="dialog-title">// СОЗДАТЬ_КАНАЛ //</h3>
            <Button 
              onclick={() => showAddRoomDialog = false} 
              variant="secondary" 
              size="sm"
            >
              ✕
            </Button>
          </div>
          
          <div class="dialog-content">
            <div class="input-group">
              <label class="input-label">НАЗВАНИЕ КАНАЛА:</label>
              <Input
                bind:value={newRoomName}
                placeholder="ВВЕДИТЕ_НАЗВАНИЕ"
                size="md"
                disabled={isAddingRoom}
                onkeydown={(e) => e.key === 'Enter' && addRoom()}
              />
            </div>
            
            <div class="dialog-actions">
              <Button 
                onclick={addRoom} 
                variant="primary" 
                size="md"
                disabled={!newRoomName.trim() || isAddingRoom}
                loading={isAddingRoom}
              >
                {isAddingRoom ? 'СОЗДАНИЕ...' : 'СОЗДАТЬ'}
              </Button>
              
              <Button 
                onclick={() => showAddRoomDialog = false} 
                variant="secondary" 
                size="md"
              >
                ОТМЕНА
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  {/if}

  <!-- Footer -->
  <footer class="chat-rooms-footer">
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

  .chat-rooms-container {
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
  .chat-rooms-header {
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
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }

  .room-counter {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-family: "Courier New", Courier, monospace;
  }

  .counter-label {
    color: var(--les-text-secondary);
    font-size: 0.8rem;
  }

  .counter-value {
    color: var(--les-accent-primary);
    font-size: 1rem;
    font-weight: bold;
    text-shadow: 0 0 5px var(--les-accent-primary);
  }

  /* Content */
  .chat-rooms-content {
    flex: 1;
    display: flex;
    gap: 1rem;
    padding: 2rem;
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
  }

  /* Sidebar */
  .sidebar {
    width: 350px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: var(--les-bg-secondary);
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    padding: 1.5rem;
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.02);
  }

  .sidebar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .sidebar-title {
    color: var(--les-accent-primary);
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 0 3px var(--les-accent-primary);
  }

  /* Rooms List */
  .rooms-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 60vh;
    overflow-y: auto;
  }

  .room-item {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: transparent;
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s ease;
    color: var(--les-text-primary);
    text-align: left;
    font-family: "Courier New", Courier, monospace;
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

  .room-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .room-item-name {
    color: var(--les-accent-primary);
    font-weight: bold;
    font-size: 0.9rem;
    letter-spacing: 1px;
  }

  .room-item-info {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
  }

  .room-item-source {
    color: var(--les-text-secondary);
    font-size: 0.7rem;
  }

  .room-item-count {
    color: var(--les-text-secondary);
    font-size: 0.7rem;
    opacity: 0.8;
  }

  .room-item-actions {
    margin-top: 0.5rem;
  }

  :global(.room-enter-link) {
    color: var(--les-accent-secondary);
    text-decoration: none;
    font-size: 0.8rem;
    font-weight: bold;
    transition: color 0.3s ease;
  }

  :global(.room-enter-link:hover) {
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

  /* Main Area */
  .main-area {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :global(.room-details-card),
  :global(.no-room-selected) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .room-details {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .room-details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--les-border-primary);
  }

  .room-details-title {
    color: var(--les-accent-primary);
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 0 5px var(--les-accent-primary);
  }

  .room-details-info {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
    padding: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
  }

  .info-label {
    color: var(--les-text-secondary);
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .info-value {
    color: var(--les-accent-secondary);
    font-size: 0.9rem;
    font-weight: bold;
  }

  .room-actions {
    margin-top: auto;
    display: flex;
    justify-content: center;
    padding-top: 2rem;
  }

  /* No Room Selected */
  .no-room-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
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

  /* Dialog */
  .dialog-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .dialog {
    max-width: 500px;
    width: 90%;
    animation: dialog-appear 0.3s ease-out;
  }

  @keyframes dialog-appear {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .dialog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .dialog-title {
    color: var(--les-accent-primary);
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 0 3px var(--les-accent-primary);
  }

  .dialog-content {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-label {
    color: var(--les-accent-secondary);
    font-size: 0.9rem;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .dialog-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
  }

  /* Footer */
  .chat-rooms-footer {
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
  .rooms-list::-webkit-scrollbar {
    width: 6px;
  }

  .rooms-list::-webkit-scrollbar-track {
    background: var(--les-bg-secondary);
    border-radius: 3px;
  }

  .rooms-list::-webkit-scrollbar-thumb {
    background: var(--les-accent-primary);
    border-radius: 3px;
    box-shadow: 0 0 3px var(--les-accent-primary);
  }

  .rooms-list::-webkit-scrollbar-thumb:hover {
    background: var(--les-accent-secondary);
    box-shadow: 0 0 5px var(--les-accent-secondary);
  }

  /* Responsive */
  @media (max-width: 1200px) {
    .sidebar {
      width: 300px;
    }
  }

  @media (max-width: 968px) {
    .chat-rooms-content {
      flex-direction: column;
    }
    
    .sidebar {
      width: 100%;
      max-height: 300px;
    }
    
    .animated-title {
      font-size: 2rem;
    }
    
    .chat-rooms-header {
      padding: 1.5rem;
      min-height: 8rem;
    }
    
    .header-controls {
      align-items: center;
    }
  }

  @media (max-width: 768px) {
    .animated-title {
      font-size: 1.8rem;
    }
    
    .chat-rooms-header {
      flex-direction: column;
      gap: 1rem;
      min-height: auto;
    }
    
    .animated-title-container {
      position: relative;
      top: auto;
      left: auto;
      transform: none;
    }
    
    .header-controls {
      flex-direction: row;
      gap: 2rem;
    }
    
    .chat-rooms-content {
      padding: 1rem;
    }
    
    .sidebar {
      padding: 1rem;
    }
    
    .room-details-info {
      grid-template-columns: 1fr;
    }
    
    .dialog-actions {
      flex-direction: column;
    }
    
    .footer-info {
      flex-direction: column;
      gap: 0.5rem;
      text-align: center;
    }
  }

  @media (max-width: 480px) {
    .animated-title {
      font-size: 1.5rem;
    }
    
    .subtitle {
      font-size: 0.8rem;
    }
    
    .chat-rooms-content {
      padding: 0.5rem;
      gap: 0.5rem;
    }
    
    .room-item {
      padding: 0.8rem;
    }
    
    .room-item-name {
      font-size: 0.8rem;
    }
    
    .dialog {
      width: 95%;
    }
  }
</style>
