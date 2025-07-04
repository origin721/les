<script lang="ts">
  import { PageTitle, Card, Button, Input, StatusIndicator } from '../../../components/ui';
  import { Link } from '../../../routing';
  import { routingStore } from '../../../routing/stores';
  import { theme } from '../../../stores/theme';
  import { 
    type Message, 
    type ChatRoom, 
    extractMessages, 
    addMessageToStructure, 
    createTestChatRoom 
  } from '../services/chatService';

  // Состояние
  let room = $state<ChatRoom | null>(null);
  let messages = $state<Message[]>([]);
  let newMessage = $state('');
  let isSending = $state(false);
  let connectionStatus = $state<'active' | 'inactive' | 'loading'>('loading');

  // Эффект для загрузки комнаты и сообщений
  $effect(() => {
    const url = new URL(window.location.href);
    const roomId = url.searchParams.get('room_id');
    
    if (roomId) {
      // Симуляция загрузки данных комнаты
      setTimeout(() => {
        // Создаем тестовую комнату с оптимизированной структурой данных
        room = createTestChatRoom(roomId);

        // Извлекаем сообщения из структуры данных
        if (room) {
          messages = extractMessages(room);
        }
        connectionStatus = 'active';
      }, 500);
    }
  });

  // Отправка сообщения
  function sendMessage() {
    if (!newMessage.trim() || isSending || !room) return;
    
    isSending = true;
    
    // Имитация отправки сообщения
    setTimeout(() => {
      const message: Message = {
        id: `msg_${Date.now()}`,
        message: [{ type: 'text' as const, content: newMessage }],
        timestamp: Date.now(),
        sender: 'user1'
      };
      
      // Добавляем сообщение в структуру данных комнаты
      if (room) {
        addMessageToStructure(room.messageByIdDate, message);
        // Обновляем массив сообщений для UI
        messages = extractMessages(room);
      }
      
      newMessage = '';
      isSending = false;
      
      // Автопрокрутка вниз
      setTimeout(() => {
        const messagesContainer = document.querySelector('.messages-container');
        if (messagesContainer) {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
      }, 100);
    }, 300);
  }

  // Форматирование времени
  function formatTime(timestamp?: number): string {
    if (!timestamp) return '--:--';
    
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Получение класса отправителя
  function getSenderClass(sender?: string): string {
    if (sender === 'system') return 'system';
    if (sender === 'user1') return 'own';
    return 'other';
  }

  // Получение имени отправителя
  function getSenderName(sender?: string): string {
    if (sender === 'system') return 'СИСТЕМА';
    if (sender === 'user1') return 'ВЫ';
    return `ПОЛЬЗОВАТЕЛЬ_${sender?.toUpperCase() || 'UNKNOWN'}`;
  }
</script>

<div class="chat-container" data-widget-name="ChatPage" data-theme="{$theme}">
  <div class="chat-page">
    <!-- Header -->
    <div class="chat-header">
      <div class="header-top">
        <Link href="/chat_rooms">
          <Button variant="secondary" size="sm">
            ← НАЗАД_К_СПИСКУ
          </Button>
        </Link>
        
        <StatusIndicator 
          status={connectionStatus} 
          text={connectionStatus === 'active' ? 'КАНАЛ_АКТИВЕН' : 
                connectionStatus === 'loading' ? 'ПОДКЛЮЧЕНИЕ...' : 'КАНАЛ_НЕАКТИВЕН'}
        />
      </div>
      
      {#if room}
        <PageTitle 
          title={room.localName} 
          subtitle={`ID_КАНАЛА: ${room.id} | ИСТОЧНИК: ${room.sourceName}`}
        />
      {:else}
        <PageTitle 
          title="ЗАГРУЗКА_КАНАЛА..." 
          subtitle="УСТАНОВКА_ЗАЩИЩЕННОГО_СОЕДИНЕНИЯ"
        />
      {/if}
    </div>

    <!-- Messages Area -->
    <div class="messages-section">
      <Card variant="flat" size="lg" className="messages-card">
        <div class="messages-container">
          {#if messages.length === 0}
            <div class="empty-messages">
              <div class="empty-icon">💬</div>
              <h3 class="empty-title">КАНАЛ_ПУСТ</h3>
              <p class="empty-description">Начните защищенную переписку</p>
            </div>
          {/if}
          
          {#each messages as message (message.id)}
            <div class="message {getSenderClass(message.sender)}">
              <div class="message-header">
                <span class="sender-name">{getSenderName(message.sender)}</span>
                <span class="message-time">{formatTime(message.timestamp)}</span>
                <span class="message-id">#{message.id}</span>
              </div>
              
              <div class="message-content">
                {#each message.message as part}
                  {#if part.type === 'text'}
                    <span class="message-text">{part.content}</span>
                  {/if}
                {/each}
              </div>
              
              <div class="message-footer">
                <div class="message-indicator"></div>
              </div>
            </div>
          {/each}
        </div>
      </Card>
    </div>

    <!-- Message Input -->
    <div class="input-section">
      <Card variant="elevated" size="md">
        <div class="input-header">
          <h3 class="input-title">// ОТПРАВИТЬ_СООБЩЕНИЕ //</h3>
          <StatusIndicator 
            status={isSending ? 'loading' : 'active'} 
            text={isSending ? 'ОТПРАВКА...' : 'ГОТОВ_К_ОТПРАВКЕ'}
            size="sm"
          />
        </div>
        
        <div class="message-form">
          <div class="input-group">
            <label class="input-label">ТЕКСТ_СООБЩЕНИЯ:</label>
            <Input
              bind:value={newMessage}
              placeholder="ВВЕДИТЕ_ВАШЕ_СООБЩЕНИЕ..."
              size="lg"
              disabled={isSending || connectionStatus !== 'active'}
              onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            />
          </div>
          
          <div class="form-actions">
            <Button 
              onclick={sendMessage} 
              variant="primary" 
              size="md"
              disabled={!newMessage.trim() || isSending || connectionStatus !== 'active'}
              loading={isSending}
            >
              {isSending ? 'ОТПРАВКА...' : 'ОТПРАВИТЬ'}
            </Button>
            
            <div class="message-stats">
              <span class="stat-item">
                СИМВОЛОВ: {newMessage.length}/1000
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>

    <!-- Footer -->
    <div class="chat-footer">
      <div class="footer-info">
        <span class="footer-text">// ЗАЩИЩЕННЫЙ_ТЕРМИНАЛ_СВЯЗИ //</span>
        <div class="connection-info">
          <StatusIndicator status="active" text="ШИФРОВАНИЕ_АКТИВНО" size="sm" />
          <span class="encryption-type">AES-256</span>
        </div>
      </div>
    </div>
  </div>
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
    padding: 2rem;
    border: 2px solid var(--les-border-primary);
    box-shadow: 0 0 25px var(--les-accent-primary) inset;
  }

  .chat-page {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    min-height: calc(100vh - 4rem);
    background: linear-gradient(45deg, transparent 0%, rgba(255, 255, 255, 0.02) 50%, transparent 100%);
  }

  /* Header */
  .chat-header {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  /* Messages Section */
  .messages-section {
    flex: 1;
    min-height: 400px;
  }

  :global(.messages-card) {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .messages-container {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    max-height: 500px;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid var(--les-border-primary);
    border-radius: 4px;
  }

  /* Empty Messages */
  .empty-messages {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    color: var(--les-text-secondary);
    height: 100%;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  .empty-title {
    color: var(--les-accent-primary);
    font-family: "Courier New", Courier, monospace;
    font-size: 1.1rem;
    font-weight: bold;
    margin: 0 0 0.5rem 0;
    letter-spacing: 1px;
  }

  .empty-description {
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9rem;
    margin: 0;
    opacity: 0.7;
  }

  /* Messages */
  .message {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    border-radius: 4px;
    position: relative;
    font-family: "Courier New", Courier, monospace;
  }

  .message.system {
    background: linear-gradient(135deg, 
      rgba(255, 255, 255, 0.05) 0%, 
      rgba(255, 255, 255, 0.02) 100%);
    border-left: 3px solid var(--les-accent-primary);
    margin: 0 2rem;
  }

  .message.own {
    background: linear-gradient(135deg, 
      rgba(0, 255, 157, 0.1) 0%, 
      rgba(0, 255, 157, 0.05) 100%);
    border-left: 3px solid var(--les-accent-secondary);
    margin-left: 2rem;
  }

  .message.other {
    background: linear-gradient(135deg, 
      rgba(255, 157, 0, 0.1) 0%, 
      rgba(255, 157, 0, 0.05) 100%);
    border-left: 3px solid #ff9d00;
    margin-right: 2rem;
  }

  .message-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    opacity: 0.8;
    margin-bottom: 0.5rem;
  }

  .sender-name {
    color: var(--les-accent-primary);
    font-weight: bold;
    letter-spacing: 1px;
  }

  .message.system .sender-name {
    color: var(--les-accent-primary);
  }

  .message.own .sender-name {
    color: var(--les-accent-secondary);
  }

  .message.other .sender-name {
    color: #ff9d00;
  }

  .message-time {
    color: var(--les-text-secondary);
  }

  .message-id {
    color: var(--les-text-secondary);
    font-size: 0.7rem;
    opacity: 0.6;
  }

  .message-content {
    margin: 0.5rem 0;
  }

  .message-text {
    color: var(--les-text-primary);
    font-size: 0.95rem;
    line-height: 1.4;
    word-wrap: break-word;
  }

  .message-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 0.5rem;
  }

  .message-indicator {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--les-accent-secondary);
    box-shadow: 0 0 5px var(--les-accent-secondary);
    animation: message-pulse 2s ease-in-out infinite;
  }

  @keyframes message-pulse {
    0%, 100% { opacity: 0.5; }
    50% { opacity: 1; }
  }

  /* Input Section */
  .input-section {
    margin-top: auto;
  }

  .input-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .input-title {
    color: var(--les-accent-primary);
    font-family: "Courier New", Courier, monospace;
    font-size: 1rem;
    font-weight: bold;
    letter-spacing: 1px;
    margin: 0;
    text-shadow: 0 0 3px var(--les-accent-primary);
  }

  .message-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .input-label {
    color: var(--les-accent-secondary);
    font-family: "Courier New", Courier, monospace;
    font-size: 0.9rem;
    font-weight: bold;
    letter-spacing: 1px;
  }

  .form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .message-stats {
    display: flex;
    gap: 1rem;
    font-family: "Courier New", Courier, monospace;
    font-size: 0.8rem;
  }

  .stat-item {
    color: var(--les-text-secondary);
    letter-spacing: 1px;
  }

  /* Footer */
  .chat-footer {
    margin-top: 1rem;
    padding-top: 1rem;
  }

  .footer-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 0;
    border-top: 1px solid var(--les-border-primary);
    font-family: "Courier New", Courier, monospace;
  }

  .footer-text {
    color: var(--les-text-secondary);
    font-size: 0.8rem;
    letter-spacing: 1px;
  }

  .connection-info {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .encryption-type {
    color: var(--les-accent-secondary);
    font-size: 0.8rem;
    font-weight: bold;
    letter-spacing: 1px;
  }

  /* Scrollbar */
  .messages-container::-webkit-scrollbar {
    width: 8px;
  }

  .messages-container::-webkit-scrollbar-track {
    background: var(--les-bg-secondary);
    border-radius: 4px;
  }

  .messages-container::-webkit-scrollbar-thumb {
    background: var(--les-accent-primary);
    border-radius: 4px;
    box-shadow: 0 0 5px var(--les-accent-primary);
  }

  .messages-container::-webkit-scrollbar-thumb:hover {
    background: var(--les-accent-secondary);
    box-shadow: 0 0 8px var(--les-accent-secondary);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .header-top {
      flex-direction: column;
      gap: 1rem;
    }

    .message.system,
    .message.own,
    .message.other {
      margin-left: 0;
      margin-right: 0;
    }

    .form-actions {
      flex-direction: column;
      gap: 1rem;
    }

    .footer-info {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
    }

    .messages-container {
      max-height: 350px;
    }
  }

  @media (max-width: 480px) {
    .message-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }

    .input-title {
      font-size: 0.9rem;
    }

    .messages-container {
      max-height: 300px;
      padding: 0.8rem;
    }
  }
</style>
