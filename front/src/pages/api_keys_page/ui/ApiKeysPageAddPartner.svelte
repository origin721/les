<script lang="ts">
  import { copyTextToClipboard } from "../../../core/clip";
  import { apiKeysStore, type PartnerKey } from "../../../stores/api_keys_store";
  import { btn } from "../../../styles/button";

  // Получаем ключи из store
  const keysState = $derived($apiKeysStore);
  let newPartnerName = $state("");
  let newPartnerKey = $state("");
  let newPartnerDescription = $state("");

  function addPartnerKey() {
    if (!newPartnerName.trim() || !newPartnerKey.trim()) {
      alert("Заполните название и публичный ключ");
      return;
    }

    // Проверяем, что ключ не дублируется
    if (apiKeysStore.hasPartnerKey(newPartnerKey.trim())) {
      alert("Ключ с таким значением уже существует");
      return;
    }

    apiKeysStore.addPartnerKey({
      publicKey: newPartnerKey.trim(),
      name: newPartnerName.trim(),
      description: newPartnerDescription.trim() || undefined,
      createdAt: new Date()
    });

    // Очищаем форму
    newPartnerName = "";
    newPartnerKey = "";
    newPartnerDescription = "";

    alert("Ключ собеседника добавлен!");
  }

  function copyPartnerKey(publicKey: string) {
    copyTextToClipboard(publicKey);
    alert("Публичный ключ скопирован в буфер обмена");
  }

  function deletePartnerKey(index: number) {
    if (confirm("Удалить ключ собеседника?")) {
      partnerKeys.splice(index, 1);
      partnerKeys = [...partnerKeys];
    }
  }

  function formatDate(date: Date): string {
    return date.toLocaleString('ru-RU');
  }

  function validateKey(key: string): boolean {
    // Базовая валидация - проверяем что это похоже на base64 строку
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    return key.length > 20 && base64Regex.test(key);
  }

  function pasteFromClipboard() {
    navigator.clipboard.readText().then(text => {
      newPartnerKey = text.trim();
    }).catch(err => {
      console.error('Ошибка при чтении из буфера обмена:', err);
    });
  }
</script>

<div class="flex flex-col gap-6">
  <h2 class="text-xl font-bold">Добавить ключ собеседника</h2>

  <!-- Форма добавления ключа -->
  <div class="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
    <form on:submit|preventDefault={addPartnerKey} class="flex flex-col gap-4">
      <label class="flex flex-col gap-2">
        <span class="font-medium">Имя собеседника: *</span>
        <input 
          bind:value={newPartnerName}
          type="text" 
          placeholder="Например: Алексей"
          class="p-2 border rounded text-black"
          required
        />
      </label>

      <label class="flex flex-col gap-2">
        <span class="font-medium">Публичный ключ: *</span>
        <div class="flex gap-2">
          <textarea 
            bind:value={newPartnerKey}
            placeholder="Вставьте публичный ключ собеседника"
            class="flex-1 p-2 border rounded text-black font-mono text-sm"
            rows="3"
            required
          ></textarea>
          <button 
            type="button"
            on:click={pasteFromClipboard}
            class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 self-start"
          >
            Вставить
          </button>
        </div>
        {#if newPartnerKey && !validateKey(newPartnerKey)}
          <p class="text-sm text-red-600">
            ⚠️ Ключ должен быть в формате base64 и длиной более 20 символов
          </p>
        {/if}
      </label>

      <label class="flex flex-col gap-2">
        <span class="font-medium">Описание (необязательно):</span>
        <input 
          bind:value={newPartnerDescription}
          type="text" 
          placeholder="Например: Рабочий контакт"
          class="p-2 border rounded text-black"
        />
      </label>

      <button 
        type="submit" 
        class={btn}
        disabled={!newPartnerName.trim() || !newPartnerKey.trim() || !validateKey(newPartnerKey)}
      >
        Добавить ключ
      </button>
    </form>
  </div>

  <!-- Список ключей собеседников -->
  <div>
    <h3 class="text-lg font-bold mb-4">Ключи собеседников ({partnerKeys.length})</h3>
    
    {#if partnerKeys.length === 0}
      <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg text-center">
        <p class="text-gray-600 dark:text-gray-400">
          Ключи собеседников не добавлены
        </p>
        <p class="text-sm text-gray-500 mt-2">
          Добавьте публичный ключ вашего собеседника для безопасного общения
        </p>
      </div>
    {:else}
      <div class="space-y-3">
        {#each partnerKeys as partnerKey, index}
          <div class="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div class="flex justify-between items-start mb-3">
              <div>
                <h4 class="font-bold">{partnerKey.name}</h4>
                {#if partnerKey.description}
                  <p class="text-sm text-gray-600 dark:text-gray-400">{partnerKey.description}</p>
                {/if}
                <p class="text-xs text-gray-500">
                  Добавлен: {formatDate(partnerKey.createdAt)}
                </p>
              </div>
              <button
                on:click={() => deletePartnerKey(index)}
                class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
              >
                Удалить
              </button>
            </div>

            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-50 dark:bg-gray-700 p-2 rounded font-mono text-xs break-all">
                {partnerKey.publicKey}
              </div>
              <button
                on:click={() => copyPartnerKey(partnerKey.publicKey)}
                class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Копировать
              </button>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Информация -->
  <div class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
    <h3 class="font-bold mb-2">ℹ️ Информация:</h3>
    <ul class="list-disc list-inside space-y-1 text-sm">
      <li>Публичные ключи собеседников безопасны для хранения</li>
      <li>Используйте эти ключи для шифрования сообщений</li>
      <li>Всегда проверяйте подлинность ключа с собеседником</li>
      <li>Ключи хранятся только в оперативной памяти</li>
      <li>При перезагрузке страницы все данные будут потеряны</li>
    </ul>
  </div>
</div>
