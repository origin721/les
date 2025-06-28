<script lang="ts">
    import {
        encrypt_curve25519,
        encrypt_curve25519_verify,
    } from "../../../core/crypt";
    import { apiKeysStore } from "../../../stores";
    import { btn } from "../../../styles/button";

    let selectedMyKeyId = $state("");
    let selectedPartnerKeyId = $state("");
    let encryptedText = $state("");
    let isVerifyEncrypt = $state(false);
    let sourceMessage = $state("");

    const store = $derived($apiKeysStore);

    type SubmitParam = SubmitEvent & {
        currentTarget: EventTarget & HTMLFormElement;
    };

    async function onEncrypt(e: SubmitParam) {
        e.preventDefault();

        const partnerKey = store.partnerKeys.find(k => k.id === selectedPartnerKeyId);
        if (!partnerKey) {
            alert("Выберите ключ партнера");
            return;
        }

        if (isVerifyEncrypt) {
            const myKey = store.myKeys.find(k => k.id === selectedMyKeyId);
            if (!myKey) {
                alert("Выберите свой ключ для подписи");
                return;
            }

            const result = await encrypt_curve25519_verify({
                receiverPublicKey: partnerKey.publicKey,
                senderPrivateKey: myKey.privateKey,
                message: sourceMessage,
            });

            if (!result) {
                alert("Ошибка шифрования");
                return;
            }

            // Правильный формат для расшифровки с подписью
            encryptedText = JSON.stringify({
                cipherText: result.cipherText,
                nonce: result.nonce,
            });
        } else {
            const result = await encrypt_curve25519({
                receiverPublicKey: partnerKey.publicKey,
                message: sourceMessage,
            });

            if (!result) {
                alert("Ошибка шифрования");
                return;
            }

            // Для простого шифрования - только hex-строка
            encryptedText = result;
        }
    }

    function clearEncryptedText() {
        encryptedText = "";
    }

    async function copyEncryptedText() {
        if (!encryptedText) {
            alert("Нет текста для копирования");
            return;
        }
        
        try {
            await navigator.clipboard.writeText(encryptedText);
            alert("Зашифрованный текст скопирован в буфер обмена");
        } catch (err) {
            console.error("Ошибка копирования:", err);
            alert("Ошибка копирования в буфер обмена");
        }
    }
</script>

<div class="flex flex-col gap-4">
    {#if store.partnerKeys.length === 0}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p>Сначала добавьте ключи партнеров на вкладке "Управление ключами"</p>
        </div>
    {:else}
        <label>
            С проверкой подписи
            <input bind:checked={isVerifyEncrypt} type="checkbox" />
        </label>

        <form onsubmit={onEncrypt} class="flex-col flex gap-4">
            {#if isVerifyEncrypt}
                <label class="flex-col flex">
                    Выберите свой ключ для подписи
                    <select bind:value={selectedMyKeyId} required class="border border-gray-300 rounded px-3 py-2">
                        <option value="">-- Выберите ключ --</option>
                        {#each store.myKeys as myKey}
                            <option value={myKey.id}>{myKey.name}</option>
                        {/each}
                    </select>
                </label>
            {/if}

            <label class="flex-col flex">
                Выберите ключ партнера для шифрования
                <select bind:value={selectedPartnerKeyId} required class="border border-gray-300 rounded px-3 py-2">
                    <option value="">-- Выберите партнера --</option>
                    {#each store.partnerKeys as partnerKey}
                        <option value={partnerKey.id}>{partnerKey.name}</option>
                    {/each}
                </select>
            </label>

            <label class="flex-col flex">
                Текст для шифрования
                <textarea 
                    bind:value={sourceMessage} 
                    class="min-h-[5rem] border border-gray-300 rounded px-3 py-2"
                    placeholder="Введите сообщение для шифрования"
                    required
                ></textarea>
            </label>

            <button class={btn} type="submit">Зашифровать</button>

            <label class="flex-col flex">
                Зашифрованный текст
                <textarea
                    bind:value={encryptedText}
                    disabled
                    class="min-h-[5rem] border border-gray-300 rounded px-3 py-2 bg-gray-100"
                    placeholder="Здесь появится зашифрованное сообщение"
                ></textarea>
                <div class="flex gap-2">
                    <button class={btn} onclick={copyEncryptedText} type="button" disabled={!encryptedText}>Копировать</button>
                    <button class={btn} onclick={clearEncryptedText} type="button">Очистить</button>
                </div>
            </label>
        </form>
    {/if}
</div>
