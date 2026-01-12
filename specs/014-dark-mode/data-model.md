# Data Model: Dark Mode Toggle

**Feature Branch**: `014-dark-mode`
**Date**: 2026-01-12

## Overview

The dark mode feature is purely client-side and does not require database changes. All data is stored in the browser using the Web Storage API.

## Client-Side Data

### Theme Preference (localStorage)

**Storage Key**: `theme`

**Value Schema**:
```typescript
type ThemePreference = 'light' | 'dark';
```

**Behavior**:
- If key exists: Use stored value
- If key does not exist: Detect system preference via `prefers-color-scheme`
- If system preference unavailable: Default to `'light'`

**Example**:
```javascript
localStorage.getItem('theme')  // Returns: 'dark' | 'light' | null
localStorage.setItem('theme', 'dark')
```

### Theme State (React Context)

**Context Value**:
```typescript
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
}
```

**State Flow**:
```
Page Load
    │
    ▼
┌───────────────────────────────┐
│ Inline Script (before React)  │
│ - Read localStorage           │
│ - Check system preference     │
│ - Apply 'dark' class to <html>│
└───────────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│ ThemeProvider Mount           │
│ - Initialize state from DOM   │
│ - Set up system pref listener │
└───────────────────────────────┘
    │
    ▼
┌───────────────────────────────┐
│ User Clicks Toggle            │
│ - Update React state          │
│ - Update <html> class         │
│ - Persist to localStorage     │
└───────────────────────────────┘
```

## CSS Custom Properties

### Light Theme (default)

```css
:root {
  --bg-primary: theme('colors.blue.50');
  --bg-secondary: theme('colors.blue.100');
  --bg-card: theme('colors.white');
  --text-primary: theme('colors.gray.800');
  --text-secondary: theme('colors.gray.600');
  --border-color: theme('colors.gray.200');
}
```

### Dark Theme

```css
:root.dark {
  --bg-primary: theme('colors.gray.900');
  --bg-secondary: theme('colors.gray.800');
  --bg-card: theme('colors.gray.800');
  --text-primary: theme('colors.gray.100');
  --text-secondary: theme('colors.gray.400');
  --border-color: theme('colors.gray.700');
}
```

## Entity Relationships

```
┌─────────────────┐
│   Browser       │
│   localStorage  │
│   ───────────── │
│   theme: string │
└────────┬────────┘
         │ reads/writes
         ▼
┌─────────────────┐
│ ThemeProvider   │
│ (React Context) │
│ ─────────────── │
│ theme: state    │
│ toggleTheme: fn │
└────────┬────────┘
         │ provides
         ▼
┌─────────────────┐
│ ThemeToggle     │
│ (Component)     │
│ ─────────────── │
│ Consumes context│
│ Renders toggle  │
└─────────────────┘
```

## Validation Rules

1. **Theme Value**: Must be exactly `'light'` or `'dark'`
2. **localStorage Fallback**: If invalid value stored, treat as null (use system/default)
3. **System Preference**: Only checked when no localStorage value exists
4. **Manual Override**: Once user clicks toggle, their choice overrides system preference

## No Database Changes Required

This feature does not modify any Supabase tables or database schema. All data remains client-side in the browser's localStorage.
