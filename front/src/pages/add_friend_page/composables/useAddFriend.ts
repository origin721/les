import { sharedWorkerApi } from "../api/shared_worker";

export interface AddFriendData {
    friendName: string;
    friendNickname: string;
    selectedAccountId: string;
}

export interface AddFriendResult {
    success: boolean;
    message: string;
    messageType: 'success' | 'error' | '';
}

export async function useAddFriend(data: AddFriendData, accounts: any[]): Promise<AddFriendResult> {
    const { friendName, selectedAccountId } = data;

    // Валидация
    if (!friendName.trim()) {
        return {
            success: false,
            message: 'Введите имя друга',
            messageType: 'error'
        };
    }

    if (!selectedAccountId) {
        return {
            success: false,
            message: 'Выберите аккаунт',
            messageType: 'error'
        };
    }

    // Timeout для операции (10 секунд)
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout: операция превысила 10 секунд')), 10000);
    });

    try {
        console.log('🔄 Начинаем добавление друга...');
        
        // Сначала попытаемся войти в аккаунт, чтобы загрузить пароли в SharedWorker
        const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
        console.log('👤 Выбранный аккаунт:', selectedAccount);
        
        if (selectedAccount) {
            console.log('🔄 Пропускаем аутентификацию...');
        }

        console.log('🔄 Добавляем друга через API...');
        const friendData = {
            namePub: friendName.trim(),
            myAccId: selectedAccountId,
            friendPubKeyLibp2p: '' // Будет заполнен позже
        };
        console.log('📝 Данные друга:', friendData);

        // Используем новый API с явным указанием myAccId
        await Promise.race([
            sharedWorkerApi.friends.add({
                friends: [friendData],
                myAccId: selectedAccountId
            }),
            timeout
        ]);
        
        console.log('✅ Друг добавлен успешно');

        return {
            success: true,
            message: `Друг "${friendName}" добавлен в список контактов`,
            messageType: 'success'
        };
    } catch (error) {
        console.error('❌ Ошибка добавления друга:', error);
        console.error('❌ Полная ошибка:', {
            message: (error as any)?.message,
            stack: (error as any)?.stack,
            name: (error as any)?.name,
            error
        });
        
        return {
            success: false,
            message: `Ошибка при добавлении друга: ${(error as any)?.message || String(error)}`,
            messageType: 'error'
        };
    }
}
