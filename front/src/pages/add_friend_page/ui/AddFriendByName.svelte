<script lang="ts">
    import { BasePage, ContentSection } from "../../../components/page_templates";
    import { Link, ROUTES } from "../../../routing";
    import { api } from "../../../api";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { writableToState } from "../../../core/svelte_default/runs/writableToState.svelte";

    let friendName = $state('');
    let friendNickname = $state('');
    let selectedAccountId = $state('');
    let loading = $state(false);
    let message = $state('');
    let messageType = $state<'success' | 'error' | ''>('');

    // Используем writableToState для работы с appAuthStore в Svelte 5 стиле
    const appAuthState = writableToState(appAuthStore);

    // Получаем аккаунты из store
    const accounts = $derived(Object.values(appAuthState.state?.byId || {}));

    // Автоматически выбираем первый аккаунт, если он доступен и не выбран
    $effect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            selectedAccountId = accounts[0].id;
        }
    });

    async function handleAddFriend() {
        if (!friendName.trim()) {
            message = 'Введите имя друга';
            messageType = 'error';
            return;
        }

        if (!selectedAccountId) {
            message = 'Выберите аккаунт';
            messageType = 'error';
            return;
        }

        loading = true;
        message = '';
        messageType = '';

        try {
            console.log('🔄 Начинаем добавление друга...');
            
            // Сначала попытаемся войти в аккаунт, чтобы загрузить пароли в SharedWorker
            const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
            console.log('👤 Выбранный аккаунт:', selectedAccount);
            
            if (selectedAccount) {
                // Запрашиваем пароль у пользователя для добавления друга
                console.log('🔑 Запрашиваем пароль...');
                const password = prompt(`Для добавления друга требуется пароль от аккаунта "${selectedAccount.namePub}"`);
                if (!password) {
                    console.log('❌ Пароль не введен');
                    message = 'Для добавления друга необходимо ввести пароль аккаунта';
                    messageType = 'error';
                    loading = false;
                    return;
                }

                console.log('🔄 Выполняем login...');
                // Логинимся с паролем, чтобы загрузить аккаунты в SharedWorker
                await api.accounts.login(password);
                console.log('✅ Login выполнен успешно');
            }

            console.log('🔄 Добавляем друга через API...');
            const friendData = {
                namePub: friendName.trim(),
                myAccId: selectedAccountId,
                friendPubKeyLibp2p: '' // Будет заполнен позже
            };
            console.log('📝 Данные друга:', friendData);

            await api.friends.add([friendData]);
            console.log('✅ Друг добавлен успешно');

            message = `Друг "${friendName}" добавлен в список контактов`;
            messageType = 'success';
            
            // Очистка формы
            friendName = '';
            friendNickname = '';
        } catch (error) {
            console.error('❌ Ошибка добавления друга:', error);
            console.error('❌ Полная ошибка:', {
                message: (error as any)?.message,
                stack: (error as any)?.stack,
                name: (error as any)?.name,
                error
            });
            message = `Ошибка при добавлении друга: ${(error as any)?.message || String(error)}`;
            messageType = 'error';
        } finally {
            console.log('🏁 Завершение процесса добавления друга');
            loading = false;
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !loading) {
            handleAddFriend();
        }
    }
</script>

<BasePage 
    title="ADD_FRIEND_BY_NAME"
    subtitle="ДОБАВЛЕНИЕ_КОНТАКТА_ПО_ИМЕНИ"
    pageName="AddFriendByNamePage"
    footerVersion="// ADD_FRIEND_BY_NAME_v0.1.0 //"
    footerStatus="MODE: SIMPLE"
