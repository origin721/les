<script lang="ts">
    import {
        decrypt_curve25519,
        decrypt_curve25519_verify,
    } from "../../../core/crypt";
    import { copyTextToClipboard } from "../../../core/clip";
    import { apiKeysStore } from "../../../stores";
    import { btn } from "../../../styles/button";

    let decryptedText = $state("");
    let isVerifyDecrypt = $state(false);
    let encryptedMessage = $state("");
    let selectedSenderKeyId = $state("");
    let decryptionLog = $state<string[]>([]);

    const store = $derived($apiKeysStore);

    type SubmitParam = SubmitEvent & {
        currentTarget: EventTarget & HTMLFormElement;
    };

    async function onDecrypt(e: SubmitParam) {
        e.preventDefault();
        
        decryptionLog = [];
        decryptedText = "";

        if (store.myKeys.length === 0) {
            decryptedText = "Ошибка: нет сохраненных ключей для расшифровки";
            return;
        }

        if (isVerifyDecrypt && !selectedSenderKeyId) {
            decryptedText = "Ошибка: выберите ключ отправителя для проверки подписи";
            return;
        }

        try {
            const encryptedData = JSON.parse(encryptedMessage);
            let decryptionSuccessful = false;

            // Перебираем все мои ключи для расшифровки
            for (const myKey of store.myKeys) {
                try {
                    decryptionLog = [...decryptionLog, `Попытка расшифровки ключом: ${myKey.name}`];

                    let result: string;

                    if (isVerifyDecrypt) {
                        const senderKey = store.partnerKeys.find(k => k.id === selectedSenderKeyId);
                        if (!senderKey) {
                            decryptionLog = [...decryptionLog, `Ошибка: ключ отправителя не найден`];
                            continue;
                        }

                        result = await decrypt_curve25519_verify({
                            receiverPrivateKey: myKey.privateKey,
                            senderPublicKey: senderKey.publicKey,
                            encryptedMessage: encryptedData.encryptedMessage,
                            nonce: encryptedData.nonce,
                            signature: encryptedData.signature
                        });
                    } else {
                        result = await decrypt_curve25519({
                            receiverPrivateKey: myKey.privateKey,
                            encryptedMessage: encryptedData.encryptedMessage,
                            nonce: encryptedData.nonce
                        });
                    }

                    decryptedText = result;
                    decryptionLog = [...decryptionLog, `✅ Успешно расшифровано ключом: ${myKey.name}`];
                    decryptionSuccessful = true;
                    break;

                } catch (error) {
                    decryptionLog = [...decryptionLog, `❌ Ошибка с ключом ${myKey.name}: ${error}`];
                    continue;
                }
            }

            if (!decryptionSuccessful) {
                decryptedText = "Не удалось расшифровать сообщение ни одним из ваших ключей";
            }

        } catch (error) {
            console.error("Ошибка парсинга JSON:", error);
            decryptedText = "Ошибка: неверный формат зашифрованного сообщения";
        }
    }

    function clearDecryptedText() {
        decryptedText = "";
        decryptionLog = [];
    }

    async function copyDecryptedText() {
        if (decryptedText) {
            await copyTextToClipboard(decryptedText);
        }
    }
</script>

<div class="flex flex-col gap-4">
    {#if store.myKeys.length === 0}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Сначала добавьте свои ключи на вкладке "Управление ключами"</p>
        </div>
    {:else}
        <label>
            С проверкой подписи
            <input bind:checked={isVerifyDecrypt} type="checkbox" />
        </label>

        <form onsubmit={onDecrypt} class="flex-col flex gap-4">
            {#if isVerifyDecrypt}
                <label class="flex-col flex">
                    Выберите ключ отправителя для проверки подписи
                    <select bind:value={selectedSenderKeyId} required class="border border-gray-300 rounded px-3 py-2">
                        <option value="">-- Выберите отправителя --</option>
                        {#each store.partnerKeys as partnerKey}
                            <option value={partnerKey.id}>{partnerKey.name}</option>
                        {/each}
                    </select>
                </label>
            {/if}

            <label class="flex-col flex">
                Зашифрованное сообщение (JSON)
                <textarea 
                    bind:value={encryptedMessage} 
                    class="min-h-[5rem] border border-gray-300 rounded px-3 py-2" 
                    placeholder="Вставьте зашифрованное сообщение в формате JSON"
                    required
                ></textarea>
            </label>

            <button class={btn} type="submit">Расшифровать всеми ключами</button>

            {#if decryptionLog.length > 0}
                <div class="border border-gray-300 rounded p-3 bg-gray-50">
                    <h4 class="font-semibold mb-2">Лог расшифровки:</h4>
                    <div class="text-sm space-y-1">
                        {#each decryptionLog as logEntry}
                            <div class="font-mono">{logEntry}</div>
                        {/each}
                    </div>
                </div>
            {/if}

            <label class="flex-col flex">
                Расшифрованный текст
                <textarea
                    bind:value={decryptedText}
                    disabled
                    class="min-h-[5rem] border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    placeholder="Здесь появится расшифрованное сообщение"
                ></textarea>
                <div class="flex gap-2 mt-2">
                    <button 
                        class={btn} 
                        onclick={clearDecryptedText} 
                        type="button"
                    >
                        Очистить
                    </button>
                    <button 
                        class={btn} 
                        type="button" 
                        onclick={copyDecryptedText}
                        disabled={!decryptedText}
                    >
                        Копировать
                    </button>
                </div>
            </label>
        </form>
    {/if}
</div>
