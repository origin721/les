<script lang="ts">
    import {
        Button,
        Input,
        Dialog,
        AnimatedTitle,
        PageFooter,
    } from "../../../components/ui";
    import { Link, ROUTES } from "../../../routing";
    import ThemeSwitcher from "../../../components/ThemeSwitcher.svelte";
    import { theme } from "../../../stores/theme";
    import layoutStyles from "../../../styles/modules/layout.module.css";
    import styles from "./ChatRoomsPage.module.css";
    import { onMount } from "svelte";
    import { setQueryParam } from "../../../routing/stores/routing-store.create";

    // Types
    interface Chat {
        id: string;
        name: string;
        lastMessage?: string;
        lastTime?: string;
        unreadCount?: number;
    }

    interface Message {
        id: string;
        author: string;
        content: string;
        time: string;
        isOwn: boolean;
    }

    // State
    let chats = $state<Chat[]>([]);
    let selectedChatId = $state<string | null>(null);
    let showAddDialog = $state(false);
    let newChatName = $state("");
    let isMobile = $state(false);
    let showSidebar = $state(true);
    let messages = $state<{ [chatId: string]: Message[] }>({});

    // Lifecycle
    onMount(() => {
        const checkMobile = () => {
            isMobile = window.innerWidth < 768;
            if (!isMobile) {
                showSidebar = true;
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        // Load chat ID from URL
        const urlParams = new URLSearchParams(window.location.search);
        const roomId = urlParams.get("room_id");
        if (roomId) {
            selectedChatId = roomId;
            if (isMobile) {
                showSidebar = false;
            }
        }

        // Mock data
        chats = [
            {
                id: "1",
                name: "Общий чат",
                lastMessage: "Привет всем!",
                lastTime: "10:30",
                unreadCount: 3,
            },
            {
                id: "2",
                name: "Разработка",
                lastMessage: "Готов новый релиз",
                lastTime: "09:15",
                unreadCount: 1,
            },
            {
                id: "3",
                name: "Поддержка",
                lastMessage: "Как дела?",
                lastTime: "вчера",
            },
        ];

        // Mock messages
        messages = {
            "1": [
                {
                    id: "1",
                    author: "Алекс",
                    content: "Привет всем! Как дела?",
                    time: "10:00",
                    isOwn: false,
                },
                {
                    id: "2",
                    author: "Вы",
                    content:
                        "Привет! Всё отлично, работаем над новыми функциями",
                    time: "10:15",
                    isOwn: true,
                },
                {
                    id: "3",
                    author: "Мария",
                    content: "Круто! А что именно делаете?",
                    time: "10:20",
                    isOwn: false,
                },
                {
                    id: "4",
                    author: "Вы",
                    content:
                        "Улучшаем систему безопасности чатов, добавляем E2E шифрование",
                    time: "10:25",
                    isOwn: true,
                },
                {
                    id: "5",
                    author: "Алекс",
                    content: "Звучит интересно! Когда планируете релиз?",
                    time: "10:30",
                    isOwn: false,
                },
            ],
            "2": [
                {
                    id: "1",
                    author: "Дев-тим",
                    content: "Готов новый релиз v2.1.0! 🚀",
                    time: "09:00",
                    isOwn: false,
                },
                {
                    id: "2",
                    author: "Вы",
                    content: "Отлично! Что нового в этой версии?",
                    time: "09:10",
                    isOwn: true,
                },
                {
                    id: "3",
                    author: "Дев-тим",
                    content:
                        "Добавили поддержку тем, улучшили UI/UX и исправили баги",
                    time: "09:15",
                    isOwn: false,
                },
            ],
            "3": [
                {
                    id: "1",
                    author: "Техподдержка",
                    content: "Как дела? Есть ли вопросы по работе системы?",
                    time: "вчера",
                    isOwn: false,
                },
                {
                    id: "2",
                    author: "Вы",
                    content: "Пока всё работает стабильно, спасибо!",
                    time: "вчера",
                    isOwn: true,
                },
            ],
        };

        return () => {
            window.removeEventListener("resize", checkMobile);
        };
    });

    // Functions
    function selectChat(chatId: string) {
        selectedChatId = chatId;

        setQueryParam([
            ["room_id", chatId]
        ])

        if (isMobile) {
            showSidebar = false;
        }
    }

    function addChat() {
        if (!newChatName.trim()) return;

        const newChat: Chat = {
            id: Date.now().toString(),
            name: newChatName.trim(),
        };

        chats = [newChat, ...chats];
        selectChat(newChat.id);
        newChatName = "";
        showAddDialog = false;
    }

    function goBack() {
        if (isMobile) {
            showSidebar = true;
            selectedChatId = null;

            const url = new URL(window.location.href);
            url.searchParams.delete("room_id");
            window.history.replaceState({}, "", url.toString());
        }
    }

    let selectedChat = $derived(
        selectedChatId ? chats.find((c) => c.id === selectedChatId) : null,
    );
    let currentMessages = $derived(
        selectedChatId ? messages[selectedChatId] || [] : [],
    );
</script>

<div
    class="chat-container"
    data-widget-name="ChatRoomsPage"
    data-theme={$theme}
>
    <header class="chat-header">
        <AnimatedTitle
            opacity={0.1}
            title="SECURE_CHAT_SYSTEM"
            subtitle="СИСТЕМА_БЕЗОПАСНЫХ_СООБЩЕНИЙ"
            statusText="СИСТЕМА АКТИВНА"
            className="chat-title"
        />
    </header>

    <main
        class={`${styles.chatPage} ${layoutStyles.flex} ${layoutStyles.hScreen}`}
    >
        <!-- Sidebar -->
        <div
            class={`${styles.sidebar} ${!showSidebar ? styles.sidebarHidden : ""}`}
        >
            <div class={styles.sidebarHeader}>
                <div class={styles.sidebarHeaderTop}>
                    <Link href={ROUTES.HOME} className={styles.homeLink}
                        >🏠 Главная</Link
                    >
                </div>
                <div class={styles.sidebarHeaderBottom}>
                    <h2 class={styles.sidebarTitle}>Чаты</h2>
                    <Link href={ROUTES.CHAT_ROOMS_ADD} className="inline-block">
                        <Button size="sm">+ Добавить</Button>
                    </Link>
                </div>
            </div>

            <div class={styles.chatsList}>
                {#each chats as chat (chat.id)}
                    <button
                        class={`${styles.chatItem} ${selectedChatId === chat.id ? styles.chatItemActive : ""}`}
                        onclick={() => selectChat(chat.id)}
                    >
                        <div class={styles.chatInfo}>
                            <div class={styles.chatName}>{chat.name}</div>
                            {#if chat.lastMessage}
                                <div class={styles.chatLastMessage}>
                                    {chat.lastMessage}
                                </div>
                            {/if}
                        </div>
                        <div class={styles.chatMeta}>
                            {#if chat.lastTime}
                                <div class={styles.chatTime}>
                                    {chat.lastTime}
                                </div>
                            {/if}
                            {#if chat.unreadCount}
                                <div class={styles.unreadBadge}>
                                    {chat.unreadCount}
                                </div>
                            {/if}
                        </div>
                    </button>
                {/each}

                {#if chats.length === 0}
                    <div class={styles.emptyState}>
                        <p>Нет чатов</p>
                        <Button onclick={() => (showAddDialog = true)}
                            >Создать первый чат</Button
                        >
                    </div>
                {/if}
            </div>
        </div>

        <!-- Chat Area -->
        <div
            class={`${styles.chatArea} ${isMobile && showSidebar ? styles.chatAreaHidden : ""}`}
        >
            {#if selectedChatId}
                {#if selectedChat}
                    <div class={styles.chatHeader}>
                        {#if isMobile}
                            <Button onclick={goBack} variant="ghost" size="sm"
                                >← Назад</Button
                            >
                        {/if}
                        <h3 class={styles.chatHeaderTitle}>
                            {selectedChat.name}
                        </h3>
                        <Button variant="ghost" size="sm">⚙️</Button>
                    </div>

                    <div class={styles.chatMessages}>
                        {#if currentMessages.length > 0}
                            <div class={styles.messagesContainer}>
                                {#each currentMessages as message (message.id)}
                                    <div
                                        class={`${styles.messageItem} ${message.isOwn ? styles.messageOwn : styles.messageOther}`}
                                    >
                                        <div class={styles.messageHeader}>
                                            <span class={styles.messageAuthor}
                                                >{message.author}</span
                                            >
                                            <span class={styles.messageTime}
                                                >{message.time}</span
                                            >
                                        </div>
                                        <div class={styles.messageContent}>
                                            {message.content}
                                        </div>
                                    </div>
                                {/each}
                            </div>
                        {:else}
                            <div class={styles.messagePlaceholder}>
                                <p>Чат "{selectedChat.name}"</p>
                                <p>Здесь будут отображаться сообщения...</p>
                            </div>
                        {/if}
                    </div>

                    <div class={styles.chatInput}>
                        <Input placeholder="Введите сообщение..." />
                        <Button>Отправить</Button>
                    </div>
                {:else}
                    <!-- Chat not found in list - connecting -->
                    <div class={styles.chatConnecting}>
                        {#if isMobile}
                            <div class={styles.chatHeader}>
                                <Button
                                    onclick={goBack}
                                    variant="ghost"
                                    size="sm">← Назад</Button
                                >
                                <h3 class={styles.chatHeaderTitle}>
                                    Подключение...
                                </h3>
                            </div>
                        {/if}
                        <div class={styles.connectingContent}>
                            <div class={styles.connectingSpinner}>
                                <div class={styles.spinner}></div>
                            </div>
                            <h3 class={styles.connectingTitle}>
                                Устанавливаем соединение
                            </h3>
                            <p class={styles.connectingText}>
                                Подключаемся к комнате {selectedChatId}...
                            </p>
                            <p class={styles.connectingSubtext}>
                                Это может занять несколько секунд
                            </p>
                        </div>
                    </div>
                {/if}
            {:else}
                <div class={styles.noChatSelected}>
                    <h3 class={styles.noChatSelectedTitle}>Выберите чат</h3>
                    <p class={styles.noChatSelectedText}>
                        Выберите чат из списка слева или создайте новый
                    </p>
                </div>
            {/if}
        </div>
    </main>

    <PageFooter />

    <!-- Add Chat Dialog -->
    <Dialog
        open={showAddDialog}
        onClose={() => (showAddDialog = false)}
        title="Новый чат"
    >
        <div class={`${layoutStyles.flexCol} ${layoutStyles.gap4}`}>
            <Input
                bind:value={newChatName}
                placeholder="Название чата"
                onkeydown={(e) => e.key === "Enter" && addChat()}
            />
            <div
                class={`${layoutStyles.flex} ${layoutStyles.gap2} ${layoutStyles.justifyEnd}`}
            >
                <Button onclick={addChat} disabled={!newChatName.trim()}
                    >Создать</Button
                >
                <Button onclick={() => (showAddDialog = false)} variant="ghost"
                    >Отмена</Button
                >
            </div>
        </div>
    </Dialog>
</div>

<style>
    /* Critical CSS to prevent race condition on first load */
    :global(.chat-container) {
        display: flex !important;
        flex-direction: column !important;
        min-height: 100vh !important;
        width: 100% !important;
        background-color: var(--les-bg-primary, #0a0a0a) !important;
        color: var(--les-text-primary, #ffffff) !important;
        font-family: "Courier New", Courier, monospace !important;
    }

    :global(.chatPage) {
        flex: 1 !important;
        display: flex !important;
        background-color: var(--les-bg-primary, #0a0a0a) !important;
    }

    :global(.sidebar) {
        width: 300px !important;
        background: var(--les-bg-secondary, #1a1a1a) !important;
        border-right: 1px solid var(--les-border-primary, #333333) !important;
        display: flex !important;
        flex-direction: column !important;
    }

    :global(.chatArea) {
        flex: 1 !important;
        display: flex !important;
        flex-direction: column !important;
        background: var(--les-bg-primary, #0a0a0a) !important;
    }

    /* Ensure proper loading on large screens */
    @media (min-width: 1024px) {
        :global(.chat-container) {
            background-color: var(--les-bg-primary, #0a0a0a) !important;
        }

        :global(.sidebar) {
            width: 350px !important;
            min-width: 350px !important;
        }
    }
</style>