>
    {#snippet children()}
        <ContentSection 
            title="// ДОБАВИТЬ ДРУГА ПО ИМЕНИ //"
            description="Простое добавление контакта с возможностью последующей настройки безопасного соединения"
        >
            {#snippet children()}
                <div class="form-container">
                    <div class="form-wrapper">
                        <div class="form-header">
                            <div class="form-icon">👤</div>
                            <h3 class="form-title">НОВЫЙ КОНТАКТ</h3>
                        </div>

                        <div class="form-content">
                            <div class="input-group">
                                <label for="account-select" class="input-label">
                                    <span class="label-icon">👤</span>
                                    <span class="label-text">ВЫБЕРИТЕ АККАУНТ *</span>
                                </label>
                                {#if accounts.length === 0}
                                    <div class="no-accounts">
                                        <span class="warning-icon">⚠️</span>
                                        <span>Нет доступных аккаунтов</span>
                                        <Link href={ROUTES.ACCOUNTS_NEW} className="create-account-link">
                                            Создать аккаунт
                                        </Link>
                                    </div>
                                {:else}
                                    <select
                                        id="account-select"
                                        bind:value={selectedAccountId}
                                        class="form-select"
                                        disabled={loading}
                                    >
                                        {#each accounts as account}
                                            <option value={account.id}>
                                                {account.namePub} (ID: {account.id.slice(0, 8)}...)
                                            </option>
                                        {/each}
                                    </select>
                                {/if}
                            </div>

                            <div class="input-group">
                                <label for="friend-name" class="input-label">
                                    <span class="label-icon">📝</span>
                                    <span class="label-text">ИМЯ ДРУГА *</span>
                                </label>
                                <input
                                    id="friend-name"
                                    type="text"
                                    bind:value={friendName}
                                    onkeydown={handleKeydown}
                                    placeholder="Введите имя..."
                                    class="form-input"
                                    disabled={loading}
                                    autocomplete="off"
                                />
                            </div>

                            <div class="input-group">
                                <label for="friend-nickname" class="input-label">
                                    <span class="label-icon">🏷️</span>
                                    <span class="label-text">НИКНЕЙМ (ОПЦИОНАЛЬНО)</span>
                                </label>
                                <input
                                    id="friend-nickname"
                                    type="text"
                                    bind:value={friendNickname}
                                    onkeydown={handleKeydown}
                                    placeholder="Отображаемое имя..."
                                    class="form-input"
                                    disabled={loading}
                                    autocomplete="off"
                                />
                            </div>

                            {#if message}
                                <div class="message message-{messageType}">
                                    <span class="message-icon">
                                        {messageType === 'success' ? '✅' : '❌'}
                                    </span>
                                    <span class="message-text">{message}</span>
                                </div>
                            {/if}

                            <div class="form-actions">
                                <button
                                    class="action-button primary"
                                    onclick={handleAddFriend}
                                    disabled={loading || !friendName.trim()}
                                >
                                    {#if loading}
                                        <span class="button-spinner">⟳</span>
                                        <span>ДОБАВЛЕНИЕ...</span>
                                    {:else}
                                        <span class="button-icon">➕</span>
                                        <span>ДОБАВИТЬ ДРУГА</span>
                                    {/if}
                                </button>

                                <Link href={ROUTES.ADD_FRIEND} className="action-button secondary">
                                    <span class="button-icon">⬅️</span>
                                    <span>НАЗАД</span>
                                </Link>
                            </div>
                        </div>

                        <div class="form-info">
                            <div class="info-item">
                                <span class="info-icon">💡</span>
                                <span class="info-text">После добавления вы сможете настроить защищенное соединение</span>
                            </div>
                            <div class="info-item">
                                <span class="info-icon">🔒</span>
                                <span class="info-text">Для безопасной связи потребуется обмен ключами шифрования</span>
                            </div>
                        </div>
                    </div>
                </div>
            {/snippet}
        </ContentSection>
    {/snippet}
</BasePage>

<style>
    .form-container {
        display: flex;
        justify-content: center;
        padding: 2rem 0;
    }

    .form-wrapper {
        background: var(--card-background);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        padding: 2.5rem;
        max-width: 500px;
        width: 100%;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
    }

    .form-header {
        display: flex;
        align-items: center;
        gap: 1rem;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid var(--border-color);
    }

    .form-icon {
        font-size: 2.5rem;
        filter: drop-shadow(0 0 10px var(--primary-color));
    }

    .form-title {
        color: var(--primary-color);
        font-size: 1.5rem;
        font-weight: bold;
        margin: 0;
        text-shadow: 0 0 8px var(--primary-color);
    }

    .form-content {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .input-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .input-label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-color);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .label-icon {
        font-size: 1.1rem;
    }

    .label-text {
        font-family: 'Courier New', monospace;
    }

    .form-input {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-color);
        font-size: 1rem;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        outline: none;
    }

    .form-input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.3);
    }

    .form-input:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .form-input::placeholder {
        color: var(--secondary-color);
        opacity: 0.7;
    }

    .form-select {
        background: rgba(0, 0, 0, 0.4);
        border: 1px solid var(--border-color);
        border-radius: 6px;
        color: var(--text-color);
        font-size: 1rem;
        padding: 0.75rem 1rem;
        transition: all 0.3s ease;
        outline: none;
        cursor: pointer;
    }

    .form-select:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 15px rgba(var(--primary-color-rgb), 0.3);
    }

    .form-select:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    .form-select option {
        background: rgba(0, 0, 0, 0.9);
        color: var(--text-color);
        padding: 0.5rem;
    }

    .no-accounts {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem;
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        border-radius: 6px;
        color: #ef4444;
        text-align: center;
    }

    .warning-icon {
        font-size: 1.5rem;
    }

    :global(.create-account-link) {
        color: var(--primary-color);
        text-decoration: none;
        font-weight: 600;
        font-size: 0.9rem;
        padding: 0.5rem 1rem;
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        transition: all 0.3s ease;
    }

    :global(.create-account-link:hover) {
        background: var(--primary-color);
        color: #000;
        box-shadow: 0 0 15px var(--primary-color);
    }

    .message {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .message-success {
        background: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
    }

    .message-error {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.3);
        color: #ef4444;
    }

    .message-icon {
        font-size: 1.1rem;
    }

    .form-actions {
        display: flex;
        gap: 1rem;
        margin-top: 1rem;
    }

    .action-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        font-size: 0.9rem;
        text-transform: uppercase;
        transition: all 0.3s ease;
        cursor: pointer;
        border: none;
        text-decoration: none;
        flex: 1;
        justify-content: center;
    }

    .action-button.primary {
        background: var(--primary-color);
        color: #000;
        border: 1px solid var(--primary-color);
    }

    .action-button.primary:hover:not(:disabled) {
        background: transparent;
        color: var(--primary-color);
        box-shadow: 0 0 20px var(--primary-color);
    }

    .action-button.primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }

    :global(.action-button.secondary) {
        background: transparent;
        color: var(--secondary-color);
        border: 1px solid var(--border-color);
    }

    :global(.action-button.secondary:hover) {
        border-color: var(--secondary-color);
        box-shadow: 0 0 15px rgba(var(--secondary-color-rgb), 0.3);
    }

    .button-icon {
        font-size: 1.1rem;
    }

    .button-spinner {
        animation: spin 1s linear infinite;
        font-size: 1.1rem;
    }

    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }

    .form-info {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .info-item {
        display: flex;
        align-items: flex-start;
        gap: 0.5rem;
        font-size: 0.85rem;
        color: var(--secondary-color);
        line-height: 1.4;
    }

    .info-icon {
        font-size: 1rem;
        margin-top: 0.1rem;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .form-container {
            padding: 1rem;
        }

        .form-wrapper {
            padding: 2rem;
        }

        .form-actions {
            flex-direction: column;
        }
    }

    @media (max-width: 480px) {
        .form-wrapper {
            padding: 1.5rem;
        }

        .form-header {
            flex-direction: column;
            text-align: center;
            gap: 0.5rem;
        }

        .form-title {
            font-size: 1.3rem;
        }
    }
</style>
