<script lang="ts">
    import { encrypt_curve25519, encrypt_curve25519_verify, generate_keys_curve25519 } from "../../../core/crypt";
  import { Link, ROUTES } from "../../../routing";
  import { btn } from "../../../styles/button";

  const myKeys = $state({
    pub:'',
    priv: '',
    loading: false,
  });

  const consumerKeys = $state({
    pub:'',
  });

  /**
   * Зашифрованный
   */
  let encryptedText = $state('');

  let isVerifyEncrypt = $state(false);

  let sourceMessage = $state('');

  async function generateKeys() {
    if(myKeys.loading) return;

    myKeys.loading = true;
    const curve2559 = await generate_keys_curve25519();
    myKeys.priv = curve2559.privateKey;
    myKeys.pub = curve2559.publicKey;
    myKeys.loading = false;
  }
  
  type SubmitParam = SubmitEvent & {
    currentTarget: EventTarget & HTMLFormElement;
  }

  async function onEncrypt(e: SubmitParam) {
    e.preventDefault();
    //e.stopPropagation();

    if(isVerifyEncrypt) {
      encryptedText = JSON.stringify(await encrypt_curve25519_verify({
        receiverPublicKey: consumerKeys.pub,
        senderPrivateKey: myKeys.priv,
        message: sourceMessage,
      }));
    }
    else {
      encryptedText = JSON.stringify(await encrypt_curve25519({
        receiverPublicKey: consumerKeys.pub,
        message: sourceMessage,
      }));
    }
  }

  function clearEncryptedText() {
    encryptedText = '';
  }
</script>

<label>
  Выберете акаунт
  <select class="text-slate-800 bg-slate-400">
    <option value="xxx">hisdoisdf</option>
    <option value="yyy">11hisdoisdf</option>
  </select>
</label>

<label>
  С проверкой подписи
  <input bind:checked={isVerifyEncrypt} type="checkbox"/>
</label>

{#if isVerifyEncrypt}
  <div>
    <button class={btn} type="button" onclick={generateKeys}>Сгенерировать ключи</button>
    <button class={btn} type="button">Показать приватный ключ</button>
  </div>
{/if}

<form onsubmit={onEncrypt} class="flex-col flex gap-4">
  {#if isVerifyEncrypt}
    <label class="flex-col flex">
      Ваш публичный ключ
      <input bind:value={myKeys.pub} required/>
    </label>
  {/if}

  <label class="flex-col flex">
    Публичный ключ собиседника
    <input bind:value={consumerKeys.pub} required/>
  </label>

  <label class="flex-col flex">
    Текст для шифрования
    <textarea bind:value={sourceMessage} class="min-h-[5rem]"/>
  </label>
  <button class={btn} type="submit">Зашифровать</button>
    <label class="flex-col flex">
      Зашифрованный текст
      <textarea bind:value={encryptedText} disabled class="min-h-[5rem]"/>
      <button onclick={clearEncryptedText} type="button">Отчистить</button>
    </label>
</form>