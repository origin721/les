<script lang="ts">
  import { Button, Input, Dialog } from '../../../components/ui';
  import layoutStyles from '../../../styles/modules/layout.module.css';
  import styles from './ChatSettingsPage.module.css';
  import { onMount } from 'svelte';
  
  // Props
  interface Props {
    chatId?: string;
  }
  
  let { chatId }: Props = $props();

  // State
  let chatName = $state('');
  let notifications = $state(true);
  let soundEnabled = $state(true);
  let autoDeleteDays = $state(30);
  let isPrivate = $state(false);
  let showDeleteDialog = $state(false);
  let isLoading = $state(false);

  // Mock chat data
  let chat = $state({
    id: chatId || '1',
    name: 'Общий чат',
    description: 'Основной чат для обсуждений',
    membersCount: 12,
    createdAt: '2024-01-15'
  });

  onMount(() => {
    chatName = chat.name;
    
    // Load chat settings from URL or API
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room_id');
    if (roomId) {
      chat.id = roomId;
    }
  });

  function goBack() {
    const url = new URL(window.location.href);
    url.pathname = url.pathname.replace('/settings', '');
    window.location.href = url.toString();
  }

  function saveSettings() {
    isLoading = true;
    
    // Simulate API call
    setTimeout(() => {
      chat.name = chatName;
      isLoading = false;
      // Show success message or redirect
    }, 1000);
  }

  function deleteChat() {
    showDeleteDialog = false;
    // Navigate back to chat list after deletion
    goBack();
  }

  function toggleNotifications() {
    notifications = !notifications;
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
  }

  function togglePrivacy() {
    isPrivate = !isPrivate;
  }
</script>

<div class={styles.settingsPage}>
  <div class={styles.settingsContainer}>
    <!-- Header -->
    <div class={styles.settingsHeader}>
      <Button onclick={goBack} variant="ghost" size="sm">← Назад</Button>
      <h1 class={styles.settingsTitle}>Настройки чата</h1>
    </div>

    <div class={styles.settingsContent}>
      <!-- General Settings -->
      <div class={styles.settingsSection}>
        <h2 class={styles.sectionTitle}>Основные настройки</h2>
        <div class={styles.settingsGrid}>
          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Название чата</div>
              <p class={styles.settingDescription}>Изменить название этого чата</p>
            </div>
            <div class={styles.settingControl}>
              <Input bind:value={chatName} placeholder="Название чата" />
            </div>
          </div>

          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>ID чата</div>
              <p class={styles.settingDescription}>Уникальный идентификатор: {chat.id}</p>
            </div>
          </div>

          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Участники</div>
              <p class={styles.settingDescription}>{chat.membersCount} участников</p>
            </div>
          </div>

          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Создан</div>
              <p class={styles.settingDescription}>{chat.createdAt}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Notification Settings -->
      <div class={styles.settingsSection}>
        <h2 class={styles.sectionTitle}>Уведомления</h2>
        <div class={styles.settingsGrid}>
          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Уведомления</div>
              <p class={styles.settingDescription}>Получать уведомления о новых сообщениях</p>
            </div>
            <div class={styles.settingControl}>
              <Button 
                onclick={toggleNotifications} 
                variant={notifications ? "primary" : "secondary"}
                size="sm"
              >
                {notifications ? 'Включено' : 'Выключено'}
              </Button>
            </div>
          </div>

          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Звуковые уведомления</div>
              <p class={styles.settingDescription}>Воспроизводить звук при получении сообщений</p>
            </div>
            <div class={styles.settingControl}>
              <Button 
                onclick={toggleSound} 
                variant={soundEnabled ? "primary" : "secondary"}
                size="sm"
                disabled={!notifications}
              >
                {soundEnabled ? 'Включено' : 'Выключено'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <!-- Privacy Settings -->
      <div class={styles.settingsSection}>
        <h2 class={styles.sectionTitle}>Приватность</h2>
        <div class={styles.settingsGrid}>
          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Приватный чат</div>
              <p class={styles.settingDescription}>Только приглашенные пользователи могут присоединиться</p>
            </div>
            <div class={styles.settingControl}>
              <Button 
                onclick={togglePrivacy} 
                variant={isPrivate ? "primary" : "secondary"}
                size="sm"
              >
                {isPrivate ? 'Приватный' : 'Открытый'}
              </Button>
            </div>
          </div>

          <div class={styles.settingItem}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Автоудаление сообщений</div>
              <p class={styles.settingDescription}>Удалять сообщения старше указанного количества дней</p>
            </div>
            <div class={styles.settingControl}>
              <Input 
                value={autoDeleteDays.toString()} 
                onchange={(e) => autoDeleteDays = parseInt((e.target as HTMLInputElement)?.value || '0') || 0}
                type="number"
                placeholder="Дни"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Danger Zone -->
      <div class={`${styles.settingsSection} ${styles.dangerZone}`}>
        <h2 class={styles.sectionTitle}>Опасная зона</h2>
        <div class={styles.settingsGrid}>
          <div class={`${styles.settingItem} ${styles.dangerAction}`}>
            <div class={styles.settingInfo}>
              <div class={styles.settingLabel}>Удалить чат</div>
              <p class={styles.settingDescription}>Безвозвратно удалить этот чат и все сообщения</p>
            </div>
            <div class={styles.settingControl}>
              <Button 
                onclick={() => showDeleteDialog = true} 
                variant="danger" 
                size="sm"
              >
                Удалить чат
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class={styles.settingsActions}>
      <Button onclick={goBack} variant="ghost">Отмена</Button>
      <Button 
        onclick={saveSettings} 
        variant="primary"
        disabled={isLoading || !chatName.trim()}
        loading={isLoading}
      >
        {isLoading ? 'Сохранение...' : 'Сохранить'}
      </Button>
    </div>
  </div>

  <!-- Delete Confirmation Dialog -->
  <Dialog 
    open={showDeleteDialog} 
    onClose={() => showDeleteDialog = false} 
    title="Удалить чат?"
  >
    <div class={`${layoutStyles.flexCol} ${layoutStyles.gap4}`}>
      <p>Вы уверены, что хотите удалить чат "{chat.name}"?</p>
      <p>Это действие нельзя отменить. Все сообщения будут потеряны.</p>
      
      <div class={`${layoutStyles.flex} ${layoutStyles.gap2} ${layoutStyles.justifyEnd}`}>
        <Button onclick={() => showDeleteDialog = false} variant="ghost">Отмена</Button>
        <Button onclick={deleteChat} variant="danger">Удалить</Button>
      </div>
    </div>
  </Dialog>
</div>
