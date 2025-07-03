<script lang="ts">
import type { FriendEntityFull } from "../../../indexdb/friends/add_friend";
    import { Link, ROUTES } from "../../../routing";
    import { theme } from "../../../stores/theme";
    import BasePage from "../../../components/page_templates/BasePage.svelte";
    import ContentSection from "../../../components/page_templates/ContentSection.svelte";
    import { CHANNEL_NAMES } from "../../../core/broadcast_channel/constants/CHANNEL_NAMES";
    import { FrontMiddlewareActions } from "../../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
    import type { PostMessageParam } from "../../../core/broadcast_channel/front_middleware_channel";
    import { fade } from "svelte/transition";
    import { devUI, devAPI, prodError, prodLog } from "../../../core/debug/logger";

    // Import theme styles
    import "../../../styles/cyberpunk.css";
    import "../../../styles/pixel.css";
    import sharedWorkerApi from "../../../api/shared_worker";

    let friends = $state<FriendEntityFull[]>([]);
    let loading = $state(true);
    let error = $state<string | null>(null);
    let broadcastChannel: BroadcastChannel | null = null;

    // Загружаем друзей при инициализации и настраиваем broadcast канал
    $effect(() => {
        loadFriends();
        setupBroadcastChannel();
        
        // Cleanup функция для закрытия канала
        return () => {
            if (broadcastChannel) {
                broadcastChannel.close();
                broadcastChannel = null;
            }
        };
    });

    function setupBroadcastChannel() {
        try {
            broadcastChannel = new BroadcastChannel(CHANNEL_NAMES.FRONT_MIDDLEWARE);
            broadcastChannel.addEventListener('message', handleBroadcastMessage);
            devUI('📡 FriendsPage: Broadcast канал настроен');
        } catch (err) {
            prodError('❌ FriendsPage: Ошибка настройки broadcast канала:', err);
        }
    }

    function handleBroadcastMessage(event: MessageEvent<PostMessageParam>) {
        const { action, data } = event.data;
        devUI('📢 FriendsPage: Получено broadcast сообщение:', action, data);

        if (action === FrontMiddlewareActions.ADD_FRIENDS) {
            devUI('➕ FriendsPage: Обновляем список друзей через broadcast напрямую');
            // Используем данные из broadcast события напрямую, не вызываем loadFriends()
            if (data.list && Array.isArray(data.list)) {
                friends = data.list as FriendEntityFull[];
                devUI(`📊 FriendsPage: Обновлено через broadcast: ${friends.length} друзей`);
            } else {
                devUI('⚠️ FriendsPage: Некорректные данные в broadcast, перезагружаем через API');
                loadFriends();
            }
        } else if (action === FrontMiddlewareActions.DELETE_FRIENDS) {
            devUI('➖ FriendsPage: Удаляем друзей через broadcast:', data.ids);
            // Удаляем друзей из текущего списка
            friends = friends.filter(friend => !data.ids.includes(friend.id));
        }
    }

    async function loadFriends() {
        devUI('🔄 FriendsPage: Начинаем загрузку друзей...');
        loading = true;
        error = null;

        // Гарантируем отключение loading через 1000ms независимо от результата
        const startTime = Date.now();
        
        try {
            devAPI('📞 FriendsPage: Вызываем api.friends.getList()...');
            const friendsList = await sharedWorkerApi.friends.getList();
            devAPI('✅ FriendsPage: Получен список друзей:', friendsList);
            
            friends = friendsList || [];
            devUI(`📊 FriendsPage: Количество друзей: ${friends.length}`);
            
            if (friends.length === 0) {
                devUI('📭 FriendsPage: Список друзей пуст');
            } else {
                devUI('👥 FriendsPage: Имена друзей:', friends.map(f => f.namePub));
            }
        } catch (err) {
            prodError('❌ FriendsPagesharedWorkerApiшибка загрузки друзей:', err);
            error = `Ошибка загрузки списка друзей: ${(err as any)?.message || String(err)}`;
            // При ошибке оставляем старые данные, не обнуляем friends
        }

        // Гарантируем минимум 1000ms загрузки
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, 1000 - elapsed);
        
        setTimeout(() => {
            loading = false;
            devUI('🏁 FriendsPage: Загрузка завершена через', elapsed + remainingTime, 'ms');
        }, remainingTime);
    }

    async function handleDeleteFriend(friendId: string) {
        if (confirm("Вы уверены, что хотите удалить этого друга?")) {
            try {
                devUI('🗑️ FriendsPage: Удаляем друга с ID:', friendId);
                await sharedWorkerApi.friends.delete([friendId]);
                friends = friends.filter(friend => friend.id !== friendId);
                prodLog('✅ FriendsPage: Друг удален успешно');
            } catch (err) {
                prodError('❌ FriendsPage: Ошибка при удалении друга:', err);
                error = "Ошибка при удалении друга";
            }
        }
    }

    function handleRefresh() {
        devUI('🔄 FriendsPage: Принудительное обновление списка');
        loadFriends();
    }sharedWorkerApi
