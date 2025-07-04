<script lang="ts">
    import { BasePage, ContentSection } from "../../../components/page_templates";
    import { ROUTES } from "../../../routing";
    import { appAuthStore } from "../../../stores/app_auth_store/app_auth_store";
    import { writableToState } from "../../../core/svelte_default/runs/writableToState.svelte";
    import { 
        FormCard, 
        AccountSelector, 
        FormFieldWithIcon, 
        FormMessage, 
        FormActions, 
        FormInfo 
    } from "../../../components/forms";
    import { useAddFriend, type AddFriendData } from "../../../composables/useAddFriend";
    import layoutStyles from "../../../styles/modules/form-layout.module.css";

    // State
    let friendName = $state('');
    let friendNickname = $state('');
    let selectedAccountId = $state('');
    let loading = $state(false);
    let message = $state('');
    let messageType = $state<'success' | 'error' | ''>('');

    // Store integration
    const appAuthState = writableToState(appAuthStore);
    const accounts = $derived(Object.values(appAuthState.state?.byId || {}));

    // Auto-select first account
    $effect(() => {
        if (accounts.length > 0 && !selectedAccountId) {
            selectedAccountId = accounts[0].id;
        }
    });

    // Info items for the form
    const infoItems = [
        {
            icon: "💡",
            text: "После добавления вы сможете настроить защищенное соединение"
        },
        {
            icon: "🔒",
            text: "Для безопасной связи потребуется обмен ключами шифрования"
        }
    ];

    // Handlers
    async function handleAddFriend() {
        loading = true;
        message = '';
        messageType = '';

        const data: AddFriendData = {
            friendName,
            friendNickname,
            selectedAccountId
        };

        try {
            const result = await useAddFriend(data, accounts);
            
            message = result.message;
            messageType = result.messageType;
            
            if (result.success) {
                // Clear form on success
                friendName = '';
                friendNickname = '';
            }
        } finally {
            // Reset loading with small delay to prevent UI flicker
            setTimeout(() => {
                loading = false;
            }, 100);
        }
    }

    function handleKeydown(event: KeyboardEvent) {
        if (event.key === 'Enter' && !loading) {
            handleAddFriend();
        }
    }

    function handleAccountChange(value: string) {
        selectedAccountId = value;
    }

    function handleFriendNameChange(value: string) {
        friendName = value;
    }

    function handleFriendNicknameChange(value: string) {
        friendNickname = value;
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
                <div class={layoutStyles.formContainer}>
                    <FormCard icon="👤" title="НОВЫЙ КОНТАКТ">
                        {#snippet children()}
                            <AccountSelector
                                {accounts}
                                {selectedAccountId}
                                {loading}
                                onchange={handleAccountChange}
                            />

                            <FormFieldWithIcon
                                id="friend-name"
                                label="ИМЯ ДРУГА"
                                icon="📝"
                                value={friendName}
                                placeholder="Введите имя..."
                                required={true}
                                disabled={loading}
                                onchange={handleFriendNameChange}
                                {onkeydown}
                            />

                            <FormFieldWithIcon
                                id="friend-nickname"
                                label="НИКНЕЙМ (ОПЦИОНАЛЬНО)"
                                icon="🏷️"
                                value={friendNickname}
                                placeholder="Отображаемое имя..."
                                disabled={loading}
                                onchange={handleFriendNicknameChange}
                                {onkeydown}
                            />

                            <FormMessage {message} type={messageType} />

                            <FormActions
                                primaryText="ДОБАВИТЬ ДРУГА"
                                primaryLoadingText="ДОБАВЛЕНИЕ..."
                                primaryIcon="➕"
                                secondaryText="НАЗАД"
                                secondaryIcon="⬅️"
                                secondaryHref={ROUTES.ADD_FRIEND}
                                {loading}
                                disabled={loading || !friendName.trim()}
                                onPrimaryClick={handleAddFriend}
                            />

                            <FormInfo items={infoItems} />
                        {/snippet}
                    </FormCard>
                </div>
            {/snippet}
        </ContentSection>
    {/snippet}
</BasePage>
