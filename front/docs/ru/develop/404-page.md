# 404 Страница - Техническая Документация

## Обзор

404 страница - это стилизованная страница ошибки для приложения Secure Message System, которая отображается при попытке доступа к несуществующим страницам или при ошибках навигации.

## Архитектура

### Структура файлов
```
src/pages/404/
├── index.ts                 # Экспорт модуля
├── ui/
│   ├── index.ts            # Экспорт UI компонентов
│   ├── Page404.svelte      # Основной компонент страницы
│   └── Screen404.svelte    # Контентная часть страницы
```

### Компоненты

#### Page404.svelte
- **Назначение**: Главный компонент 404 страницы
- **Структура**: Включает AppHeader и Screen404
- **Заголовок**: "404 - ДОСТУП ЗАПРЕЩЕН"

#### Screen404.svelte
- **Назначение**: Основное содержимое 404 страницы
- **Функциональность**: 
  - Анимированный глитч-эффект для "404"
  - Интерактивные кнопки навигации
  - Техническая информация об ошибке
  - Декоративные элементы в стиле cyberpunk

## Дизайн и анимации

### Глитч-эффект
```javascript
// Периодическое искажение текста "404"
const glitchInterval = setInterval(() => {
  if (Math.random() < 0.1) {
    // Заменяем символы на случайные
    for (let i = 0; i < originalText.length; i++) {
      if (Math.random() < 0.3) {
        glitched += randomChars[Math.floor(Math.random() * randomChars.length)];
      }
    }
  }
}, 200);
```

### Анимированные элементы
- **Matrix Grid**: Движущаяся сетка в фоне
- **Floating Particles**: Плавающие точки с свечением
- **Corner Brackets**: Декоративные угловые скобки
- **Button Glow**: Эффект подсветки кнопок при hover

### Цветовая схема
```css
--primary-color: #00ffff;    /* Циан */
--secondary-color: #ff6b6b;  /* Красный */
--accent-color: #ffff00;     /* Желтый */
--background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
```

## Функциональность

### Навигация
```javascript
// Кнопка "ВЕРНУТЬСЯ ДОМОЙ"
<a href={ROUTES.HOME} class="btn-primary">
  ВЕРНУТЬСЯ ДОМОЙ
</a>

// Кнопка "НАЗАД"
<button class="btn-secondary" on:click={() => history.back()}>
  НАЗАД
</button>
```

### Техническая информация
- **ERROR_CODE**: PAGE_NOT_FOUND
- **TIMESTAMP**: Текущее время в ISO формате
- **Сообщение**: "Похоже, эта страница исчезла в цифровой пустоте..."

## Интеграция в роутинг

### Константы роутинга
```typescript
// src/routing/constants.ts
export const ROUTES = {
  // ... другие роуты
  NOT_FOUND: BASE_URL + '/404',
} as const;
```

### Обработка в RoutesView
```typescript
// src/routing/ui/RoutesView.svelte
} else if (p.rState.pathname === ROUTES.NOT_FOUND) {
  componentPromise = import(`../../pages/404/ui/Page404.svelte`);
} else {
  // Fallback для неизвестных роутов
  componentPromise = import(`../../pages/404/ui/Page404.svelte`);
}
```

### Добавление в главное меню
```typescript
// src/pages/home/ui/HomePage.svelte
const menuItems = [
  // ... другие пункты меню
  { 
    href: ROUTES.NOT_FOUND, 
    title: "404 СТРАНИЦА", 
    icon: "⚠️", 
    description: "Демо ошибки не найдено" 
  }
];
```

## Адаптивность

### Мобильные устройства
```css
@media (max-width: 768px) {
  .error-container {
    padding: 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary, .btn-secondary {
    width: 100%;
    max-width: 250px;
  }
}
```

### Очень маленькие экраны
```css
@media (max-width: 480px) {
  .glitch-text {
    font-size: clamp(4rem, 12vw, 8rem);
  }
  
  .corner-bracket {
    width: 20px;
    height: 20px;
  }
}
```

## Использование

### Прямой доступ
```
http://localhost:3000/les/404
```

### Автоматическое перенаправление
- При переходе на несуществующий роут
- При ошибках загрузки страниц
- При нарушении доступа к защищенным разделам

### Тестирование
1. Перейти на главную страницу `/les/home`
2. Нажать на пункт меню "404 СТРАНИЦА"
3. Проверить все анимации и интерактивные элементы
4. Протестировать кнопки навигации

## API и события

### Жизненный цикл компонента
```javascript
onMount(() => {
  mounted = true;  // Запуск анимации появления
  
  // Запуск глитч-эффекта
  const glitchInterval = setInterval(glitchEffect, 200);
  
  // Очистка при размонтировании
  return () => clearInterval(glitchInterval);
});
```

### Обработка событий
```javascript
// Навигация назад
on:click={() => history.back()}

// Переход на главную
href={ROUTES.HOME}
```

## Производительность

### Lazy Loading
- Компонент загружается динамически через `import()`
- Минимальное время загрузки благодаря простой структуре
- CSS анимации используют GPU acceleration

### Оптимизации
- Использование CSS transforms вместо изменения layout
- Дебаунсинг глитч-эффектов
- Минимальный объем JavaScript кода

## Стилизация

### CSS Custom Properties
```css
.error-page {
  --primary-glow: 0 0 20px var(--primary-color);
  --secondary-glow: 0 0 15px var(--secondary-color);
  --transition-smooth: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
}
```

### Анимации
```css
@keyframes glitch-1 {
  0% { transform: translate(0); }
  20% { transform: translate(-2px, 2px); }
  40% { transform: translate(-2px, -2px); }
  60% { transform: translate(2px, 2px); }
  80% { transform: translate(2px, -2px); }
  100% { transform: translate(0); }
}
```

## Безопасность

### Предотвращение XSS
- Все пользовательские данные экранируются
- Использование безопасных Svelte биндингов
- Валидация URL параметров

### Конфиденциальность
- Не отображаются системные пути
- Не раскрывается структура приложения
- Минимальная техническая информация

## Расширение функциональности

### Добавление новых анимаций
1. Создать новый CSS keyframe
2. Добавить в соответствующий класс
3. Настроить timing и easing

### Кастомизация сообщений
```javascript
const errorMessages = {
  'PAGE_NOT_FOUND': 'Страница не найдена',
  'ACCESS_DENIED': 'Доступ запрещен',
  'SERVER_ERROR': 'Ошибка сервера'
};
```

### Аналитика ошибок
```javascript
// Отправка данных об ошибке
onMount(() => {
  analytics.track('404_page_view', {
    path: window.location.pathname,
    referrer: document.referrer,
    timestamp: new Date().toISOString()
  });
});
```

## Заключение

404 страница является важной частью пользовательского опыта в Secure Message System. Она сочетает в себе информативность, эстетику и функциональность, соответствуя общему дизайну приложения в стиле cyberpunk.

Страница обеспечивает:
- Понятное объяснение ошибки
- Удобные способы навигации
- Привлекательный визуальный дизайн
- Соответствие архитектуре проекта
