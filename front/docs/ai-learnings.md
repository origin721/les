# AI Learnings: Система Друзей - Ключевые Знания

Документ содержит важные знания, полученные при разработке системы друзей в secure-message проекте.

## 🏗️ Архитектурные Паттерны

### Broadcast Channel Communication
```typescript
// ПРАВИЛЬНО: Используйте broadcast для синхронизации данных
function handleBroadcastMessage(event: MessageEvent<PostMessageParam>) {
    if (action === FrontMiddlewareActions.ADD_FRIENDS) {
        // Прямое обновление данных без API вызова
        friends = data.list as FriendEntityFull[];
    }
}

// НЕПРАВИЛЬНО: Не вызывайте API при broadcast событиях
if (action === FrontMiddlewareActions.ADD_FRIENDS) {
    loadFriends(); // Создает бесконечный цикл!
}
```

### Service Layer Return Values
```typescript
// ВАЖНО: Service методы должны возвращать данные
export async function getList(): Promise<FriendEntityFull[]> {
    const friends = await getFriends();
    return friends || []; // Обязательно return!
}

// Middleware должен правильно типизировать возвращаемые значения
type ResultByPath = {
    '/friends/getList': FriendEntityFull[]; // Не void!
}
```

## 🎨 UX/UI Best Practices

### Loading States с Overlay
```svelte
<!-- ПРАВИЛЬНЫЙ подход: Loading как overlay -->
<div class="content-container">
    <!-- Контент всегда виден -->
    {#if friends.length === 0}
        <div class="empty-state">...</div>
    {:else}
        <div class="friends-grid">...</div>
    {/if}
    
    <!-- Loading поверх контента -->
    {#if loading}
        <div class="loading-overlay" transition:fade={{duration: 300}}>
            ...
        </div>
    {/if}
</div>
```

```css
/* Ключевые CSS свойства для overlay */
.loading-overlay {
    position: absolute;
    z-index: 1;
    pointer-events: none; /* Не блокирует взаимодействие */
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(2px);
}

.loading-content {
    pointer-events: auto; /* Сам loading остается интерактивным */
}
```

### Гарантированное время загрузки
```typescript
// ПРАВИЛЬНО: Гарантированное время независимо от скорости API
async function loadData() {
    const startTime = Date.now();
    
    try {
        const data = await api.getData();
        processData(data);
    } catch (err) {
        handleError(err);
    }
    
    // Гарантируем минимум 1000ms
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, 1000 - elapsed);
    
    setTimeout(() => {
        loading = false;
    }, remainingTime);
}
```

## 🔄 Data Flow Patterns

### Свелте 5 Reactive State
```typescript
// ПРАВИЛЬНО: Используйте $state для реактивности
let friends = $state<FriendEntityFull[]>([]);
let loading = $state(true);

// ВАЖНО: $effect для инициализации
$effect(() => {
    loadFriends();
    setupBroadcastChannel();
    
    // Cleanup функция обязательна!
    return () => {
        if (broadcastChannel) {
            broadcastChannel.close();
        }
    };
});
```

### IndexedDB Error Handling
```typescript
// ВСЕГДА возвращайте fallback данные
export async function getFriends(): Promise<FriendEntityFull[]> {
    try {
        const result = await indexdbWrapper.getAll(FRIENDS_STORE_NAME);
        return result || [];
    } catch (error) {
        console.error('Ошибка получения друзей:', error);
        return []; // Не возвращайте undefined!
    }
}
```

## 🚨 Типичные Проблемы и Решения

### 1. Бесконечные циклы в broadcast
**Проблема**: Broadcast событие вызывает API, который создает новое broadcast событие.

**Решение**: Разделите логику первичной загрузки и обновления:
```typescript
// Первичная загрузка - через API
async function loadFriends() { ... }

// Обновление - напрямую из broadcast
function handleBroadcastMessage(event) {
    friends = event.data.list;
}
```

### 2. Мерцание loading и контента
**Проблема**: Loading и контент показываются поочередно.

**Решение**: Overlay подход с position: absolute и z-index.

### 3. TypeScript несовместимость типов
**Проблема**: FriendDto vs FriendEntityFull типы.

**Решение**: Явное приведение типов `as FriendEntityFull[]` в безопасных местах.

## 📋 Чеклист для похожих компонентов

### При создании списка с загрузкой:
- [ ] Service возвращает данные (не void)
- [ ] Middleware правильно типизирован
- [ ] Loading как overlay, не блокирующий контент
- [ ] Гарантированное время загрузки (1000ms)
- [ ] Broadcast для обновлений без API вызовов
- [ ] $effect с cleanup функцией
- [ ] Fallback значения при ошибках
- [ ] Fade transition для плавности

### CSS требования:
- [ ] position: relative на контейнере
- [ ] position: absolute на overlay
- [ ] pointer-events: none на overlay
- [ ] backdrop-filter для blur эффекта
- [ ] CSS анимации (spin, glow, pulse)
- [ ] Responsive design

## 🎯 Performance Оптимизации

### Broadcast Channel Management
```typescript
// Создавайте канал только один раз
let broadcastChannel: BroadcastChannel | null = null;

// Всегда закрывайте в cleanup
return () => {
    if (broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
    }
};
```

### Memory Leaks Prevention
```typescript
// Избегайте создания новых функций в каждом рендере
const handleBroadcastMessage = (event) => { ... }; // Хорошо

// Вместо:
broadcastChannel.addEventListener('message', (event) => { ... }); // Плохо
```

## 🔧 Debugging Tips

### Console Logging Strategy
```typescript
// Структурированные логи для debugging
console.log('🔄 FriendsPage: Начинаем загрузку друзей...');
console.log('📞 FriendsPage: Вызываем api.friends.getList()...');
console.log('✅ FriendsPage: Получен список друзей:', friendsList);
console.log('📊 FriendsPage: Количество друзей:', friends.length);
```

### Broadcast Event Monitoring
```typescript
// Всегда логируйте broadcast события
console.log('📢 FriendsPage: Получено broadcast сообщение:', action, data);
console.log('➕ FriendsPage: Обновляем список друзей через broadcast');
```

## 🎨 Theme Integration

### CSS Custom Properties Pattern
```css
/* Используйте CSS переменные для тем */
.theme-cyberpunk {
    --accent-color: #ffff00;
    --error-color: #ff0040;
}

/* Анимации с темными переменными */
@keyframes text-glow {
    to {
        text-shadow: 0 0 15px var(--accent-color);
    }
}
```

## 📚 Свелте 5 Специфика

### Новый синтаксис
```svelte
<!-- Используйте {#snippet} вместо slots -->
{#snippet children()}
    <div>Контент</div>
{/snippet}

<!-- $state вместо reactive statements -->
let data = $state([]);

<!-- $effect вместо onMount -->
$effect(() => {
    loadData();
});
```

## 🚀 Production Ready Checklist

- [ ] Error boundaries implemented
- [ ] Loading states with proper UX
- [ ] Memory leak prevention
- [ ] TypeScript strict mode compliance
- [ ] Performance optimized broadcasts
- [ ] Responsive design
- [ ] Accessibility considerations
- [ ] Cross-browser compatibility

---

**Создано**: 7 января 2025  
**Версия**: 1.0  
**Проект**: secure-message/front  
**Компонент**: FriendsPage система

Этот документ должен обновляться при обнаружении новых паттернов и решений.