</script>

<div class="theme-{$theme}">
    <BasePage 
        title="ДРУЗЬЯ" 
        subtitle="Управление списком друзей"
        pageName="FriendsPage"
        footerVersion="// FRIENDS_SYSTEM_v2.0 //"
        footerStatus="MODE: SVELTE5"
    >
        {#snippet children()}
            <ContentSection title="СИСТЕМА ДРУЗЕЙ">
                {#snippet children()}
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
                            
                            <button class="action-button secondary" onclick={handleRefresh} disabled={loading}>
                                <span class="button-icon">{loading ? '⟳' : '🔄'}</span>
                                <span class="button-text">ОБНОВИТЬ</span>
                            </button>
                        </div>

                        <!-- Friends List -->
                        <div class="friends-list">
                            <h2 class="section-title">
                                <span class="title-icon">📋</span>
                                СПИСОК ДРУЗЕЙ
                            </h2>

                            <!-- Content Container with relative positioning for overlay -->
                            <div class="content-container">
                                <!-- Main Content -->
                                {#if error}
                                    <div class="error-state">
                                        <div class="error-icon">⚠</div>
                                        <span>{error}</span>
                                        <button class="retry-button" onclick={handleRefresh}>
                                            Повторить попытку
                                        </button>
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
                                                        <span class="detail-value">
                                                            {friend.friendPubKeyLibp2p ? friend.friendPubKeyLibp2p.slice(0, 16) + '...' : 'Не настроен'}
                                                        </span>
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

                                <!-- Loading Overlay -->
                                {#if loading}
                                    <div class="loading-overlay" transition:fade={{duration: 300}}>
                                        <div class="loading-content">
                                            <div class="loading-animation">⧗</div>
                                            <span>Загрузка списка друзей...</span>
                                        </div>
                                    </div>
                                {/if}
                            </div>
                        </div>

                        <!-- Footer Status -->
                        <div class="footer-status">
                            <span class="footer-info">
                                // FRIENDS_SYSTEM_v2.0 // STATUS: {friends.length} ДРУЗЕЙ // SVELTE5 //
                            </span>
                        </div>
                    </div>
                {/snippet}
            </ContentSection>
        {/snippet}
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
        gap: 1rem;
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

    :global(.action-button:hover:not(:disabled)) {
        background: var(--primary-color);
        color: var(--background-color);
        box-shadow: 0 0 20px var(--primary-color);
        transform: translateY(-2px);
    }

    :global(.action-button:disabled) {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .action-button.secondary {
        border-color: var(--secondary-color);
        color: var(--secondary-color);
    }

    .action-button.secondary:hover:not(:disabled) {
        background: var(--secondary-color);
        color: var(--background-color);
        box-shadow: 0 0 20px var(--secondary-color);
    }

    .button-icon {
        font-size: 1.2rem;
    }

    .action-button:disabled .button-icon {
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
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

    /* Content Container */
    .content-container {
        position: relative;
        min-height: 200px;
    }

    /* Loading Background Overlay */
    .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(2px);
        z-index: 1;
        pointer-events: none;
    }

    .loading-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 2rem;
        background: rgba(26, 26, 26, 0.9);
        border: 2px solid var(--accent-color);
        border-radius: 8px;
        box-shadow: 0 0 40px var(--accent-color);
        opacity: 0.95;
        backdrop-filter: blur(5px);
        pointer-events: auto;
    }

    .loading-content span {
        color: var(--accent-color);
        font-weight: bold;
        margin-top: 1rem;
        text-shadow: 0 0 10px var(--accent-color);
        font-size: 1rem;
        animation: text-glow 2s ease-in-out infinite alternate;
    }

    @keyframes text-glow {
        from {
            text-shadow: 0 0 5px var(--accent-color);
        }
        to {
            text-shadow: 0 0 15px var(--accent-color), 0 0 25px var(--accent-color);
        }
    }

    /* Loading, Error, Empty States */
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

    .error-state span {
        margin-bottom: 1rem;
        color: var(--error-color);
    }

    .retry-button {
        padding: 0.8rem 1.5rem;
        background: var(--error-color);
        color: var(--background-color);
        border: none;
        border-radius: 4px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .retry-button:hover {
        box-shadow: 0 0 15px var(--error-color);
        transform: translateY(-2px);
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
            flex-direction: column;
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
