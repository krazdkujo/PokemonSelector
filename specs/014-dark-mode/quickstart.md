# Quickstart: Dark Mode Toggle

**Feature Branch**: `014-dark-mode`
**Date**: 2026-01-12

## Prerequisites

- Node.js 18+ installed
- Project cloned and dependencies installed (`npm install`)
- Development server can be started (`npm run dev`)

## Implementation Steps

### Step 1: Enable Tailwind Dark Mode

Update `tailwind.config.ts`:
```typescript
const config: Config = {
  darkMode: 'class',  // Add this line
  content: [...],
  // ...rest of config
};
```

### Step 2: Create Theme Utilities

Create `src/lib/theme.ts`:
```typescript
export type Theme = 'light' | 'dark';

export function getStoredTheme(): Theme | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('theme') as Theme | null;
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem('theme', theme);
}

export function getSystemTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function applyTheme(theme: Theme): void {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
```

### Step 3: Create ThemeProvider

Create `src/components/ThemeProvider.tsx`:
```typescript
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, getStoredTheme, setStoredTheme, getSystemTheme, applyTheme } from '@/lib/theme';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = getStoredTheme();
    const initial = stored ?? getSystemTheme();
    setTheme(initial);
    applyTheme(initial);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    setStoredTheme(newTheme);
    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

### Step 4: Create ThemeToggle Component

Create `src/components/ThemeToggle.tsx`:
```typescript
'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800
                 shadow-md hover:shadow-lg transition-shadow z-50
                 text-gray-800 dark:text-gray-200"
    >
      {theme === 'dark' ? 'Light' : 'Dark'}
    </button>
  );
}
```

### Step 5: Add FOUC Prevention Script

Update `src/app/layout.tsx`:
```typescript
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased min-h-screen bg-gradient-to-b from-blue-50 to-blue-100
                       dark:from-gray-900 dark:to-gray-800">
        <ThemeProvider>
          <ThemeToggle />
          <main className="container mx-auto px-4 py-8">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 6: Update Global CSS

Add dark mode variables to `src/app/globals.css`:
```css
/* Add after existing :root block */
.dark {
  --pokemon-red: #ff4444;
  --pokemon-blue: #5b6cda;
  --pokemon-yellow: #ffee44;
}

/* Update button styles */
.btn-primary {
  @apply bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600
         text-white font-bold py-2 px-4 rounded-lg transition-colors;
}

.btn-secondary {
  @apply bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600
         text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded-lg transition-colors;
}
```

### Step 7: Update Components

Add `dark:` variants to component classes. Example for cards:
```typescript
// Before
className="bg-white rounded-lg shadow-md"

// After
className="bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-gray-900/50"
```

## Testing Checklist

1. [ ] Toggle switches theme immediately
2. [ ] Theme persists after page refresh
3. [ ] Theme persists after browser restart
4. [ ] OS dark mode preference respected for new visitors
5. [ ] No flash of incorrect theme on page load
6. [ ] All pages display correctly in both themes
7. [ ] Pokemon type badges readable in dark mode
8. [ ] Text contrast meets WCAG AA (4.5:1)
9. [ ] Toggle button accessible via keyboard

## Running the Development Server

```bash
npm run dev
```

Visit http://localhost:3000 and click the theme toggle in the top-right corner.
