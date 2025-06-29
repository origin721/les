<script lang="ts">
  import { generate_keys_curve25519 } from "../../../core/crypt";
  import { apiKeysStore } from "../../../stores/api_keys_store";
  import { btn } from "../../../styles/button";
  import { copyTextToClipboard } from "../../../core/clip";
  import { validateCurve25519PublicKey, validateKeyName } from "../../../core/validation";

  let isGenerating = $state(false);
  let newKeyName = $state("");
  let newPartnerKeyName = $state("");
  let newPartnerPublicKey = $state("");
  let showPrivateKeys = $state<Record<string, boolean>>({});
  
  // Состояния для валидации
  let keyNameError = $state("");
  let partnerNameError = $state("");
  let partnerKeyError = $state("");

  const store = $derived($apiKeysStore);

  async function generateNewKey() {
    if (isGenerating) return;

    // Валидация имени ключа
    const existingNames = store.myKeys.map(key => key.name);
    const nameValidation = validateKeyName(newKeyName, existingNames);
    
    if (!nameValidation.isValid) {
      keyNameError = nameValidation.error || "";
      return;
    }

    keyNameError = "";
    isGenerating = true;
    
    try {
      const keyPair = await generate_keys_curve25519();
      
      apiKeysStore.addMyKey({
        name: newKeyName.trim(),
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        createdAt: new Date()
      });

      newKeyName = "";
    } catch (error) {
      console.error("Ошибка генерации ключей:", error);
      keyNameError = "Ошибка генерации ключей";
    } finally {
      isGenerating = false;
    }
  }

  function addPartnerKey() {
    if (!newPartnerKeyName.trim() || !newPartnerPublicKey.trim()) return;

    // Валидация имени партнера
    const existingPartnerNames = store.partnerKeys.map(key => key.name);
    const nameValidation = validateKeyName(newPartnerKeyName, existingPartnerNames);
    
    if (!nameValidation.isValid) {
      partnerNameError = nameValidation.error || "";
      return;
    }

    // Валидация публичного ключа
    const keyValidation = validateCurve25519PublicKey(newPartnerPublicKey);
    
    if (!keyValidation.isValid) {
      partnerKeyError = keyValidation.error || "";
      return;
    }

    if (apiKeysStore.hasPartnerKey(newPartnerPublicKey.trim())) {
      partnerKeyError = "Этот ключ уже добавлен";
      return;
    }

    // Очищаем ошибки
    partnerNameError = "";
    partnerKeyError = "";

    apiKeysStore.addPartnerKey({
      name: newPartnerKeyName.trim(),
      publicKey: newPartnerPublicKey.trim(),
      description: "",
      createdAt: new Date()
    });

    newPartnerKeyName = "";
    newPartnerPublicKey = "";
  }

  function removeMyKey(id: string) {
    if (confirm("Удалить этот ключ?")) {
      apiKeysStore.removeMyKey(id);
    }
  }

  function removePartnerKey(id: string) {
    if (confirm("Удалить этот ключ партнера?")) {
      apiKeysStore.removePartnerKey(id);
    }
  }

  function togglePrivateKeyVisibility(keyId: string) {
    showPrivateKeys = {
      ...showPrivateKeys,
      [keyId]: !showPrivateKeys[keyId]
    };
  }

  async function copyToClipboard(text: string) {
    try {
      await copyTextToClipboard(text);
    } catch (error) {
      console.error("Ошибка копирования:", error);
    }
  }

  function formatDate(date: Date) {
    return new Intl.DateTimeFormat('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  // Очистка ошибок при изменении полей
  function clearKeyNameError() {
    keyNameError = "";
  }

  function clearPartnerNameError() {
    partnerNameError = "";
  }

  function clearPartnerKeyError() {
    partnerKeyError = "";
  }
</script>

<div class="flex flex-col gap-6">
  <!-- Генерация новых ключей -->
  <section class="border border-gray-300 rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">Генерация новых ключей</h2>
    
    <div class="flex flex-col gap-3">
      <label class="flex flex-col">
        Название ключа
        <input 
          bind:value={newKeyName} 
          placeholder="Введите название для нового ключа"
          class="border border-gray-300 rounded px-3 py-2"
          disabled={isGenerating}
          oninput={clearKeyNameError}
        />
        {#if keyNameError}
          <span class="text-red-500 text-sm mt-1">{keyNameError}</span>
        {/if}
      </label>
      
      <button 
        class={btn} 
        onclick={generateNewKey}
        disabled={isGenerating || !newKeyName.trim()}
      >
        {isGenerating ? "Генерация..." : "Сгенерировать новую пару ключей"}
      </button>
    </div>
  </section>

  <!-- Мои ключи -->
  <section class="border border-gray-300 rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">Мои ключи ({store.myKeys.length})</h2>
    
    {#if store.myKeys.length === 0}
      <p class="text-gray-500">Нет сохраненных ключей. Сгенерируйте новую пару ключей выше.</p>
    {:else}
      <div class="flex flex-col gap-4">
        {#each store.myKeys as keyPair (keyPair.id)}
          <div class="border border-gray-200 rounded p-3 bg-gray-50">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-semibold">{keyPair.name}</h3>
                <p class="text-sm text-gray-500">Создан: {formatDate(keyPair.createdAt)}</p>
              </div>
              <button 
                class="text-red-500 hover:text-red-700"
                onclick={() => removeMyKey(keyPair.id)}
              >
                Удалить
              </button>
            </div>
            
            <div class="flex flex-col gap-2">
              <div>
                <label class="text-sm font-medium">Публичный ключ:</label>
                <div class="flex gap-2">
                  <input 
                    value={keyPair.publicKey} 
                    readonly 
                    class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  />
                  <button 
                    class={btn + " text-sm"} 
                    onclick={() => copyToClipboard(keyPair.publicKey)}
                  >
                    Копировать
                  </button>
                </div>
              </div>
              
              <div>
                <label class="text-sm font-medium">Приватный ключ:</label>
                <div class="flex gap-2">
                  <input 
                    value={showPrivateKeys[keyPair.id] ? keyPair.privateKey : "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"} 
                    readonly 
                    type={showPrivateKeys[keyPair.id] ? "text" : "password"}
                    class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                  />
                  <button 
                    class={btn + " text-sm"} 
                    onclick={() => togglePrivateKeyVisibility(keyPair.id)}
                  >
                    {showPrivateKeys[keyPair.id] ? "Скрыть" : "Показать"}
                  </button>
                  <button 
                    class={btn + " text-sm"} 
                    onclick={() => copyToClipboard(keyPair.privateKey)}
                  >
                    Копировать
                  </button>
                </div>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>

  <!-- Добавление ключей партнеров -->
  <section class="border border-gray-300 rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">Добавить ключ партнера</h2>
    
    <div class="flex flex-col gap-3">
      <label class="flex flex-col">
        Имя партнера
        <input 
          bind:value={newPartnerKeyName} 
          placeholder="Введите имя партнера"
          class="border border-gray-300 rounded px-3 py-2"
          oninput={clearPartnerNameError}
        />
        {#if partnerNameError}
          <span class="text-red-500 text-sm mt-1">{partnerNameError}</span>
        {/if}
      </label>
      
      <label class="flex flex-col">
        Публичный ключ партнера
        <textarea 
          bind:value={newPartnerPublicKey} 
          placeholder="Вставьте публичный ключ партнера в hex формате (64 символа)"
          class="border border-gray-300 rounded px-3 py-2 min-h-[4rem]"
          oninput={clearPartnerKeyError}
        ></textarea>
        {#if partnerKeyError}
          <span class="text-red-500 text-sm mt-1">{partnerKeyError}</span>
        {/if}
      </label>
      
      <button 
        class={btn} 
        onclick={addPartnerKey}
        disabled={!newPartnerKeyName.trim() || !newPartnerPublicKey.trim()}
      >
        Добавить ключ партнера
      </button>
    </div>
  </section>

  <!-- Ключи партнеров -->
  <section class="border border-gray-300 rounded-lg p-4">
    <h2 class="text-xl font-bold mb-4">Ключи партнеров ({store.partnerKeys.length})</h2>
    
    {#if store.partnerKeys.length === 0}
      <p class="text-gray-500">Нет добавленных ключей партнеров.</p>
    {:else}
      <div class="flex flex-col gap-4">
        {#each store.partnerKeys as partnerKey (partnerKey.id)}
          <div class="border border-gray-200 rounded p-3 bg-gray-50">
            <div class="flex justify-between items-start mb-2">
              <div>
                <h3 class="font-semibold">{partnerKey.name}</h3>
                <p class="text-sm text-gray-500">Добавлен: {formatDate(partnerKey.createdAt)}</p>
              </div>
              <button 
                class="text-red-500 hover:text-red-700"
                onclick={() => removePartnerKey(partnerKey.id)}
              >
                Удалить
              </button>
            </div>
            
            <div>
              <label class="text-sm font-medium">Публичный ключ:</label>
              <div class="flex gap-2">
                <input 
                  value={partnerKey.publicKey} 
                  readonly 
                  class="flex-1 border border-gray-300 rounded px-2 py-1 text-sm bg-white"
                />
                <button 
                  class={btn + " text-sm"} 
                  onclick={() => copyToClipboard(partnerKey.publicKey)}
                >
                  Копировать
                </button>
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </section>
</div>
