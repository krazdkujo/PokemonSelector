# Data Model: Vercel-Inspired UI Redesign

**Feature**: 015-vercel-ui-redesign
**Date**: 2026-01-12

## Overview

This feature involves no database schema changes. The "data model" for a UI redesign consists of **Design Tokens** - the named values that define the visual system.

---

## Design Token Entities

### 1. Color Tokens

**Purpose**: Define the color palette for both dark and light themes

#### Background Scale (Dark Theme - Primary)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-0` | `#000000` | Page background, deepest layer |
| `--bg-100` | `#0a0a0a` | Card backgrounds, elevated surfaces |
| `--bg-200` | `#141414` | Hover states, secondary surfaces |
| `--bg-300` | `#1f1f1f` | Active states, tertiary surfaces |

#### Background Scale (Light Theme)
| Token | Value | Usage |
|-------|-------|-------|
| `--bg-0` | `#ffffff` | Page background |
| `--bg-100` | `#fafafa` | Card backgrounds |
| `--bg-200` | `#f4f4f5` | Hover states |
| `--bg-300` | `#e4e4e7` | Active states |

#### Foreground Scale (Dark Theme)
| Token | Value | Usage |
|-------|-------|-------|
| `--fg-0` | `#fafafa` | Primary text, headings |
| `--fg-100` | `#a1a1aa` | Secondary text, labels |
| `--fg-200` | `#71717a` | Muted text, placeholders |
| `--fg-300` | `#52525b` | Disabled text |

#### Foreground Scale (Light Theme)
| Token | Value | Usage |
|-------|-------|-------|
| `--fg-0` | `#09090b` | Primary text |
| `--fg-100` | `#3f3f46` | Secondary text |
| `--fg-200` | `#71717a` | Muted text |
| `--fg-300` | `#a1a1aa` | Disabled text |

#### Border Colors
| Token | Dark Value | Light Value | Usage |
|-------|------------|-------------|-------|
| `--border` | `#27272a` | `#e4e4e7` | Default borders |
| `--border-hover` | `#3f3f46` | `#d4d4d8` | Hover state borders |
| `--border-focus` | `#3b82f6` | `#3b82f6` | Focus ring color |

#### Accent Colors (Theme-Independent)
| Token | Value | Usage |
|-------|-------|-------|
| `--accent-primary` | `#3b82f6` | Primary actions, links |
| `--accent-success` | `#22c55e` | Success states, health |
| `--accent-warning` | `#f59e0b` | Warnings, caution |
| `--accent-error` | `#ef4444` | Errors, danger, damage |

---

### 2. Typography Tokens

**Purpose**: Define font families, sizes, and weights

#### Font Families
| Token | Value | Usage |
|-------|-------|-------|
| `--font-sans` | `Geist, system-ui, sans-serif` | Body text, UI elements |
| `--font-mono` | `Geist Mono, monospace` | Stats, numbers, code |

#### Font Sizes (rem-based for accessibility)
| Token | Value | Line Height | Usage |
|-------|-------|-------------|-------|
| `--text-xs` | `0.75rem` | 1rem | Badges, fine print |
| `--text-sm` | `0.875rem` | 1.25rem | Secondary text, labels |
| `--text-base` | `1rem` | 1.5rem | Body text |
| `--text-lg` | `1.125rem` | 1.75rem | Emphasis |
| `--text-xl` | `1.25rem` | 1.75rem | Section headings |
| `--text-2xl` | `1.5rem` | 2rem | Page headings |
| `--text-3xl` | `1.875rem` | 2.25rem | Hero headings |
| `--text-4xl` | `2.25rem` | 2.5rem | Display text |

#### Font Weights
| Token | Value | Usage |
|-------|-------|-------|
| `--font-normal` | `400` | Body text |
| `--font-medium` | `500` | Emphasis, buttons |
| `--font-semibold` | `600` | Headings |
| `--font-bold` | `700` | Strong emphasis |

---

### 3. Spacing Tokens

**Purpose**: Define consistent spacing scale (4px base unit)

