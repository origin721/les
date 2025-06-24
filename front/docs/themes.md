# Theming System

This document outlines the theming system used in the project. Themes are defined using CSS custom properties (variables) and can be switched by changing the `data-theme` attribute on a root element (e.g., `<body>`).

## How to Use

To apply a theme, set the `data-theme` attribute on the `<body>` tag. For example:

```html
<body data-theme="light">
  <!-- App content -->
</body>
```

To switch to the dark theme:

```html
<body data-theme="dark">
  <!-- App content -->
</body>
```

## Color Variables

Each theme defines a set of common color variables. This ensures that components look consistent across different themes.

### Variable Naming Convention

All theme-related CSS variables use the `--les-` prefix.

-   `--les-bg-primary`: Primary background color.
-   `--les-bg-secondary`: Secondary background color, used for cards, modals, etc.
-   `--les-text-primary`: Primary text color.
-   `--les-text-secondary`: Secondary text color, for less important text.
-   `--les-accent-primary`: Primary accent color, used for buttons, links, and interactive elements.
-   `--les-accent-secondary`: A secondary accent color, often a darker or lighter shade of the primary accent.
-   `--les-border-primary`: Color for borders and dividers.
-   `--les-success`: Color for success messages and icons.
-   `--les-warning`: Color for warning messages and icons.
-   `--les-error`: Color for error messages and icons.

---

## Themes

### 1. Light Theme

**Attribute:** `data-theme="light"`

| Variable                | Color     | Hex       | Description                               |
| ----------------------- | --------- | --------- | ----------------------------------------- |
| `--les-bg-primary`      | White     | `#FFFFFF` | Main background color.                    |
| `--les-bg-secondary`    | Light-Gray| `#F0F0F0` | Background for containers.                |
| `--les-text-primary`    | Black     | `#111111` | Main text color.                          |
| `--les-text-secondary`  | Dark-Gray | `#555555` | Secondary text color.                     |
| `--les-accent-primary`  | Blue      | `#007BFF` | Primary interactive elements.             |
| `--les-accent-secondary`| Dark-Blue | `#0056b3` | Hover/active state for primary accent.    |
| `--les-border-primary`  | Gray      | `#DDDDDD` | Borders and separators.                   |
| `--les-success`         | Green     | `#28a745` | Success state color.                      |
| `--les-warning`         | Yellow    | `#ffc107` | Warning state color.                      |
| `--les-error`           | Red       | `#dc3545` | Error state color.                        |

### 2. Dark Theme

**Attribute:** `data-theme="dark"`

| Variable                | Color        | Hex       | Description                               |
| ----------------------- | ------------ | --------- | ----------------------------------------- |
| `--les-bg-primary`      | Almost-Black | `#121212` | Main background color.                    |
| `--les-bg-secondary`    | Dark-Gray    | `#1E1E1E` | Background for containers.                |
| `--les-text-primary`    | Light-Gray   | `#E0E0E0` | Main text color.                          |
| `--les-text-secondary`  | Gray         | `#A0A0A0` | Secondary text color.                     |
| `--les-accent-primary`  | Purple       | `#BB86FC` | Primary interactive elements.             |
| `--les-accent-secondary`| Dark-Purple  | `#3700B3` | Hover/active state for primary accent.    |
| `--les-border-primary`  | Dark-Gray    | `#272727` | Borders and separators.                   |
| `--les-success`         | Green        | `#4CAF50` | Success state color.                      |
| `--les-warning`         | Yellow       | `#FFEB3B` | Warning state color.                      |
| `--les-error`           | Red          | `#F44336` | Error state color.                        |

### 3. Cyberpunk Theme

**Attribute:** `data-theme="cyberpunk"`

Inspired by Watch Dogs and general cyberpunk aesthetics. Features high-contrast, neon-on-dark colors.

| Variable                | Color        | Hex       | Description                               |
| ----------------------- | ------------ | --------- | ----------------------------------------- |
| `--les-bg-primary`      | Dark-Blue    | `#0A0A1A` | Main background color.                    |
| `--les-bg-secondary`    | Darker-Blue  | `#14142E` | Background for containers.                |
| `--les-text-primary`    | Neon-Cyan    | `#00FFC6` | Main text color, high-contrast.           |
| `--les-text-secondary`  | Light-Cyan   | `#99FFDD` | Secondary text color.                     |
| `--les-accent-primary`  | Yellow       | `#F9E400` | Primary interactive elements.             |
| `--les-accent-secondary`| Dark-Yellow  | `#D7C300` | Hover/active state for primary accent.    |
| `--les-border-primary`  | Neon-Cyan    | `#00FFC6` | Borders and separators, often glowing.    |
| `--les-success`         | Bright-Green | `#00FF00` | Success state color.                      |
| `--les-warning`         | Orange       | `#FFA500` | Warning state color.                      |
| `--les-error`           | Neon-Red     | `#FF003C` | Error state color.                        |