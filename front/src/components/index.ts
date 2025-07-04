// UI Components
export { Button, Card, Input, PageTitle, PageContainer, StatusIndicator } from './ui';

// Layout Components
export { PageLayout, PageHeader, PageFooter } from './layout';

// Form Components
export { FormContainer, FormField } from './forms';

// Navigation Components
export { BackLink } from './navigation';

// Chat Components
export { ChatSidebar, ChatArea } from './chat';

// Widgets
export { ChatRoomsList, ChatArea as ChatAreaWidget } from './widgets';

// Page Templates (for backward compatibility)
export { default as PageHeaderTemplate } from './page_templates/PageHeader.svelte';
export { default as PageFooterTemplate } from './page_templates/PageFooter.svelte';

// Theme switcher
export { default as ThemeSwitcher } from './ThemeSwitcher.svelte';
