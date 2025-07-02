# CSS Modules Guide - Руководство по CSS модулям

## Обзор

Проект теперь использует CSS модули для организации переиспользуемых стилей. Все стили базируются на rem единицах для лучшей адаптивности.

## Структура

```
src/styles/modules/
├── buttons.module.css    # Стили для кнопок
├── cards.module.css      # Стили для карточек  
├── forms.module.css      # Стили для форм
└── layout.module.css     # Стили для макетов
```

## Компоненты UI

```
src/components/ui/
├── Button.svelte    # Компонент кнопки
├── Card.svelte      # Компонент карточки
├── Input.svelte     # Компонент поля ввода
└── index.ts         # Экспорт всех компонентов
```

## Использование

### Импорт компонентов

```svelte
<script lang="ts">
  import { Button, Card, Input } from "../../components/ui";
  import layoutStyles from "../../styles/modules/layout.module.css";
</script>
```

### Использование Button

```svelte
<Button 
  variant="primary"      // primary, secondary, outline, ghost, danger, success
  size="md"             // xs, sm, md, lg, xl
  loading={false}
  disabled={false}
  onclick={() => console.log('Clicked')}
>
  Нажми меня
</Button>
```

### Использование Card

```svelte
<Card 
  variant="interactive"  // default, elevated, interactive, glowing, flat
  size="md"             // sm, md, lg, xl
  effect="shimmer"      // shimmer, pulse, float
  onclick={() => navigate('/somewhere')}
>
  <h3>Заголовок карточки</h3>
  <p>Содержимое карточки</p>
</Card>
```

### Использование Input

```svelte
<Input 
  type="text"           // text, email, password, number, tel, url
  size="md"             // xs, sm, md, lg, xl
  state="default"       // default, error, success
  placeholder="Введите текст"
  bind:value={inputValue}
/>
```

### Использование Layout стилей

```svelte
<div class={`${layoutStyles.container} ${layoutStyles.grid} ${layoutStyles.gridAutoFit} ${layoutStyles.gap4}`}>
  <!-- содержимое -->
</div>
```

## Доступные классы Layout

### Контейнеры
- `container` - основной контейнер (max-width: 1200px)
- `container-sm` - маленький контейнер (max-width: 640px)
- `container-md` - средний контейнер (max-width: 768px)
- `container-lg` - большой контейнер (max-width: 1024px)
- `container-xl` - очень большой контейнер (max-width: 1280px)
- `container-fluid` - полноширинный контейнер

### Flex
- `flex`, `flexCol`, `flexRow`, `flexWrap`
- `flexCenter`, `flexBetween`, `flexAround`, `flexStart`, `flexEnd`
- `itemsStart`, `itemsCenter`, `itemsEnd`, `itemsStretch`
- `justifyStart`, `justifyCenter`, `justifyEnd`, `justifyBetween`, `justifyAround`

### Grid
- `grid` - базовый grid
- `grid1` до `grid6` - количество колонок
- `gridAuto`, `gridAutoFit`, `gridAutoFill` - автоматические сетки
- `gap0` до `gap10` - отступы между элементами

### Размеры
- `w25`, `w50`, `w75`, `wFull`, `wScreen`, `wAuto`
- `h25`, `h50`, `h75`, `hFull`, `hScreen`, `hAuto`
- `minH0`, `minHFull`, `minHScreen`
- `maxWFull`, `maxWScreen`, `maxHFull`, `maxHScreen`

### Позиционирование
- `relative`, `absolute`, `fixed`, `sticky`
- `topFull`, `bottomFull`, `leftFull`, `rightFull`

### Overflow и Visibility
- `overflowHidden`, `overflowAuto`, `overflowScroll`
- `overflowXHidden`, `overflowYHidden`, `overflowXAuto`, `overflowYAuto`
- `hidden`, `visible`, `invisible`, `block`, `inlineBlock`, `inline`

### Z-index
- `z0`, `z10`, `z20`, `z30`, `z40`, `z50`, `zAuto`

## Принципы дизайна

### 1. Rem единицы
Все размеры используют rem для лучшей адаптивности:
```css
/* Хорошо */
padding: 1rem;
font-size: 1.125rem;
margin: 0.5rem;

/* Плохо */
padding: 16px;
font-size: 18px;
margin: 8px;
```

### 2. CSS переменные для тем
```css
color: var(--primary-color);
background: var(--card-background);
border-color: var(--border-color);
```

### 3. Компонентный подход
- Каждый компонент изолирован
- Переиспользуемые стили в модулях
- Консистентный API для props

### 4. Адаптивность
Все компоненты адаптивны из коробки благодаря rem единицам и медиа-запросам.

## Миграция существующих страниц

1. Замените inline стили на CSS модули
2. Используйте UI компоненты вместо нативных элементов
3. Замените px на rem
4. Используйте layout классы для структуры

### Пример миграции

```svelte
<!-- До -->
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 32px;">
  <div style="padding: 32px; border: 1px solid #ccc; border-radius: 8px;">
    <button style="background: #007bff; color: white; padding: 12px 24px;">
      Кнопка
    </button>
  </div>
</div>

<!-- После -->
<div class={`${layoutStyles.grid} ${layoutStyles.gridAutoFit} ${layoutStyles.gap8}`}>
  <Card variant="default" size="lg">
    <Button variant="primary" size="md">
      Кнопка
    </Button>
  </Card>
</div>
```

## Расширение системы

### Добавление новых CSS модулей

1. Создайте новый файл в `src/styles/modules/`
2. Добавьте импорт в `src/styles/app.css`
3. Документируйте новые классы

### Создание новых UI компонентов

1. Создайте компонент в `src/components/ui/`
2. Используйте существующие CSS модули
3. Добавьте экспорт в `src/components/ui/index.ts`
4. Документируйте API компонента

## Преимущества

- ✅ Переиспользуемость стилей
- ✅ Консистентность дизайна
- ✅ Адаптивность через rem
- ✅ Изоляция компонентов
- ✅ Простота поддержки
- ✅ TypeScript поддержка
- ✅ Темизация через CSS переменные
