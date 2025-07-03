<script lang="ts">
    import { BasePage, ContentSection } from "../../../components/page_templates";
    import { Link, ROUTES } from "../../../routing";
    import { api } from "../../../api";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { writableToState } from "../../../core/svelte_default/runs/writableToState.svelte";
    import { Button, Input } from "../../../components/ui";
    import formStyles from "../../../styles/modules/forms.module.css";
    import cardStyles from "../../../styles/modules/cards.module.css";
    import { devUI, devAPI, prodError, prodLog } from "../../../core/debug/logger";

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

        // Timeout для операции (10 секунд)
        const timeout = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout: операция превысила 10 секунд')), 10000);
        });

        try {
            devUI('🔄 Начинаем добавление друга...');
            
            // Сначала попытаемся войти в аккаунт, чтобы загрузить пароли в SharedWorker
            const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
            devUI('👤 Выбранный аккаунт:', $state.snapshot(selectedAccount));
            
            if (selectedAccount) {
                devUI('🔄 Пропускаем аутентификацию...');
            }

            devAPI('🔄 Добавляем друга через API...');
            const friendData = {
                namePub: friendName.trim(),
                myAccId: selectedAccountId,
                friendPubKeyLibp2p: '' // Будет заполнен позже
            };
            devAPI('📝 Данные друга:', friendData);

            // Используем новый API с явным указанием myAccId
            await Promise.race([
                api.friends.add({
                    friends: [friendData],
                    myAccId: selectedAccountId
                }),
                timeout
            ]);
            
            prodLog('✅ Друг добавлен успешно');

            message = `Друг "${friendName}" добавлен в список контактов`;
            messageType = 'success';
            
            // Очистка формы
            friendName = '';
            friendNickname = '';
        } catch (error) {
            prodError('❌ Ошибка добавления друга:', error);
            devUI('❌ Полная ошибка:', {
                message: (error as any)?.message,
                stack: (error as any)?.stack,
                name: (error as any)?.name,
                error
            });
            message = `Ошибка при добавлении друга: ${(error as any)?.message || String(error)}`;
            messageType = 'error';
        } finally {
            devUI('🏁 Завершение процесса добавления друга, сброс loading');
            // Принудительно сбрасываем loading с небольшой задержкой
            setTimeout(() => {
                loading = false;
                devUI('🔄 Loading установлен в false');
            }, 100);
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
    subtitle="ДОБАВИТЬ_ДРУГА"
    pageName="AddFriendByNamePage"
    footerVersion="// ADD_FRIEND_BY_NAME_v0.1.0 //"
    footerStatus="MODE: SIMPLE"
>
    {#snippet children()}
        <ContentSection 
            title="// ДОБАВИТЬ ДРУГА //"
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
                            <div class={formStyles.group}>
                                <label for="account-select" class={`${formStyles.label} ${formStyles.labelRequired}`}>
                                    <span class="label-icon">👤</span>
                                    <span class="label-text">ВЫБЕРИТЕ АККАУНТ</span>
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
                                        class="{formStyles.form} {formStyles.select} {formStyles.md} form-select-styled"
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

                            <div class={formStyles.group}>
                                <label for="friend-name" class={`${formStyles.label} ${formStyles.labelRequired}`}>
                                    <span class="label-icon">📝</span>
                                    <span class="label-text">ИМЯ ДРУГА</span>
                                </label>
                                <Input
                                    id="friend-name"
                                    bind:value={friendName}
                                    onkeydown={handleKeydown}
                                    placeholder="Введите имя..."
                                    disabled={loading}
                                    className="form-input-styled"
                                />
                            </div>

                            <div class={formStyles.group}>
                                <label for="friend-nickname" class={formStyles.label}>
                                    <span class="label-icon">🏷️</span>
                                    <span class="label-text">НИКНЕЙМ (ОПЦИОНАЛЬНО)</span>
                                </label>
                                <Input
                                    id="friend-nickname"
                                    bind:value={friendNickname}
                                    onkeydown={handleKeydown}
                                    placeholder="Отображаемое имя..."
                                    disabled={loading}
                                    className="form-input-styled"
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
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onclick={handleAddFriend}
                                    disabled={loading || !friendName.trim()}
                                    loading={loading}
                                >
                                    {#snippet children()}
                                        {#if loading}
                                            <span>ДОБАВЛЕНИЕ...</span>
                                        {:else}
                                            <span class="button-icon">➕</span>
                                            <span>ДОБАВИТЬ ДРУГА</span>
                                        {/if}
                                    {/snippet}
                                </Button>

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

    .label-icon {
        font-size: 1.1rem;
    }

    .label-text {
        font-family: 'Courier New', monospace;
    }

    /* Стили для полей формы */
    :global(.form-input-styled) {
        background: rgba(0, 0, 0, 0.4) !important;
        border: 1px solid var(--border-color) !important;
        border-radius: 6px !important;
        color: var(--text-color) !important;
        font-size: 1rem !important;
        padding: 0.75rem 1rem !important;
        transition: all 0.3s ease !important;
        outline: none !important;
        width: 100% !important;
    }

    :global(.form-input-styled:focus) {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
    }

    :global(.form-input-styled:disabled) {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
    }

    :global(.form-input-styled::placeholder) {
        color: var(--secondary-color) !important;
        opacity: 0.7 !important;
    }

    :global(.form-select-styled) {
        background: rgba(0, 0, 0, 0.4) !important;
        border: 1px solid var(--border-color) !important;
        border-radius: 6px !important;
        color: var(--text-color) !important;
        font-size: 1rem !important;
        padding: 0.75rem 1rem !important;
        transition: all 0.3s ease !important;
        outline: none !important;
        cursor: pointer !important;
        width: 100% !important;
        appearance: none !important;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e") !important;
        background-position: right 0.5rem center !important;
        background-repeat: no-repeat !important;
        background-size: 1rem !important;
        padding-right: 2.5rem !important;
    }

    :global(.form-select-styled:focus) {
        border-color: var(--primary-color) !important;
        box-shadow: 0 0 15px rgba(0, 255, 255, 0.3) !important;
    }

    :global(.form-select-styled:disabled) {
        opacity: 0.6 !important;
        cursor: not-allowed !important;
    }

    :global(.form-select-styled option) {
        background: rgba(0, 0, 0, 0.9) !important;
        color: var(--text-color) !important;
        padding: 0.5rem !important;
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

    :global(.action-button.secondary) {
        background: transparent;
        color: var(--secondary-color);
        border: 1px solid var(--border-color);
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
        text-decoration: none;
        flex: 1;
        justify-content: center;
    }

    :global(.action-button.secondary:hover) {
        border-color: var(--secondary-color);
        box-shadow: 0 0 15px rgba(var(--secondary-color-rgb), 0.3);
    }

    .button-icon {
        font-size: 1.1rem;
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
