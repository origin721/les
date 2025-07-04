<script lang="ts">
  import chatStyles from "../../styles/modules/chat.module.css";

  interface Message {
    text: string;
    created_date: string;
  }

  interface Room {
    room_id: string;
    name: string;
    messages: Record<string, Message>;
  }

  interface Props {
    room: Room | null;
    showMobile: boolean;
    onBackToRooms: () => void;
    onSendMessage: (message: string) => void;
  }

  let { room, showMobile, onBackToRooms, onSendMessage }: Props = $props();
  let newMessage = $state('');

  function handleSendMessage() {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      newMessage = '';
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  }
</script>

<section class="{chatStyles.chatArea} {showMobile ? chatStyles.mobileHidden : ''}">
  {#if room}
    <!-- Chat Header -->
    <div class={chatStyles.chatAreaHeader}>
      <button class={chatStyles.mobileBackBtn} onclick={onBackToRooms}>
        ← КАНАЛЫ
      </button>
      <h2 class={chatStyles.chatTitle}>{room.name}</h2>
      <div class={chatStyles.chatStatus}>
        <span class={chatStyles.statusDot}></span>
        АКТИВЕН
      </div>
    </div>

    <!-- Messages Area -->
    <div class="{chatStyles.messagesArea} scrollable">
      {#each Object.values(room.messages) as message}
        <div class={chatStyles.message}>
          <div class={chatStyles.messageContent}>{message.text}</div>
          <div class={chatStyles.messageTime}>
            {new Date(message.created_date).toLocaleTimeString()}
          </div>
        </div>
      {/each}
      
      {#if Object.keys(room.messages).length === 0}
        <div class={chatStyles.noMessages}>
          <div class={chatStyles.noMessagesIcon}>💭</div>
          <p>Начните общение в защищенном канале</p>
        </div>
      {/if}
    </div>

    <!-- Message Input -->
    <div class={chatStyles.messageInputArea}>
      <div class={chatStyles.inputContainer}>
        <input
          type="text"
          bind:value={newMessage}
          placeholder="Введите сообщение..."
          class={chatStyles.messageInput}
          onkeydown={handleKeyDown}
        />
        <button 
          class={chatStyles.sendButton}
          onclick={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          ОТПРАВИТЬ
        </button>
      </div>
    </div>
  {:else}
    <!-- No Room Selected -->
    <div class={chatStyles.noRoomSelected}>
      <div class={chatStyles.noRoomIcon}>💬</div>
      <h3 class={chatStyles.noRoomTitle}>ВЫБЕРИТЕ КАНАЛ</h3>
      <p class={chatStyles.noRoomDescription}>Выберите канал из списка для начала общения</p>
    </div>
  {/if}
</section>

<style>
  .scrollable {
    composes: scrollable from "../../styles/modules/page-layout.module.css";
  }
</style>
