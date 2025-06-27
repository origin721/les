<script lang="ts">
  import { copyTextToClipboard } from "../../../core/clip";
  import { apiKeysStore } from "../../../stores/api_keys_store";

  // Получаем ключи из store
  const keysState = $derived($apiKeysStore);
  let showPrivateKeys = $state<{[key: string]: boolean}>({});

  function copyPublicKey(publicKey: string) {
    copyTextToClipboard(publicKey);
    alert("Публичный ключ скопирован в буфер обмена");
  }

  function copyPrivateKey(privateKey: string) {
    copyTextToClipboard(privateKey);
    alert("Приватный ключ скопирован в буфер обмена");
  }

  function togglePrivateKey(keyName: string) {
    showPrivateKeys[keyName] = !showPrivateKeys[keyName];
  }

  function deleteKey(id: string) {
    if (confirm("Вы уверены, что хотите удалить этот ключ?")) {
      apiKeysStore.removeMyKey(id);
    }
  }

  function formatDate(date: Date): string {
    return date.toLocaleString('ru-RU');
  }

  function truncateKey(key: string, length: number = 20): string {
    return key.length > length ? key.substring(0, length) + "..." : key;
  }
</script>

<div class="flex flex-col gap-6">
  <h2 class="text-xl font-bold">Мои ключи</h2>

  {#if keysState.myKeys.length === 0}
    <div class="bg-gray-50 dark:bg-gray-800 p-8 rounded-lg text-center">
      <p class="text-gray-600 dark:text-gray-400">
        У вас пока нет сохранённых ключей
      </p>
      <p class="text-sm text-gray-500 mt-2">
        Перейдите на вкладку "Создать ключ" для генерации нового ключа
      </p>
    </div>
  {:else}
    <div class="space-y-4">
      {#each keysState.myKeys as keyPair}
        <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="font-bold text-lg">{keyPair.name}</h3>
              <p class="text-sm text-gray-500">
                Создан: {formatDate(keyPair.createdAt)}
              </p>
            </div>
            <button
              on:click={() => deleteKey(keyPair.id)}
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
            >
              Удалить
            </button>
          </div>

          <!-- Публичный ключ -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="font-medium">Публичный ключ:</label>
              <button
                on:click={() => copyPublicKey(keyPair.publicKey)}
                class="px-2 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
              >
                Копировать
              </button>
            </div>
            <div class="bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono text-sm break-all">
              {keyPair.publicKey}
            </div>
          </div>

          <!-- Приватный ключ -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <label class="font-medium">Приватный ключ:</label>
              <div class="flex gap-2">
                <button
                  on:click={() => togglePrivateKey(keyPair.name)}
                  class="px-2 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                >
                  {showPrivateKeys[keyPair.name] ? "Скрыть" : "Показать"}
                </button>
                {#if showPrivateKeys[keyPair.name]}
                  <button
                    on:click={() => copyPrivateKey(keyPair.privateKey)}
                    class="px-2 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                  >
                    Копировать
                  </button>
                {/if}
              </div>
            </div>
            
            <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {#if showPrivateKeys[keyPair.name]}
                <div class="font-mono text-sm break-all mb-2">
                  {keyPair.privateKey}
                </div>
                <p class="text-xs text-red-600 dark:text-red-400">
                  ⚠️ Никому не показывайте приватный ключ!
                </p>
              {:else}
                <div class="text-gray-500 text-sm">
                  ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                </div>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Статистика -->
  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
    <h3 class="font-bold mb-2">📊 Статистика:</h3>
    <ul class="text-sm space-y-1">
      <li>Всего ключей: {keysState.myKeys.length}</li>
      <li>Ключи хранятся только в оперативной памяти</li>
      <li>При перезагрузке страницы все данные будут потеряны</li>
    </ul>
  </div>
</div>
