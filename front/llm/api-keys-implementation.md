# API Keys Implementation - Быстрый справочник

## Что создано
Страница управления криптографическими ключами Curve25519 с хранением в RAM

## Файлы (ключевые):
```
src/pages/api_keys_page/ui/ApiKeysPage.svelte - главная с табами
src/stores/api_keys_store.ts - централизованное хранилище 
src/routing/constants.ts - маршрут API_KEYS: '/api-keys'
src/routing/ui/RoutesView.svelte - роутинг (добавлен import)
src/pages/home/ui/HomeScreen.svelte - ссылка в меню
```

## Функциональность:
1. **Генерация ключей** - generate_keys_curve25519(), сохранение, копирование
2. **Просмотр ключей** - список своих ключей, показ/скрытие приватных
3. **Ключи собеседника** - добавление публичных ключей партнёров

## Store API:
```typescript
apiKeysStore.addMyKey(keyData) // добавить свой ключ
apiKeysStore.addPartnerKey(keyData) // добавить ключ партнёра  
apiKeysStore.removeMyKey(id) // удалить
$apiKeysStore // reactive state
```

## Безопасность:
- Только RAM хранение (без persistence)
- Приватные ключи скрыты по умолчанию
- Base64 валидация ключей

## Недоделано:
- Интеграция store с компонентами (старые компоненты используют локальные state)
- Тестирование функциональности

## Для завершения:
1. Обновить компоненты для использования apiKeysStore  
2. Протестировать работу
3. Исправить возможные ошибки импортов
