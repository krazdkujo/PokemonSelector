# Quickstart: Vercel-Inspired UI Redesign

**Feature**: 015-vercel-ui-redesign
**Date**: 2026-01-12

## Prerequisites

- Node.js 18+ installed
- Access to the PokemonSelector repository
- Familiarity with Tailwind CSS

## Getting Started

### 1. Switch to Feature Branch

```bash
git checkout 015-vercel-ui-redesign
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to see changes in real-time.

---

## Implementation Order

### Phase 1: Foundation (Do First)

#### 1.1 Install Geist Fonts

```bash
# Fonts are loaded via next/font - no npm install needed
# Just add the font configuration to layout.tsx
```

#### 1.2 Update Tailwind Configuration

Extend `tailwind.config.ts` with design tokens:

```typescript
// Key additions to theme.extend:
colors: {
  bg: { 0: 'var(--bg-0)', 100: 'var(--bg-100)', ... },
  fg: { 0: 'var(--fg-0)', 100: 'var(--fg-100)', ... },
  border: 'var(--border)',
  accent: { primary: 'var(--accent-primary)', ... }
},
fontFamily: {
  sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
  mono: ['var(--font-mono)', 'monospace']
}
```

#### 1.3 Add CSS Variables to globals.css

```css
:root {
  /* Dark theme (default) */
  --bg-0: #000000;
  --bg-100: #0a0a0a;
  /* ... see data-model.md for full list */
}

.light {
  --bg-0: #ffffff;
  --bg-100: #fafafa;
  /* ... light overrides */
}
```

#### 1.4 Update Root Layout

- Import and configure Geist fonts
- Update body classes to use new design tokens
- Ensure theme toggle uses new class names

---

### Phase 2: Component Classes

#### 2.1 Define Base Components in globals.css

```css
/* Buttons */
.btn {
  @apply inline-flex items-center justify-center rounded-md
         font-medium transition-colors duration-150
         focus-visible:outline-none focus-visible:ring-2;
}

.btn-primary {
  @apply btn bg-accent-primary text-white
         hover:bg-blue-600 focus-visible:ring-blue-500;
}

.btn-secondary {
  @apply btn bg-bg-200 text-fg-0 border border-border
         hover:bg-bg-300 hover:border-border-hover;
}

.btn-ghost {
  @apply btn bg-transparent text-fg-100
         hover:bg-bg-200 hover:text-fg-0;
}

/* Cards */
.card {
  @apply bg-bg-100 border border-border rounded-lg;
}

.card-interactive {
  @apply card transition-all duration-150
         hover:border-border-hover hover:scale-[1.02];
}

/* Inputs */
.input {
  @apply w-full bg-bg-0 border border-border rounded-md
         px-3 py-2 text-fg-0 placeholder:text-fg-200
         focus:outline-none focus:ring-2 focus:ring-accent-primary/50
         focus:border-accent-primary;
}
```

---

### Phase 3: Page Updates

#### Update Order (Recommended)

1. `layout.tsx` - Global wrapper, fonts, body styles
2. `page.tsx` (home) - Login/entry point
3. `dashboard/page.tsx` - Main user interface
4. `select/page.tsx` - Starter selection
5. `battle/page.tsx` - Battle interface
6. `pokecenter/page.tsx` - Pokemon management
7. `pokedex/page.tsx` - Pokemon browser
8. `admin/page.tsx` - Admin panel
9. `pin/` pages - PIN authentication

#### For Each Page

1. Replace hardcoded colors with token classes
2. Update card styles to use `.card` class
3. Update buttons to use `.btn-*` classes
4. Ensure proper dark/light theme support
5. Test mobile responsiveness

---

### Phase 4: Component Updates

#### Components to Update

| Component | Priority | Key Changes |
|-----------|----------|-------------|
| `PokemonCard.tsx` | High | Card styling, type badges |
| `BattleArena.tsx` | High | Battle UI, health bars, animations |
| `NameEntryForm.tsx` | High | Input styling |
| `TrainerList.tsx` | Medium | List styling |
| `MoveSelector.tsx` | Medium | Button variants |
| `PostBattleScreen.tsx` | Medium | Result presentation |
| `ThemeToggle.tsx` | Medium | Update toggle styling |
| `TypeFilter.tsx` | Low | Badge styling |
| All modals | Low | Modal container styling |

---

## Testing Checklist

### Visual Testing

- [ ] Dark theme looks correct on all pages
- [ ] Light theme looks correct on all pages
- [ ] Theme toggle works without flash
- [ ] Typography is consistent (Geist fonts loading)
- [ ] Spacing follows the design scale
- [ ] Interactive elements have proper hover/focus states

### Accessibility Testing

- [ ] Color contrast passes WCAG AA (use browser devtools)
- [ ] Focus states are visible on all interactive elements
- [ ] Reduced motion preference is respected
- [ ] Text is readable at 200% zoom

### Responsive Testing

- [ ] Mobile (375px) - Single column, touch-friendly
- [ ] Tablet (768px) - Adjusted layouts
- [ ] Desktop (1024px+) - Full layout

### Functional Testing

- [ ] Login flow works
- [ ] Starter selection works
- [ ] Battle system works
- [ ] All existing features unchanged

---

## Common Patterns

### Replacing Old Classes

| Old Pattern | New Pattern |
|-------------|-------------|
| `bg-white dark:bg-gray-800` | `bg-bg-100` |
| `text-gray-900 dark:text-gray-100` | `text-fg-0` |
| `text-gray-500 dark:text-gray-400` | `text-fg-100` |
| `border-gray-200 dark:border-gray-700` | `border-border` |
| `bg-blue-600 hover:bg-blue-700` | `bg-accent-primary hover:bg-blue-600` |

### Adding Monospace for Stats

```jsx
// Before
<span className="text-sm">{pokemon.hp}</span>

// After
<span className="font-mono text-sm text-fg-100">{pokemon.hp}</span>
```

### Adding Card Interactivity

```jsx
// Before
<div className="bg-white rounded-lg shadow p-4">

// After
<div className="card-interactive p-4">
```

---

## Troubleshooting

### Fonts Not Loading

- Check that Geist fonts are properly imported in `layout.tsx`
- Verify font variable names match Tailwind config

### Theme Flash on Load

- Ensure the inline script in `<head>` runs before body renders
- Check that `suppressHydrationWarning` is on `<html>`

### Colors Look Wrong

- Verify CSS variables are defined in `:root` and `.light`
- Check that Tailwind config references `var(--token-name)` correctly

### Animations Stuttering

- Use `transform` and `opacity` only for animations
- Avoid animating `width`, `height`, or `top/left`
