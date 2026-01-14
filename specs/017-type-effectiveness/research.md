# Research: Type Effectiveness Reference

**Feature**: 017-type-effectiveness
**Date**: 2026-01-14

## Overview

Research findings for implementing a type effectiveness reference page with grid visualization and API endpoint.

---

## Decision 1: Data Source

### Decision
Use existing `src/lib/type-chart.ts` as the single source of truth for type effectiveness data.

### Rationale
- Data already exists and is complete (all 18 types with strongAgainst, weakAgainst, immuneTo)
- Follows constitution Principle IV (Single Source of Truth)
- No duplication of data
- Already validated through existing battle system usage

### Alternatives Considered
1. **Create new data file**: Rejected - would duplicate existing data
2. **Fetch from external API**: Rejected - violates constitution's local data requirement

---

## Decision 2: Grid Visualization Approach

### Decision
Client-side rendered 18x18 grid with CSS Grid layout and color-coded cells.

### Rationale
- Static data renders quickly client-side
- CSS Grid provides responsive layout with minimal code
- Color coding (green/red/gray) follows Pokemon game conventions
- No server round-trips needed

### Color Scheme
- **2x (Super Effective)**: Green background (`bg-green-500/20`)
- **0.5x (Not Very Effective)**: Red background (`bg-red-500/20`)
- **0x (Immune)**: Dark/black background (`bg-gray-800`)
- **1x (Neutral)**: No background (default)

### Alternatives Considered
1. **Server-side rendering**: Rejected - unnecessary for static data
2. **Canvas-based grid**: Rejected - over-engineering for this use case
3. **SVG visualization**: Rejected - harder to make interactive and accessible

---

## Decision 3: API Endpoint Design

### Decision
Single GET endpoint at `/api/types` with optional `type` query parameter.

### Rationale
- Simple REST pattern consistent with existing API
- Optional parameter allows both single lookup and full type list
- No authentication needed (read-only data)

### API Behavior
- `GET /api/types` - Returns list of all type names
- `GET /api/types?type=fire` - Returns effectiveness data for Fire type
- Invalid type returns 404 with error message

### Alternatives Considered
1. **Separate endpoints per type**: Rejected - unnecessary complexity
2. **POST endpoint**: Rejected - read-only data should use GET
3. **GraphQL**: Rejected - overkill for simple lookup

---

## Decision 4: Mobile Responsiveness

### Decision
Horizontal scroll with sticky first column for type names.

### Rationale
- 18x18 grid is too wide for mobile screens
- Sticky column preserves context while scrolling
- Common pattern in data tables
- Maintains full grid visibility without condensing

### Alternatives Considered
1. **Condensed/collapsed view**: Rejected - loses information density
2. **Separate mobile layout**: Rejected - increases maintenance
3. **Pinch-to-zoom**: Rejected - poor UX for reference data

---

## Decision 5: Tooltip Implementation

### Decision
CSS-based tooltips using `title` attribute with fallback to custom tooltip component.

### Rationale
- Native `title` provides basic functionality with zero JS
- Accessible by default
- Custom tooltip for enhanced styling if needed

### Alternatives Considered
1. **Third-party tooltip library**: Rejected - adds dependency for simple feature
2. **Modal on click**: Rejected - interrupts browsing flow

---

## Decision 6: Type Selector Component

### Decision
Dropdown select with detailed card display showing offensive and defensive matchups.

### Rationale
- Dropdown is familiar UI pattern
- Card format allows grouping of related information
- Shows both what type is strong against AND what it's weak to

### Alternatives Considered
1. **Click on grid row/column**: Rejected - less discoverable
2. **Search autocomplete**: Rejected - only 18 options, dropdown is simpler

---

## Best Practices Applied

### Next.js App Router
- Server component for initial render where possible
- Client component for interactive grid

### Accessibility
- Semantic table markup for grid
- Color + symbol for effectiveness (not color alone)
- Screen reader labels for cells
- Keyboard navigable

### Performance
- Static data imported at build time
- No API calls for grid render
- Efficient CSS Grid layout

---

## Open Items

None - all technical decisions resolved.
