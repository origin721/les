<script lang="ts">
  import { generate_keys_curve25519 } from "../../../core/crypt";
  import { btn } from "../../../styles/button";
  import { copyTextToClipboard } from "../../../core/clip";
  import { apiKeysStore, type KeyPair } from "../../../stores/api_keys_store";

  let currentKeys = $state<KeyPair | null>(null);
  let keyName = $state("");
  let isGenerating = $state(false);
  let showPrivateKey = $state(false);

  // Подписываемся на store для получения актуальной статистики
  const keysState = $derived($apiKeysStore);

  async function generateNewKeys() {
    if (!keyName.trim()) {
      alert("Введите название для ключа");
      return;
    }

    if (isGenerating) return;

    try {
      isGenerating = true;
      const keys = await generate_keys_curve25519();
      
      currentKeys = {
        id: crypto.randomUUID(),
        publicKey: keys.publicKey,
        privateKey: keys.privateKey,
        name: keyName.trim(),
        createdAt: new Date()
      };
      
    } catch (error) {
      console.error("Ошибка генерации ключей:", error);
      alert("Ошибка при генерации ключей");
    } finally {
      isGenerating = false;
    }
  }

  function saveKeys() {
    if (!currentKeys) return;
    
    apiKeysStore.addMyKey(currentKeys);
    alert("Ключи сохранены в оперативной памяти");
    
    // Очищаем форму для нового ключа
    keyName = "";
    currentKeys = null;
    showPrivateKey = false;
  }

  function copyPublicKey() {
    if (currentKeys?.publicKey) {
      copyTextToClipboard(currentKeys.publicKey);
      alert("Публичный ключ скопирован в буфер обмена");
    }
  }

  function copyPrivateKey() {
    if (currentKeys?.privateKey) {
      copyTextToClipboard(currentKeys.privateKey);
      alert("Приватный ключ скопирован в буфер обмена");
    }
  }

  function clearCurrentKeys() {
    currentKeys = null;
    keyName = "";
    showPrivateKey = false;
  }
</script>

<div class="flex flex-col gap-6">
  <h2 class="text-xl font-bold">Создание нового ключа</h2>

  <!-- Форма создания ключа -->
  <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
    <form on:submit|preventDefault={generateNewKeys} class="flex flex-col gap-4">
      <label class="flex flex-col gap-2">
        <span class="font-medium">Название ключа:</span>
        <input 
          bind:value={keyName}
          type="text" 
          placeholder="Например: Основной ключ"
          class="p-2 border rounded text-black"
          required
        />
      </label>

      <button 
        type="submit" 
        class={btn}
        disabled={isGenerating || !keyName.trim()}
      >
        {isGenerating ? "Генерируем..." : "Сгенерировать ключ"}
      </button>
    </form>
  </div>

  <!-- Показ сгенерированного ключа -->
  {#if currentKeys}
    <div class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
      <h3 class="text-lg font-bold mb-4 text-green-800 dark:text-green-200">
        Ключ "{currentKeys.name}" успешно сгенерирован
      </h3>

      <div class="flex flex-col gap-4">
        <!-- Публичный ключ -->
        <div class="flex flex-col gap-2">
          <label class="font-medium">Публичный ключ:</label>
          <div class="flex gap-2">
            <textarea 
              value={currentKeys.publicKey}
              readonly
              class="flex-1 p-2 border rounded font-mono text-sm text-black"
              rows="3"
            ></textarea>
            <button 
              type="button" 
              on:click={copyPublicKey}
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Копировать
            </button>
          </div>
        </div>

        <!-- Приватный ключ -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <label class="font-medium">Приватный ключ:</label>
            <button 
              type="button"
              on:click={() => showPrivateKey = !showPrivateKey}
              class="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
            >
              {showPrivateKey ? "Скрыть" : "Показать"}
            </button>
          </div>
          
          {#if showPrivateKey}
            <div class="flex gap-2">
              <textarea 
                value={currentKeys.privateKey}
                readonly
                class="flex-1 p-2 border rounded font-mono text-sm text-black bg-red-50"
                rows="3"
              ></textarea>
              <button 
                type="button" 
                on:click={copyPrivateKey}
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Копировать
              </button>
            </div>
            <p class="text-sm text-red-600 dark:text-red-400">
              ⚠️ Никому не показывайте приватный ключ!
            </p>
          {/if}
        </div>

        <!-- Действия -->
        <div class="flex gap-2 pt-2">
          <button 
            type="button"
            on:click={saveKeys}
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Сохранить в памяти
          </button>
          <button 
            type="button"
            on:click={clearCurrentKeys}
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Создать новый
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Информация -->
  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
    <h3 class="font-bold mb-2">ℹ️ Важная информация:</h3>
    <ul class="list-disc list-inside space-y-1 text-sm">
      <li>Ключи хранятся только в оперативной памяти</li>
      <li>При перезагрузке страницы все ключи будут удалены</li>
      <li>Публичный ключ можно безопасно передавать собеседникам</li>
      <li>Приватный ключ никому не показывайте!</li>
      <li>Всего сохранено ключей: {keysState.myKeys.length}</li>
    </ul>
  </div>
</div>
