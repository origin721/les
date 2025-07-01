# Руководство по шаблонам страниц

Этот документ описывает, как использовать переиспользуемые компоненты для создания новых страниц в проекте Secure Message.

## Обзор компонентов

### 1. BasePage
Основной компонент страницы, который включает:
- Систему тем (cyberpunk, watchdogs, pixel)
- Анимированный заголовок с glitch эффектами
- Matrix rain анимацию
- Ссылку "Назад"
- Переключатель тем
- Footer с версией и статусом

### 2. ContentSection
Секция контента с заголовком и описанием в стилизованной карточке.

### 3. SecurityBadges
Анимированные бейджи безопасности/статуса.

## Быстрый старт

### Импорт компонентов
```typescript
import { BasePage, ContentSection, SecurityBadges } from "../../../components/page_templates";
```

### Базовый пример страницы
```svelte
<script lang="ts">
  import { BasePage, ContentSection, SecurityBadges } from "../../../components/page_templates";

  const badges = [
    { icon: "🔒", text: "SECURE" },
    { icon: "⚡", text: "FAST" },
    { icon: "🛡️", text: "PROTECTED" }
  ];
</script>

<BasePage 
  title="MY_PAGE"
  subtitle="ОПИСАНИЕ_СТРАНИЦЫ"
  pageName="MyPage"
  footerVersion="// MY_PAGE_v1.0.0 //"
  footerStatus="STATUS: ACTIVE"
>
  {#snippet children()}
    <ContentSection 
      title="// ЗАГОЛОВОК СЕКЦИИ //"
      description="Описание функциональности"
    >
      {#snippet children()}
        <p>Ваш контент здесь...</p>
        <SecurityBadges badges={badges} />
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>
```

## Параметры компонентов

### BasePage Props
```typescript
interface Props {
  title: string;                    // Заголовок (поддерживает подчеркивания для разделения слов)
  subtitle?: string;                // Подзаголовок с анимацией печати
  showBackLink?: boolean;           // Показать ссылку "Назад" (по умолчанию true)
  backLinkHref?: string;           // URL для ссылки "Назад" (по умолчанию ROUTES.HOME)
  backLinkText?: string;           // Текст ссылки "Назад" (по умолчанию "ГЛАВНАЯ")
  showThemeSwitcher?: boolean;     // Показать переключатель тем (по умолчанию true)
  footerVersion?: string;          // Версия в footer (по умолчанию "// SECURE_MESSAGE_v0.1.0 //")
  footerStatus?: string;           // Статус в footer (по умолчанию "STATUS: OPERATIONAL")
  pageName?: string;               // Имя для data-widget-name (по умолчанию "BasePage")
  children: any;                   // Snippet с контентом
}
```

### ContentSection Props
```typescript
interface Props {
  title: string;                   // Заголовок секции
  description?: string;            // Описание секции
  children: any;                   // Snippet с контентом
}
```

### SecurityBadges Props
```typescript
interface Badge {
  icon: string;                    // Эмодзи или символ
  text: string;                    // Текст бейджа
}

interface Props {
  badges: Badge[];                 // Массив бейджей
}
```

## Примеры использования

### 1. Простая страница "В разработке"
```svelte
<BasePage 
  title="NEW_FEATURE"
  subtitle="НОВАЯ_ФУНКЦИОНАЛЬНОСТЬ"
>
  {#snippet children()}
    <ContentSection 
      title="// МОДУЛЬ В РАЗРАБОТКЕ //"
      description="Функциональность будет добавлена скоро"
    >
      {#snippet children()}
        <div style="text-align: center;">
          <div style="font-size: 4rem;">🚧</div>
          <h3>В разработке</h3>
          <p>Эта функция находится в активной разработке.</p>
        </div>
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>
```

### 2. Страница с формой
```svelte
<script lang="ts">
  import { BasePage, ContentSection, SecurityBadges } from "../../../components/page_templates";

  const securityBadges = [
    { icon: "🔐", text: "ENCRYPTED" },
    { icon: "🛡️", text: "SECURE" }
  ];

  let formData = { name: "", email: "" };
</script>

<BasePage 
  title="USER_SETTINGS"
  subtitle="НАСТРОЙКИ_ПОЛЬЗОВАТЕЛЯ"
  footerStatus="DATA: PROTECTED"
>
  {#snippet children()}
    <ContentSection 
      title="// ЛИЧНЫЕ ДАННЫЕ //"
      description="Управление настройками аккаунта"
    >
      {#snippet children()}
        <form>
          <label>
            Имя:
            <input bind:value={formData.name} type="text" />
          </label>
          <label>
            Email:
            <input bind:value={formData.email} type="email" />
          </label>
          <button type="submit">Сохранить</button>
        </form>
        
        <SecurityBadges badges={securityBadges} />
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>
```

### 3. Страница с несколькими секциями
```svelte
<BasePage title="DASHBOARD" subtitle="ПАНЕЛЬ_УПРАВЛЕНИЯ">
  {#snippet children()}
    <ContentSection title="// СТАТИСТИКА //">
      {#snippet children()}
        <div class="stats-grid">
          <div class="stat-card">Пользователи: 1,234</div>
          <div class="stat-card">Сообщения: 5,678</div>
        </div>
      {/snippet}
    </ContentSection>

    <ContentSection title="// АКТИВНОСТЬ //">
      {#snippet children()}
        <div class="activity-feed">
          <p>Последние действия...</p>
        </div>
      {/snippet}
    </ContentSection>
  {/snippet}
</BasePage>
```

## Стилизация

Все компоненты используют CSS переменные для тем:
- `--background-color`
- `--text-color`
- `--primary-color`
- `--secondary-color`
- `--border-color`
- `--card-background`
- `--nav-active`
- `--accent-color`

Вы можете добавлять собственные стили внутри компонентов, используя эти переменные для консистентности с темами.

## Анимации

Базовые анимации включены автоматически:
- Glitch эффект на заголовках
- Matrix rain фон
- Анимация печати для подзаголовков
- Пульсация бейджей
- Hover эффекты

## Адаптивность

Все компоненты адаптивны и корректно работают на мобильных устройствах.

## Рекомендации

1. **Названия страниц**: Используйте ЗАГЛАВНЫЕ_БУКВЫ_С_ПОДЧЕРКИВАНИЯМИ для заголовков
2. **Подзаголовки**: Описывайте функциональность страницы
3. **Бейджи**: Используйте для отображения статуса безопасности или технических характеристик
4. **Секции**: Разбивайте сложный контент на логические секции
5. **Консистентность**: Используйте общие паттерны для схожей функциональности

## Создание новой страницы - чек-лист

1. ✅ Создать файл `src/pages/my_page/ui/MyPage.svelte`
2. ✅ Импортировать нужные компоненты из `../../../components/page_templates`
3. ✅ Использовать BasePage как корневой компонент
4. ✅ Добавить ContentSection для основного контента
5. ✅ При необходимости добавить SecurityBadges
6. ✅ Настроить заголовок, подзаголовок и footer
7. ✅ Добавить маршрут в routing/constants.ts
8. ✅ Добавить импорт в routing/ui/RoutesView.svelte
9. ✅ Протестировать на всех темах
10. ✅ Проверить адаптивность

Этот подход значительно упрощает создание новых страниц и обеспечивает консистентность дизайна по всему приложению.
