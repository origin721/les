# Руководство по добавлению новых тем

Это руководство описывает, как добавить новую тему в проект.

## Шаги для добавления новой темы

### 1. Добавить тему в store

Отредактируйте `src/stores/theme.ts`:

```typescript
export const themes = ["cyberpunk", "watchdogs", "pixel", "terminal", "your_new_theme"];
```

### 2. Создать CSS файл темы

Создайте файл `src/styles/your_new_theme.css`:

```css
/* Your New Theme */
.theme-your_new_theme {
    --background-color: #your_bg_color;
    --text-color: #your_text_color;
    --primary-color: #your_primary_color;
    --secondary-color: #your_secondary_color;
    --border-color: #your_border_color;
    --input-background: #your_input_bg;
    --input-text: #your_input_text;
    --button-background: #your_button_bg;
    --button-text: #your_button_text;
    --button-hover-background: #your_button_hover_bg;
    --button-hover-text: #your_button_hover_text;
    --link-color: #your_link_color;
    --link-hover-color: #your_link_hover_color;
}
```

### 3. Добавить в основную систему тем

Отредактируйте `src/styles/themes.css`:

```css
/* Your New Theme */
[data-theme="your_new_theme"] {
  --les-bg-primary: #your_bg_color;
  --les-bg-secondary: #your_secondary_bg;
  --les-text-primary: #your_text_color;
  --les-text-secondary: #your_secondary_text;
  --les-accent-primary: #your_accent_primary;
  --les-accent-secondary: #your_accent_secondary;
  --les-border-primary: #your_border_color;
  --les-success: #your_success_color;
  --les-warning: #your_warning_color;
  --les-error: #your_error_color;
  
  /* Legacy variables for loading components */
  --background-color: #your_bg_color;
  --text-color: #your_text_color;
  --primary-color: #your_primary_color;
  --secondary-color: #your_secondary_color;
  --border-color: #your_border_color;
}
```

### 4. Добавить импорт в компоненты

#### В AuthPage (`src/pages/auth/ui/AuthPage.svelte`):

```javascript
// Import theme styles
import "../../../styles/cyberpunk.css";
import "../../../styles/watchdogs.css";
import "../../../styles/pixel.css";
import "../../../styles/terminal.css";
import "../../../styles/your_new_theme.css"; // Добавить эту строку
```

#### В BasePage (`src/components/page_templates/BasePage.svelte`):

```javascript
// Import theme styles
import "../../styles/cyberpunk.css";
import "../../styles/watchdogs.css";
import "../../styles/pixel.css";
import "../../styles/terminal.css";
import "../../styles/your_new_theme.css"; // Добавить эту строку
```

### 5. Добавить CSS переменные в BasePage

В стилях BasePage добавить:

```css
.theme-your_new_theme {
  --background-color: #your_bg_color;
  --text-color: #your_text_color;
  --primary-color: #your_primary_color;
  --secondary-color: #your_secondary_color;
  --border-color: #your_border_color;
  --card-background: #your_card_bg;
  --nav-active: #your_nav_active;
  --accent-color: #your_accent_color;
}
```

## Цветовые схемы существующих тем

### Terminal Theme (Vim DarkBlue)
- Фон: `#001040` (глубокий синий)
- Текст: `#FFFFFF` (белый)
- Акцент: `#FFFF60` (ярко-желтый)
- Границы: `#4080FF` (синий)

### Cyberpunk Theme
- Фон: `#0a0a0a` (черный)
- Текст: `#00ff00` (зеленый)
- Акцент: `#ff00ff` (пурпурный)
- Границы: `#00ff00` (зеленый)

### Watch Dogs Theme
- Фон: `#1a1a1a` (темно-серый)
- Текст: `#cccccc` (светло-серый)
- Акцент: `#ffc400` (оранжевый)
- Границы: `#444444` (серый)

### Pixel Theme
- Фон: `#000000` (черный)
- Текст: `#00ff00` (зеленый)
- Акцент: `#00ff00` (зеленый)
- Границы: `#00ff00` (зеленый)

## Файлы, которые нужно изменить для каждой новой темы

1. `src/stores/theme.ts` - добавить имя темы в массив
2. `src/styles/your_new_theme.css` - создать новый файл
3. `src/styles/themes.css` - добавить CSS переменные
4. `src/pages/auth/ui/AuthPage.svelte` - добавить импорт
5. `src/components/page_templates/BasePage.svelte` - добавить импорт и CSS переменные

## Пример: добавление Matrix темы

```typescript
// 1. src/stores/theme.ts
export const themes = ["cyberpunk", "watchdogs", "pixel", "terminal", "matrix"];
```

```css
/* 2. src/styles/matrix.css */
.theme-matrix {
    --background-color: #000000;
    --text-color: #00FF41;
    --primary-color: #00FF00;
    --secondary-color: #00AA00;
    /* ... остальные переменные */
}
```

```css
/* 3. src/styles/themes.css */
[data-theme="matrix"] {
  --les-bg-primary: #000000;
  --les-text-primary: #00FF41;
  /* ... остальные переменные */
}
```

После выполнения всех шагов новая тема будет доступна через переключатель тем.
