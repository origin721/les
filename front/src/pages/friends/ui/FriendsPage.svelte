<script lang="ts">
    import type { FriendEntityFull } from "../../../indexdb/friends/add_friend";
    import { Link, ROUTES } from "../../../routing";
    import { theme } from "../../../stores/theme";
    import BasePage from "../../../components/page_templates/BasePage.svelte";
    import ContentSection from "../../../components/page_templates/ContentSection.svelte";
    import { StatusIndicator, FriendCard, StateDisplay } from "../../../components/ui";
    import { CHANNEL_NAMES } from "../../../core/broadcast_channel/constants/CHANNEL_NAMES";
    import { FrontMiddlewareActions } from "../../../core/broadcast_channel/constants/FRONT_MIDDLEWARE_ACTIONS";
    import type { PostMessageParam } from "../../../core/broadcast_channel/front_middleware_channel";
    import { devUI, devAPI, prodError, prodLog } from "../../../core/debug/logger";
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
            prodError('❌ FriendsPage: Ошибка загрузки друзей:', err);
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
    }
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
                            <StatusIndicator 
                                status="active" 
                                text="OK - СИСТЕМА ДРУЗЕЙ АКТИВНА" 
                                size="lg"
                            />
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
                                    <StateDisplay 
                                        type="error" 
                                        message={error}
                                        actionText="Повторить попытку"
                                        onAction={handleRefresh}
                                    />
                                {:else if friends.length === 0}
                                    <StateDisplay 
                                        type="empty" 
                                        title="Список друзей пуст"
                                        message="Добавьте первого друга, чтобы начать общение"
                                    />
                                {:else}
                                    <div class="friends-grid">
                                        {#each friends as friend (friend.id)}
                                            <FriendCard 
                                                {friend} 
                                                onDelete={handleDeleteFriend}
                                                onChat={() => {}}
                                            />
                                        {/each}
                                    </div>
                                {/if}

                                <!-- Loading Overlay -->
                                {#if loading}
                                    <StateDisplay 
                                        type="loading" 
                                        message="Загрузка списка друзей..."
                                        overlay={true}
                                    />
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
        border: 1px solid var(--primary-color);
        border-radius: 4px;
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

    /* Friends Grid */
    .friends-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 1.5rem;
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
