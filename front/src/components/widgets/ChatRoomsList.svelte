<script lang="ts">
  import { Link, ROUTES } from "../../routing";
  import chatStyles from "../../styles/modules/chat.module.css";

  interface Room {
    room_id: string;
    name: string;
    messages: Record<string, any>;
  }

  interface Props {
    rooms: Room[];
    selectedRoomId: string | null;
    onRoomSelect: (roomId: string) => void;
    showMobile: boolean;
  }

  let { rooms, selectedRoomId, onRoomSelect, showMobile }: Props = $props();
</script>

<aside class="{chatStyles.sidebar} {showMobile ? '' : chatStyles.mobileHidden}">
  <div class={chatStyles.sidebarHeader}>
    <h3 class={chatStyles.sidebarTitle}>// КАНАЛЫ //</h3>
    <Link href={'#'+ROUTES.CHAT_ROOMS_ADD} className="add-room-btn">
      + НОВЫЙ
    </Link>
  </div>
  
  <div class="{chatStyles.roomsList} scrollable">
    {#each rooms as room (room.room_id)}
      <button 
        class="{chatStyles.roomItem} {selectedRoomId === room.room_id ? 'active' : ''}"
        onclick={() => onRoomSelect(room.room_id)}
      >
        <div class={chatStyles.roomIcon}>💬</div>
        <div class={chatStyles.roomInfo}>
          <div class={chatStyles.roomName}>{room.name}</div>
          <div class={chatStyles.roomStatus}>
            {Object.keys(room.messages).length} сообщений
          </div>
        </div>
        <div class={chatStyles.roomArrow}>→</div>
      </button>
    {/each}
    
    {#if rooms.length === 0}
      <div class={chatStyles.emptyRooms}>
        <div class={chatStyles.emptyIcon}>📡</div>
        <p class={chatStyles.emptyText}>НЕТ КАНАЛОВ</p>
      </div>
    {/if}
  </div>
</aside>

<style>
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

  .scrollable {
    composes: scrollable from "../../styles/modules/page-layout.module.css";
  }
</style>
