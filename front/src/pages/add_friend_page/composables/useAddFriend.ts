import { sharedWorkerApi } from "../../../api/shared_worker";
import { devLog } from "../../../core/debug/logger";

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
        devLog('🔄 Начинаем добавление друга...');
        
        // Сначала попытаемся войти в аккаунт, чтобы загрузить пароли в SharedWorker
        const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);
        devLog('👤 Выбранный аккаунт:', selectedAccount);
        
        if (selectedAccount) {
            devLog('🔄 Пропускаем аутентификацию...');
        }

        devLog('🔄 Добавляем друга через API...');
        const friendData = {
            namePub: friendName.trim(),
            myAccId: selectedAccountId,
            explicitMyAccId: selectedAccountId,
            friendPubKeyLibp2p: '' // Будет заполнен позже
        };
        devLog('📝 Данные друга:', friendData);

        // Используем новый API с явным указанием myAccId
        await Promise.race([
            sharedWorkerApi.friends.add({
                friends: [friendData],
                myAccId: selectedAccountId
            }),
            timeout
        ]);
        
        devLog('✅ Друг добавлен успешно');

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
