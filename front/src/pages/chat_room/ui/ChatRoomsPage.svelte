<script lang="ts">
  import { Button, Input, Dialog } from '../../../components/ui';
  import layoutStyles from '../../../styles/modules/layout.module.css';
  import styles from './ChatRoomsPage.module.css';
  import { onMount } from 'svelte';
  
  // Types
  interface Chat {
    id: string;
    name: string;
    lastMessage?: string;
    lastTime?: string;
    unreadCount?: number;
  }

  // State
  let chats = $state<Chat[]>([]);
  let selectedChatId = $state<string | null>(null);
  let showAddDialog = $state(false);
  let newChatName = $state('');
  let isMobile = $state(false);
  let showSidebar = $state(true);

  // Lifecycle
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) {
        showSidebar = true;
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Load chat ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    if (roomId) {
      selectedChatId = roomId;
      if (isMobile) {
        showSidebar = false;
      }
    }

    // Mock data
    chats = [
      { id: '1', name: 'Общий чат', lastMessage: 'Привет всем!', lastTime: '10:30', unreadCount: 3 },
      { id: '2', name: 'Разработка', lastMessage: 'Готов новый релиз', lastTime: '09:15', unreadCount: 1 },
      { id: '3', name: 'Поддержка', lastMessage: 'Как дела?', lastTime: 'вчера' }
    ];

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  });

  // Functions
  function selectChat(chatId: string) {
    selectedChatId = chatId;
    
    const url = new URL(window.location.href);
    url.searchParams.set('room_id', chatId);
    window.history.replaceState({}, '', url.toString());
    
    if (isMobile) {
      showSidebar = false;
    }
  }

  function addChat() {
    if (!newChatName.trim()) return;
    
    const newChat: Chat = {
      id: Date.now().toString(),
      name: newChatName.trim()
    };
    
    chats = [newChat, ...chats];
    selectChat(newChat.id);
    newChatName = '';
    showAddDialog = false;
  }

  function goBack() {
    if (isMobile) {
      showSidebar = true;
      selectedChatId = null;
      
      const url = new URL(window.location.href);
      url.searchParams.delete('room_id');
      window.history.replaceState({}, '', url.toString());
    }
  }

  let selectedChat = $derived(selectedChatId ? chats.find(c => c.id === selectedChatId) : null);
</script>

<div class={`${layoutStyles.flex} ${layoutStyles.hScreen} ${styles.chatPage}`}>
  <!-- Sidebar -->
  <div class={`${styles.sidebar} ${!showSidebar ? styles.sidebarHidden : ''}`}>
    <div class={styles.sidebarHeader}>
      <h2 class={styles.sidebarTitle}>Чаты</h2>
      <Button onclick={() => showAddDialog = true} size="sm">+ Добавить</Button>
    </div>
    
    <div class={styles.chatsList}>
      {#each chats as chat (chat.id)}
        <button 
          class={`${styles.chatItem} ${selectedChatId === chat.id ? styles.chatItemActive : ''}`}
          onclick={() => selectChat(chat.id)}
        >
          <div class={styles.chatInfo}>
            <div class={styles.chatName}>{chat.name}</div>
            {#if chat.lastMessage}
              <div class={styles.chatLastMessage}>{chat.lastMessage}</div>
            {/if}
          </div>
          <div class={styles.chatMeta}>
            {#if chat.lastTime}
              <div class={styles.chatTime}>{chat.lastTime}</div>
            {/if}
            {#if chat.unreadCount}
              <div class={styles.unreadBadge}>{chat.unreadCount}</div>
            {/if}
          </div>
        </button>
      {/each}
      
      {#if chats.length === 0}
        <div class={styles.emptyState}>
          <p>Нет чатов</p>
          <Button onclick={() => showAddDialog = true}>Создать первый чат</Button>
        </div>
      {/if}
    </div>
  </div>

  <!-- Chat Area -->
  <div class={`${styles.chatArea} ${isMobile && showSidebar ? styles.chatAreaHidden : ''}`}>
    {#if selectedChat}
      <div class={styles.chatHeader}>
        {#if isMobile}
          <Button onclick={goBack} variant="ghost" size="sm">← Назад</Button>
        {/if}
        <h3 class={styles.chatHeaderTitle}>{selectedChat.name}</h3>
        <Button variant="ghost" size="sm">⚙️</Button>
      </div>
      
      <div class={styles.chatMessages}>
        <div class={styles.messagePlaceholder}>
          <p>Чат "{selectedChat.name}"</p>
          <p>Здесь будут отображаться сообщения...</p>
        </div>
      </div>
      
      <div class={styles.chatInput}>
        <Input placeholder="Введите сообщение..." />
        <Button>Отправить</Button>
      </div>
    {:else}
      <div class={styles.noChatSelected}>
        <h3 class={styles.noChatSelectedTitle}>Выберите чат</h3>
        <p class={styles.noChatSelectedText}>Выберите чат из списка слева или создайте новый</p>
      </div>
    {/if}
  </div>

  <!-- Add Chat Dialog -->
  <Dialog open={showAddDialog} onClose={() => showAddDialog = false} title="Новый чат">
    <div class={`${layoutStyles.flexCol} ${layoutStyles.gap4}`}>
      <Input 
        bind:value={newChatName} 
        placeholder="Название чата"
        onkeydown={(e) => e.key === 'Enter' && addChat()}
      />
      <div class={`${layoutStyles.flex} ${layoutStyles.gap2} ${layoutStyles.justifyEnd}`}>
        <Button onclick={addChat} disabled={!newChatName.trim()}>Создать</Button>
        <Button onclick={() => showAddDialog = false} variant="ghost">Отмена</Button>
      </div>
    </div>
  </Dialog>
</div>
