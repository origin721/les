// Common CSS classes that are reused across components
export const COMMON_STYLES = {
  // Form styles
  FORM_LABEL: "mt-3 mb-3",
  FORM_INPUT: "px-3 py-2 border rounded-md transition-colors duration-200",
  
  // Button styles
  BUTTON_PRIMARY: "border-2 border-solid p-2 min-w-[6rem] m-7 rounded-md transition-colors duration-200",
  BUTTON_SECONDARY: "border border-solid px-3 py-2 rounded-md transition-colors duration-200",
  
  // Layout styles
  CONTAINER_FULL: "w-full h-full",
  CONTAINER_CENTERED: "flex flex-col items-center justify-center",
  
  // Text styles
  TEXT_TERMINAL: "font-mono text-sm",
  TEXT_ACCENT: "text-accent-primary",
  TEXT_SECONDARY: "text-text-secondary",
  
  // Spacing
  SPACING_SM: "p-2",
  SPACING_MD: "p-4",
  SPACING_LG: "p-6",
  
  // Borders
  BORDER_PRIMARY: "border border-border-primary",
  BORDER_ACCENT: "border border-accent-primary",
} as const;

// CSS Variables for consistent theming
export const CSS_VARIABLES = {
  BG_PRIMARY: "var(--les-bg-primary)",
  BG_SECONDARY: "var(--les-bg-secondary)",
  TEXT_PRIMARY: "var(--les-text-primary)",
  TEXT_SECONDARY: "var(--les-text-secondary)",
  ACCENT_PRIMARY: "var(--les-accent-primary)",
  ACCENT_SECONDARY: "var(--les-accent-secondary)",
  BORDER_PRIMARY: "var(--les-border-primary)",
} as const;
