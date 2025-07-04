<script lang="ts">
  import { events_store } from "../../../processes/create_my_events/events_store";
  import { ROUTES } from "../../../routing";
  import { PageLayout, ChatSidebar, ChatArea } from "../../../components/ui";

  // Состояние для мобильного вида
  let showRoomsList = $state(true);
  let selectedRoomId = $state<string | null>(null);

  // Получаем выбранную комнату
  let selectedRoom = $derived(
    selectedRoomId ? events_store.get_room_by_id(selectedRoomId) : null
  );

  // Функция для отправки сообщения
  function handleSendMessage(message: string) {
    if (selectedRoomId) {
      events_store.add_message({
        roomId: selectedRoomId,
        message: message,
      });
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

<PageLayout
  title="SECURE_CHAT_SYSTEM"
  subtitle="ТЕРМИНАЛ_ЗАЩИЩЕННОЙ_СВЯЗИ"
  statusText="КАНАЛЫ АКТИВНЫ"
  backButtonHref={ROUTES.HOME}
  backButtonText="← ГЛАВНАЯ"
  versionPrefix="SECURE_CHAT_TERMINAL_v"
  contentClass="chat-content flex"
>
  {#snippet children()}
    <ChatSidebar 
      rooms={Object.values($events_store.rooms)}
      {selectedRoomId}
      onRoomSelect={selectRoom}
      showOnMobile={showRoomsList}
    />
    
    <ChatArea 
      room={selectedRoom}
      showOnMobile={!showRoomsList}
      onBackToRooms={backToRooms}
      onSendMessage={handleSendMessage}
    />
  {/snippet}
</PageLayout>

<style>
  /* Мобильная адаптивность будет обрабатываться в компонентах */
</style>
