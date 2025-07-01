<script lang="ts">
    import { onMount } from "svelte";
    import { get_friends } from "../../../indexdb/friends/get_friends";
    import { delete_friend } from "../../../indexdb/friends/delete_friend";
    import type { FriendEntityFull } from "../../../indexdb/friends/add_friend";
    import { Link, ROUTES } from "../../../routing";
    import { theme } from "../../../stores/theme";
    import BasePage from "../../../components/page_templates/BasePage.svelte";
    import ContentSection from "../../../components/page_templates/ContentSection.svelte";

    // Import theme styles
    import "../../../styles/cyberpunk.css";
    import "../../../styles/watchdogs.css";
    import "../../../styles/pixel.css";

    let friends = $state<FriendEntityFull[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);

    onMount(async () => {
        try {
            friends = await get_friends();
            loading = false;
        } catch (err) {
            error = "Ошибка загрузки списка друзей";
            loading = false;
        }
    });

    async function handleDeleteFriend(friendId: string) {
        if (confirm("Вы уверены, что хотите удалить этого друга?")) {
            try {
                await delete_friend(friendId);
                friends = friends.filter(friend => friend.id !== friendId);
            } catch (err) {
                error = "Ошибка при удалении друга";
            }
        }
    }
</script>

<div class="theme-{$theme}">
    <BasePage title="ДРУЗЬЯ" subtitle="Управление списком друзей">
        <ContentSection title="СИСТЕМА ДРУЗЕЙ">
            <div class="friends-container" data-widget-name="FriendsPage">
                <!-- Status Message -->
                <div class="status-message">
                    <div class="status-indicator">
                        <span class="status-dot active"></span>
                        <span class="status-text">OK - СИСТЕМА ДРУЗЕЙ АКТИВНА</span>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <Link href={ROUTES.ADD_FRIEND} className="action-button primary">
                        <span class="button-icon">👥</span>
                        <span class="button-text">ДОБАВИТЬ ДРУГА</span>
                    </Link>
                </div>

                <!-- Friends List -->
                <div class="friends-list">
                    <h2 class="section-title">
                        <span class="title-icon">📋</span>
                        СПИСОК ДРУЗЕЙ
                    </h2>

                    {#if loading}
                        <div class="loading-state">
                            <div class="loading-animation">⧗</div>
                            <span>Загрузка списка друзей...</span>
                        </div>
                    {:else if error}
                        <div class="error-state">
                            <div class="error-icon">⚠</div>
                            <span>{error}</span>
                        </div>
                    {:else if friends.length === 0}
                        <div class="empty-state">
                            <div class="empty-icon">👥</div>
                            <h3>Список друзей пуст</h3>
                            <p>Добавьте первого друга, чтобы начать общение</p>
                            <Link href={ROUTES.ADD_FRIEND} className="empty-action-button">
                                Добавить друга
                            </Link>
                        </div>
                    {:else}
                        <div class="friends-grid">
                            {#each friends as friend (friend.id)}
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
                                            <span class="detail-value">{friend.friendPubKeyLibp2p.slice(0, 16)}...</span>
                                        </div>
                                    </div>

                                    <div class="friend-actions">
                                        <button class="action-btn chat" onclick={() => {}}>
                                            <span class="btn-icon">💬</span>
                                            <span class="btn-text">Чат</span>
                                        </button>
                                        <button class="action-btn delete" onclick={() => handleDeleteFriend(friend.id)}>
                                            <span class="btn-icon">🗑</span>
                                            <span class="btn-text">Удалить</span>
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Footer Status -->
                <div class="footer-status">
                    <span class="footer-info">
                        // FRIENDS_SYSTEM_v1.0 // STATUS: {friends.length} ДРУЗЕЙ //
                    </span>
                </div>
            </div>
        </ContentSection>
    </BasePage>
</div>

<style>
    /* Theme Variables */
    .theme-cyberpunk {
        --background-color: #0a0a0a;
        --text-color: #00ff00;
        --primary-color: #ff00ff;
        --secondary-color: #00ffff;
        --border-color: #00ff00;
        --card-background: #1a1a1a;
        --nav-active: #ff00ff;
        --accent-color: #ffff00;
        --success-color: #00ff00;
        --error-color: #ff0040;
    }
    
    .theme-watchdogs {
        --background-color: #1a1a1a;
        --text-color: #cccccc;
        --primary-color: #ffc400;
        --secondary-color: #00aaff;
        --border-color: #444444;
        --card-background: #222222;
        --nav-active: #ffc400;
        --accent-color: #00aaff;
        --success-color: #00ff88;
        --error-color: #ff4444;
    }
    
    .theme-pixel {
        --background-color: #000000;
        --text-color: #00ff00;
        --primary-color: #00ff00;
        --secondary-color: #ff00ff;
        --border-color: #00ff00;
        --card-background: #222222;
        --nav-active: #ff00ff;
        --accent-color: #00ff00;
        --success-color: #00ff00;
        --error-color: #ff0000;
    }

    .friends-container {
        width: 100%;
        font-family: "Courier New", Courier, monospace;
        color: var(--text-color);
    }

    /* Status Message */
    .status-message {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
        padding: 1rem;
        background: rgba(0, 255, 0, 0.1);
        border: 1px solid var(--success-color);
        border-radius: 4px;
    }

    .status-indicator {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .status-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: var(--success-color);
        animation: status-pulse 2s ease-in-out infinite;
    }

    .status-text {
        color: var(--success-color);
        font-weight: bold;
        font-size: 1.1rem;
        text-shadow: 0 0 5px var(--success-color);
    }

    @keyframes status-pulse {
        0%, 100% { 
            opacity: 1;
            box-shadow: 0 0 0 0 var(--success-color);
        }
        50% { 
            opacity: 0.7;
            box-shadow: 0 0 0 8px transparent;
        }
    }

    /* Action Buttons */
    .action-buttons {
        display: flex;
        justify-content: center;
        margin-bottom: 2rem;
    }

    :global(.action-button) {
        display: flex;
        align-items: center;
        gap: 0.8rem;
        padding: 1rem 2rem;
        background: var(--card-background);
        border: 2px solid var(--primary-color);
        color: var(--primary-color);
        text-decoration: none;
        font-family: inherit;
        font-weight: bold;
        border-radius: 4px;
        transition: all 0.3s ease;
        cursor: pointer;
    }

    :global(.action-button:hover) {
        background: var(--primary-color);
        color: var(--background-color);
        box-shadow: 0 0 20px var(--primary-color);
        transform: translateY(-2px);
    }

    .button-icon {
        font-size: 1.2rem;
    }

    .button-text {
        font-size: 1rem;
    }

    /* Section Title */
    .section-title {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 1.5rem;
        color: var(--secondary-color);
        font-size: 1.5rem;
        font-weight: bold;
        text-shadow: 0 0 5px var(--secondary-color);
    }

    .title-icon {
        font-size: 1.8rem;
    }

    /* Loading, Error, Empty States */
    .loading-state,
    .error-state,
    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 3rem;
        text-align: center;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        background: var(--card-background);
    }

    .loading-animation {
        font-size: 3rem;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
        color: var(--accent-color);
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .error-icon,
    .empty-icon {
        font-size: 3rem;
        margin-bottom: 1rem;
    }

    .error-icon {
        color: var(--error-color);
    }

    .empty-icon {
        color: var(--secondary-color);
    }

    .empty-state h3 {
        color: var(--primary-color);
        margin-bottom: 0.5rem;
    }

    .empty-state p {
        color: var(--secondary-color);
        margin-bottom: 1.5rem;
    }

    :global(.empty-action-button) {
        padding: 0.8rem 1.5rem;
        background: var(--primary-color);
        color: var(--background-color);
        text-decoration: none;
        border-radius: 4px;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    :global(.empty-action-button:hover) {
        box-shadow: 0 0 15px var(--primary-color);
        transform: translateY(-2px);
    }

    /* Friends Grid */
    .friends-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
    }

    .friend-card {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 1.5rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
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
        border-color: var(--primary-color);
        box-shadow: 0 0 15px var(--primary-color);
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
        background: var(--primary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid var(--primary-color);
    }

    .avatar-text {
        color: var(--background-color);
        font-weight: bold;
        font-size: 1.2rem;
    }

    .friend-info {
        flex: 1;
    }

    .friend-name {
        color: var(--primary-color);
        font-size: 1.2rem;
        font-weight: bold;
        margin-bottom: 0.3rem;
        text-shadow: 0 0 3px var(--primary-color);
    }

    .friend-id {
        color: var(--secondary-color);
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
        color: var(--secondary-color);
    }

    .detail-value {
        color: var(--text-color);
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
        border-color: var(--accent-color);
        color: var(--accent-color);
    }

    .action-btn.chat:hover {
        background: var(--accent-color);
        color: var(--background-color);
        box-shadow: 0 0 10px var(--accent-color);
    }

    .action-btn.delete {
        border-color: var(--error-color);
        color: var(--error-color);
    }

    .action-btn.delete:hover {
        background: var(--error-color);
        color: var(--background-color);
        box-shadow: 0 0 10px var(--error-color);
    }

    .btn-icon {
        font-size: 1rem;
    }

    .btn-text {
        font-weight: bold;
    }

    /* Footer Status */
    .footer-status {
        margin-top: 2rem;
        padding: 1rem;
        text-align: center;
        border-top: 1px solid var(--border-color);
    }

    .footer-info {
        color: var(--secondary-color);
        font-size: 0.9rem;
        animation: footer-blink 3s ease-in-out infinite;
    }

    @keyframes footer-blink {
        0%, 90%, 100% { opacity: 1; }
        95% { opacity: 0.5; }
    }

    /* Responsive */
    @media (max-width: 768px) {
        .friends-grid {
            grid-template-columns: 1fr;
        }
        
        .action-buttons {
            margin-bottom: 1.5rem;
        }
        
        :global(.action-button) {
            padding: 0.8rem 1.5rem;
        }
        
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
