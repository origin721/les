<script lang="ts">
  import { Link, ROUTES } from "../../routing";

  interface Props {
    rooms: any[];
    selectedRoomId: string | null;
    onRoomSelect: (roomId: string) => void;
    showOnMobile?: boolean;
  }

  let {
    rooms,
    selectedRoomId,
    onRoomSelect,
    showOnMobile = true
  }: Props = $props();
</script>

<aside class="rooms-sidebar" class:mobile-hidden={!showOnMobile}>
  <div class="sidebar-header">
    <h3 class="sidebar-title">// КАНАЛЫ //</h3>
    <Link href={'#'+ROUTES.CHAT_ROOMS_ADD} className="add-room-btn">
      + НОВЫЙ
    </Link>
  </div>
  
  <div class="rooms-list">
    {#each rooms as room (room.room_id)}
      <button 
        class="room-item" 
        class:active={selectedRoomId === room.room_id}
        onclick={() => onRoomSelect(room.room_id)}
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
    
    {#if rooms.length === 0}
      <div class="empty-rooms">
        <div class="empty-icon">📡</div>
        <p class="empty-text">НЕТ КАНАЛОВ</p>
      </div>
    {/if}
  </div>
</aside>

<style>
  .rooms-sidebar {
    width: 350px;
    min-width: 350px;
    max-width: 350px;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--les-bg-secondary);
    border-right: 1px solid var(--les-border-primary);
    box-shadow: 
      0 0 20px rgba(0, 0, 0, 0.5),
      inset 0 0 20px rgba(255, 255, 255, 0.02);
    flex-shrink: 0;
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

  /* Mobile Responsive */
  @media (max-width: 768px) {
    .rooms-sidebar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
    }

    .mobile-hidden {
      display: none;
    }

    .sidebar-header {
      padding: 1rem;
    }

    .rooms-list {
      padding: 0.5rem;
    }

    .room-item {
      padding: 0.8rem;
    }
  }

  /* Desktop - ensure proper positioning */
  @media (min-width: 769px) {
    .rooms-sidebar {
      position: relative;
      flex-shrink: 0;
    }
  }
</style>
