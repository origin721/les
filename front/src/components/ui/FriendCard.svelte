<script lang="ts">
    import type { FriendEntityFull } from "../../indexdb/friends/add_friend";
    import { Button } from "./index";

    interface Props {
        friend: FriendEntityFull;
        onDelete: (friendId: string) => void;
        onChat?: (friendId: string) => void;
    }

    let { friend, onDelete, onChat }: Props = $props();

    function handleDelete() {
        onDelete(friend.id);
    }

    function handleChat() {
        onChat?.(friend.id);
    }
</script>

<div class="friend-card">
    <div class="friend-header">
        <div class="friend-avatar">
            <span class="avatar-text">{friend.namePub.charAt(0).toUpperCase()}</span>
        </div>
        <div class="friend-info">
            <h3 class="friend-name">{friend.namePub}</h3>
            <span class="friend-id">ID: {friend.id.slice(0, 8)}...</span>
        </div>
    </div>
    
    <div class="friend-details">
        <div class="detail-row">
            <span class="detail-label">Аккаунт:</span>
            <span class="detail-value">{friend.myAccId.slice(0, 8)}...</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">P2P Ключ:</span>
            <span class="detail-value">
                {friend.friendPubKeyLibp2p ? friend.friendPubKeyLibp2p.slice(0, 16) + '...' : 'Не настроен'}
            </span>
        </div>
    </div>

    <div class="friend-actions">
        <button class="action-btn chat" onclick={handleChat}>
            <span class="btn-icon">💬</span>
            <span class="btn-text">Чат</span>
        </button>
        <button class="action-btn delete" onclick={handleDelete}>
            <span class="btn-icon">🗑</span>
            <span class="btn-text">Удалить</span>
        </button>
    </div>
</div>

<style>
    .friend-card {
        background: var(--les-bg-secondary);
        border: 1px solid var(--les-border-primary);
        border-radius: 4px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        font-family: "Courier New", Courier, monospace;
    }

    .friend-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s;
    }

    .friend-card:hover::before {
        left: 100%;
    }

    .friend-card:hover {
        border-color: var(--les-accent-primary);
        box-shadow: 0 0 15px var(--les-accent-primary);
        transform: translateY(-3px);
    }

    /* Friend Header */
    .friend-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .friend-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: var(--les-accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--les-accent-primary);
    }

    .avatar-text {
        color: var(--les-bg-primary);
        font-weight: bold;
        font-size: 1.2rem;
    }

    .friend-info {
        flex: 1;
    }

    .friend-name {
        color: var(--les-accent-primary);
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.3rem;
        text-shadow: 0 0 3px var(--les-accent-primary);
    }

    .friend-id {
        color: var(--les-accent-secondary);
        font-size: 0.8rem;
    }

    /* Friend Details */
    .friend-details {
        margin-bottom: 1.5rem;
    }

    .detail-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }

    .detail-label {
        color: var(--les-accent-secondary);
    }

    .detail-value {
        color: var(--les-text-primary);
        font-family: "Courier New", monospace;
    }

    /* Friend Actions */
    .friend-actions {
        display: flex;
        gap: 0.8rem;
        justify-content: center;
    }

    .action-btn {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem 1rem;
        border: 1px solid;
        background: transparent;
        color: inherit;
        font-family: inherit;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
    }

    .action-btn.chat {
        border-color: var(--les-accent-secondary);
        color: var(--les-accent-secondary);
    }

    .action-btn.chat:hover {
        background: var(--les-accent-secondary);
        color: var(--les-bg-primary);
        box-shadow: 0 0 10px var(--les-accent-secondary);
    }

    .action-btn.delete {
        border-color: var(--les-error);
        color: var(--les-error);
    }

    .action-btn.delete:hover {
        background: var(--les-error);
        color: var(--les-bg-primary);
        box-shadow: 0 0 10px var(--les-error);
    }

    .btn-icon {
        font-size: 1rem;
    }

    .btn-text {
        font-weight: bold;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .friend-card {
            padding: 1rem;
        }
        
        .friend-actions {
            flex-direction: column;
            gap: 0.5rem;
        }
        
        .action-btn {
            justify-content: center;
        }
    }
</style>
