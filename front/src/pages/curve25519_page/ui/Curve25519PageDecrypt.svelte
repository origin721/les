<script lang="ts">
    import {
        decrypt_curve25519,
        decrypt_curve25519_verify,
        generate_keys_curve25519,
    } from "../../../core/crypt";
    import { copyTextToClipboard } from "../../../core/clip";
    import { Link, ROUTES } from "../../../routing";
    import { appAuthStore } from "../../../stores";
    import { btn } from "../../../styles/button";

    const myKeys = $state({
        pub: "" as string,
        priv: "" as string,
        loading: false,
    });

    const senderKeys = $state({
        pub: "" as string,
    });

    /**
     * Расшифрованный текст
     */
    let decryptedText = $state("");

    let isVerifyDecrypt = $state(false);

    /**
     * Зашифрованный JSON для расшифровки
     */
    let encryptedMessage = $state("");

    async function generateKeys() {
        if (myKeys.loading) return;

        myKeys.loading = true;
        const curve2559 = await generate_keys_curve25519();
        myKeys.priv = curve2559.privateKey;
        myKeys.pub = curve2559.publicKey;
        myKeys.loading = false;
    }

    type SubmitParam = SubmitEvent & {
        currentTarget: EventTarget & HTMLFormElement;
    };

    async function onDecrypt(e: SubmitParam) {
        e.preventDefault();

        if (!myKeys.priv) {
            decryptedText = "Ошибка: отсутствует приватный ключ";
            return;
        }

        if (isVerifyDecrypt && !senderKeys.pub) {
            decryptedText = "Ошибка: отсутствует публичный ключ отправителя";
            return;
        }

        try {
            const encryptedData = JSON.parse(encryptedMessage);

            if (isVerifyDecrypt && myKeys.priv && senderKeys.pub) {
                decryptedText = await decrypt_curve25519_verify({
                    receiverPrivateKey: myKeys.priv as string,
                    senderPublicKey: senderKeys.pub as string,
                    ...encryptedData,
                });
            } else if (!isVerifyDecrypt && myKeys.priv) {
                decryptedText = await decrypt_curve25519({
                    receiverPrivateKey: myKeys.priv as string,
                    ...encryptedData,
                });
            } else {
                decryptedText = "Ошибка: не все необходимые поля заполнены";
            }
        } catch (error) {
            console.error("Ошибка расшифровки:", error);
            decryptedText = "Ошибка расшифровки. Проверьте данные.";
        }
    }

    function clearDecryptedText() {
        decryptedText = "";
    }

    async function copyPublicKey() {
        if (myKeys.pub) {
            await copyTextToClipboard(myKeys.pub);
        }
    }

    async function copyDecryptedText() {
        if (decryptedText) {
            await copyTextToClipboard(decryptedText);
        }
    }

    const widgetCtl = $state({
        selectedAccId: null as null | string,
        clearAcc: () => {
            widgetCtl.selectedAccId = null;
        },
    });

    console.log({ appAuthStore: $appAuthStore });
</script>

<label>
    Выберете акаунт
    <select
        bind:value={widgetCtl.selectedAccId}
        class="text-slate-800 bg-slate-400"
    >
        {#each Object.values($appAuthStore.byId) as account}
            <option value={account.id}
                >{account.namePub} {account.id.slice(0, 3)}</option
            >
        {/each}
    </select>
    <button onclick={widgetCtl.clearAcc}>X</button>
</label>

<label>
    С проверкой подписи
    <input bind:checked={isVerifyDecrypt} type="checkbox" />
</label>

{#if isVerifyDecrypt}
    <div class="flex gap-2">
        <button class={btn} type="button" onclick={generateKeys}
            >Сгенерировать ключи</button
        >
        <button class={btn} type="button">Показать приватный ключ</button>
    </div>
{/if}

<form onsubmit={onDecrypt} class="flex-col flex gap-4">
    {#if isVerifyDecrypt}
        <label class="flex-col flex">
            Ваш публичный ключ
            <div class="flex gap-2">
                <input bind:value={myKeys.pub} required class="flex-1" />
                <button 
                    class={btn} 
                    type="button" 
                    onclick={copyPublicKey}
                    disabled={!myKeys.pub}
                >
                    Копировать
                </button>
            </div>
        </label>
    {/if}

    <label class="flex-col flex">
        Ваш приватный ключ
        <input bind:value={myKeys.priv} required type="password" />
    </label>

    {#if isVerifyDecrypt}
        <label class="flex-col flex">
            Публичный ключ отправителя
            <input bind:value={senderKeys.pub} required />
        </label>
    {/if}

    <label class="flex-col flex">
        Зашифрованное сообщение (JSON)
        <textarea 
            bind:value={encryptedMessage} 
            class="min-h-[5rem]" 
            placeholder="Вставьте зашифрованное сообщение в формате JSON"
            required
        ></textarea>
    </label>

    <button class={btn} type="submit">Расшифровать</button>

    <label class="flex-col flex">
        Расшифрованный текст
        <textarea
            bind:value={decryptedText}
            disabled
            class="min-h-[5rem]"
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
