<script lang="ts">
    import {
        generate_keys_ed25519,
        sign_ed25519,
        verify_sign_ed25519,
    } from "../../../core/crypt";
    import { copyTextToClipboard } from "../../../core/clip";
    import { btn } from "../../../styles/button";

    let message = $state("");
    let signature = $state("");
    let signatureToVerify = $state("");
    let messageToVerify = $state("");
    let publicKeyToVerify = $state("");
    let verificationResult = $state("");
    let signKeys = $state<{publicKey: string, privateKey: string} | null>(null);

    async function generateSignKeys() {
        const keys = await generate_keys_ed25519();
        if (keys) {
            signKeys = keys;
        }
    }

    async function signMessage() {
        if (!signKeys || !message) {
            signature = "Ошибка: сгенерируйте ключи и введите сообщение";
            return;
        }

        try {
            const result = await sign_ed25519({
                privateKey: signKeys.privateKey,
                message: message
            });

            if (result) {
                signature = result;
            } else {
                signature = "Ошибка при создании подписи";
            }
        } catch (error) {
            signature = `Ошибка: ${error}`;
        }
    }

    async function verifySignature() {
        if (!publicKeyToVerify || !messageToVerify || !signatureToVerify) {
            verificationResult = "Ошибка: заполните все поля для проверки";
            return;
        }

        try {
            const result = await verify_sign_ed25519({
                publicKey: publicKeyToVerify,
                message: messageToVerify,
                signature: signatureToVerify
            });

            if (result === true) {
                verificationResult = "✅ Подпись действительна! Сообщение подлинное.";
            } else if (result === false) {
                verificationResult = "❌ Подпись недействительна! Сообщение могло быть изменено.";
            } else {
                verificationResult = "❌ Ошибка при проверке подписи";
            }
        } catch (error) {
            verificationResult = `❌ Ошибка: ${error}`;
        }
    }

    async function copySignature() {
        if (signature) {
            await copyTextToClipboard(signature);
        }
    }

    async function copyPublicKey() {
        if (signKeys?.publicKey) {
            await copyTextToClipboard(signKeys.publicKey);
        }
    }

    function clearAll() {
        message = "";
        signature = "";
        signatureToVerify = "";
        messageToVerify = "";
        publicKeyToVerify = "";
        verificationResult = "";
    }
</script>

<div class="flex flex-col gap-6">
    <div class="bg-blue-50 border border-blue-200 rounded p-4">
        <h3 class="font-semibold text-blue-800 mb-2">ℹ️ Что можно подписать, но не шифровать:</h3>
        <ul class="text-blue-700 text-sm space-y-1">
            <li>• <strong>Документы</strong> - подтверждение авторства без сокрытия содержания</li>
            <li>• <strong>Публичные объявления</strong> - гарантия подлинности источника</li>
            <li>• <strong>Программный код</strong> - подтверждение целостности и авторства</li>
            <li>• <strong>Транзакции</strong> - подтверждение авторизации операций</li>
            <li>• <strong>Сертификаты</strong> - подтверждение подлинности данных</li>
            <li>• <strong>Новости и сообщения</strong> - защита от подделки</li>
        </ul>
        <p class="text-blue-600 text-sm mt-2">
            <strong>Цифровая подпись</strong> гарантирует <em>подлинность</em> и <em>целостность</em> данных, 
            но не скрывает их содержание, в отличие от шифрования.
        </p>
    </div>

    <!-- Генерация ключей для подписи -->
    <div class="border border-gray-300 rounded p-4">
        <h3 class="font-semibold mb-3">1. Генерация ключей ED25519 для подписи</h3>
        <button class={btn} onclick={generateSignKeys}>
            Сгенерировать ключи для подписи
        </button>
        
        {#if signKeys}
            <div class="mt-3 space-y-2">
                <div>
                    <label class="block text-sm font-medium">Публичный ключ (для проверки подписи):</label>
                    <div class="flex gap-2">
                        <input 
                            value={signKeys.publicKey} 
                            readonly 
                            class="flex-1 border border-gray-300 rounded px-3 py-2 bg-gray-100 font-mono text-sm"
                        />
                        <button class={btn} onclick={copyPublicKey}>Копировать</button>
                    </div>
                </div>
                <div>
                    <label class="block text-sm font-medium">Приватный ключ (для создания подписи):</label>
                    <input 
                        value={signKeys.privateKey} 
                        readonly 
                        class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 font-mono text-sm"
                    />
                </div>
            </div>
        {/if}
    </div>

    <!-- Создание подписи -->
    <div class="border border-gray-300 rounded p-4">
        <h3 class="font-semibold mb-3">2. Создание цифровой подписи</h3>
        
        <div class="space-y-3">
            <label class="flex-col flex">
                Сообщение для подписи:
                <textarea 
                    bind:value={message} 
                    class="min-h-[4rem] border border-gray-300 rounded px-3 py-2" 
                    placeholder="Введите текст, который хотите подписать (например: 'Я подтверждаю эту транзакцию')"
                ></textarea>
            </label>

            <button 
                class={btn} 
                onclick={signMessage}
                disabled={!signKeys || !message}
            >
                Создать подпись
            </button>

            {#if signature}
                <label class="flex-col flex">
                    Цифровая подпись:
                    <div class="flex gap-2">
                        <textarea
                            bind:value={signature}
                            readonly
                            class="flex-1 min-h-[3rem] border border-gray-300 rounded px-3 py-2 bg-gray-100 font-mono text-sm"
                        ></textarea>
                        <button class={btn} onclick={copySignature}>Копировать</button>
                    </div>
                </label>
            {/if}
        </div>
    </div>

    <!-- Проверка подписи -->
    <div class="border border-gray-300 rounded p-4">
        <h3 class="font-semibold mb-3">3. Проверка цифровой подписи</h3>
        
        <div class="space-y-3">
            <label class="flex-col flex">
                Публичный ключ подписавшего:
                <input 
                    bind:value={publicKeyToVerify} 
                    class="border border-gray-300 rounded px-3 py-2 font-mono text-sm" 
                    placeholder="Вставьте публичный ключ"
                />
            </label>

            <label class="flex-col flex">
                Оригинальное сообщение:
                <textarea 
                    bind:value={messageToVerify} 
                    class="min-h-[4rem] border border-gray-300 rounded px-3 py-2" 
                    placeholder="Введите оригинальное сообщение"
                ></textarea>
            </label>

            <label class="flex-col flex">
                Подпись для проверки:
                <textarea 
                    bind:value={signatureToVerify} 
                    class="min-h-[3rem] border border-gray-300 rounded px-3 py-2 font-mono text-sm" 
                    placeholder="Вставьте подпись"
                ></textarea>
            </label>

            <button 
                class={btn} 
                onclick={verifySignature}
                disabled={!publicKeyToVerify || !messageToVerify || !signatureToVerify}
            >
                Проверить подпись
            </button>

            {#if verificationResult}
                <div class="p-3 rounded border {verificationResult.includes('✅') ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}">
                    {verificationResult}
                </div>
            {/if}
        </div>
    </div>

    <div class="flex gap-2">
        <button class={btn} onclick={clearAll}>Очистить всё</button>
    </div>
</div>