| Token | Value | Usage |
|-------|-------|-------|
| `--space-0` | `0` | Reset |
| `--space-1` | `0.25rem` (4px) | Tight spacing |
| `--space-2` | `0.5rem` (8px) | Default gap |
| `--space-3` | `0.75rem` (12px) | Button padding |
| `--space-4` | `1rem` (16px) | Card padding |
| `--space-5` | `1.25rem` (20px) | Section gap |
| `--space-6` | `1.5rem` (24px) | Large gap |
| `--space-8` | `2rem` (32px) | Section spacing |
| `--space-10` | `2.5rem` (40px) | Large section |
| `--space-12` | `3rem` (48px) | Page padding |
| `--space-16` | `4rem` (64px) | Hero spacing |

---

### 4. Border Radius Tokens

**Purpose**: Define consistent corner rounding

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-none` | `0` | Sharp corners |
| `--radius-sm` | `0.25rem` | Badges, small elements |
| `--radius-md` | `0.375rem` | Buttons, inputs |
| `--radius-lg` | `0.5rem` | Cards |
| `--radius-xl` | `0.75rem` | Modals, large cards |
| `--radius-full` | `9999px` | Pills, avatars |

---

### 5. Shadow Tokens

**Purpose**: Define elevation and glow effects

| Token | Value (Dark) | Usage |
|-------|--------------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.3)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.4)` | Cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.5)` | Modals |
| `--shadow-glow` | `0 0 20px rgba(59,130,246,0.3)` | Focus glow |

---

### 6. Animation Tokens

**Purpose**: Define consistent motion timing

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | `150ms` | Hover states |
| `--duration-normal` | `200ms` | Standard transitions |
| `--duration-slow` | `300ms` | Complex animations |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Default easing |
| `--ease-in` | `cubic-bezier(0.4, 0, 1, 1)` | Enter animations |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |

---

### 7. Pokemon Type Colors (Refined)

**Purpose**: Integrate Pokemon type colors with the design system

| Type | Dark Theme | Light Theme |
|------|------------|-------------|
| Normal | `#9ca3af` | `#6b7280` |
| Fire | `#f97316` | `#ea580c` |
| Water | `#3b82f6` | `#2563eb` |
| Electric | `#facc15` | `#eab308` |
| Grass | `#22c55e` | `#16a34a` |
| Ice | `#22d3ee` | `#06b6d4` |
| Fighting | `#dc2626` | `#b91c1c` |
| Poison | `#a855f7` | `#9333ea` |
| Ground | `#d97706` | `#b45309` |
| Flying | `#818cf8` | `#6366f1` |
| Psychic | `#ec4899` | `#db2777` |
| Bug | `#84cc16` | `#65a30d` |
| Rock | `#a16207` | `#854d0e` |
| Ghost | `#7c3aed` | `#6d28d9` |
| Dragon | `#4f46e5` | `#4338ca` |
| Dark | `#57534e` | `#44403c` |
| Steel | `#64748b` | `#475569` |
| Fairy | `#f472b6` | `#ec4899` |

---

## Component Token Mapping

### Button Component
```
Primary:
  - bg: --accent-primary
  - text: white
  - hover: lighten 10%
  - border-radius: --radius-md

Secondary:
  - bg: --bg-200
  - text: --fg-0
  - border: --border
  - hover-bg: --bg-300

Ghost:
  - bg: transparent
  - text: --fg-100
  - hover-bg: --bg-200
```

### Card Component
```
Default:
  - bg: --bg-100
  - border: --border
  - border-radius: --radius-lg
  - padding: --space-4

Interactive:
  - hover: border -> --border-hover
  - hover: scale(1.02)
  - transition: --duration-fast
```

### Input Component
```
Default:
  - bg: --bg-0
  - border: --border
  - text: --fg-0
  - placeholder: --fg-200
  - border-radius: --radius-md

Focus:
  - border: --border-focus
  - ring: 2px --border-focus with opacity
```

---

## Database Schema Changes

**None** - This feature is purely presentational and requires no database modifications.
