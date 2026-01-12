# Research: Dark Mode Toggle

**Feature Branch**: `014-dark-mode`
**Date**: 2026-01-12

## Research Topics

### 1. Tailwind CSS Dark Mode Strategy

**Decision**: Use `class` strategy with `darkMode: 'class'` in Tailwind config

**Rationale**:
- Allows manual toggle control (not just system preference)
- Works with localStorage persistence
- Enables instant theme switching without page reload
- Standard approach for Next.js applications

**Alternatives Considered**:
- `darkMode: 'media'` - Only respects system preference, no manual toggle possible
- CSS-in-JS theming - Adds unnecessary complexity, Tailwind already handles this

### 2. Preventing Flash of Unstyled Content (FOUC)

**Decision**: Use inline script in `<head>` to apply theme class before React hydration

**Rationale**:
- Script executes synchronously before body renders
- Reads localStorage immediately and applies `dark` class to `<html>`
- Zero flash because correct theme is set before any content renders
- Standard pattern used by next-themes and other theme libraries

**Implementation Pattern**:
```javascript
// Inline script in layout.tsx <head>
(function() {
  const theme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (theme === 'dark' || (!theme && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();
```

**Alternatives Considered**:
- next-themes library - Adds external dependency for simple use case
- CSS-only with `prefers-color-scheme` - No manual toggle capability
- Server-side cookies - Adds complexity, not needed for client-side preference

### 3. Theme State Management

**Decision**: Use React Context with localStorage sync

**Rationale**:
- Context provides global access to theme state across all components
- useState for immediate UI updates
- useEffect for localStorage persistence
- No external state management library needed

**Implementation Pattern**:
```typescript
// ThemeProvider with context
const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

// Provider reads from localStorage on mount, syncs changes
```

**Alternatives Considered**:
- Redux/Zustand - Overkill for single boolean state
- CSS custom properties only - Doesn't integrate with React component logic
- URL-based theme - Poor UX, not persistent

### 4. Dark Mode Color Palette

**Decision**: Dark blue-gray palette complementing existing Pokemon theme

**Rationale**:
- Maintains brand consistency with existing blue theme
- Provides sufficient contrast for WCAG AA compliance
- Reduces eye strain in low-light conditions

**Color Mapping**:

| Light Theme | Dark Theme | Usage |
|-------------|------------|-------|
| `blue-50` (bg gradient start) | `gray-900` | Page background |
| `blue-100` (bg gradient end) | `gray-800` | Page background gradient |
| `white` | `gray-800` | Card backgrounds |
| `gray-800` (text) | `gray-100` | Primary text |
| `gray-600` (secondary text) | `gray-400` | Secondary text |
| `blue-600` (primary button) | `blue-500` | Primary button |
| `gray-200` (secondary button) | `gray-700` | Secondary button |

### 5. Pokemon Type Badge Colors in Dark Mode

**Decision**: Keep existing type colors with enhanced visibility adjustments

**Rationale**:
- Type colors are core to Pokemon visual identity
- Adding subtle shadows/borders improves visibility on dark backgrounds
- No wholesale color changes needed

**Implementation**:
- Add `dark:ring-1 dark:ring-white/20` to type badges for definition
- Increase font weight if needed for contrast
- Type colors already work well on dark backgrounds due to inherent saturation

### 6. Toggle Button Placement

**Decision**: Fixed position in top-right corner of viewport (sticky header)

**Rationale**:
- Visible on all pages without modifying each page layout
- Consistent position for user muscle memory
- Does not interfere with page content
- Common pattern for theme toggles

**Alternatives Considered**:
- Footer placement - Less discoverable
- Per-page header modification - Requires changes to many files
- Settings page only - Poor discoverability for first-time users

### 7. Accessibility Considerations

**Decision**: Implement with proper ARIA attributes and keyboard support

**Requirements**:
- `aria-label` on toggle button indicating current state
- Focus visible states maintained in both themes
- Reduced motion support for theme transitions
- Minimum 4.5:1 contrast ratio for all text

**Implementation**:
```typescript
<button
  aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
  onClick={toggleTheme}
>
  {/* Icon based on current theme */}
</button>
```

## Dependencies

No new npm packages required. Implementation uses:
- Tailwind CSS (existing) - dark mode class strategy
- React Context (built-in) - theme state management
- localStorage (browser API) - preference persistence
- matchMedia (browser API) - system preference detection

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| FOUC on slow connections | Low | Medium | Inline script in head executes before body |
| localStorage unavailable | Low | Low | Fallback to system preference then light default |
| Component styling missed | Medium | Low | Systematic review of all components during implementation |
| Contrast issues in dark mode | Medium | Medium | Verify WCAG AA compliance with contrast checker tools |

## Next Steps

1. Enable Tailwind dark mode class strategy
2. Create ThemeProvider context and ThemeToggle component
3. Add inline theme detection script to layout
4. Update global CSS with dark mode variables
5. Update components with `dark:` variant classes
6. Test across all pages and components
