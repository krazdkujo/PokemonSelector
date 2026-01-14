# Research: Build Changelog with Version Tracking

**Feature**: 016-build-changelog
**Date**: 2026-01-14

## Overview

Research findings for implementing a changelog feature that displays application version history with semantic versioning, categorized changes, and search/filter capabilities.

---

## Decision 1: Data Storage Approach

### Decision
Use a static JSON file (`src/data/changelog.json`) bundled with the application.

### Rationale
- **Constitution Alignment**: Follows Principle IV (Single Source of Truth) - "Pokemon master data... MUST be loaded from a local data source bundled with the application"
- **Simplicity**: No database schema changes required
- **Performance**: Static data can be cached and served directly from CDN
- **Versioning**: Changelog updates are tracked in git alongside code changes
- **Immutability**: Read-only data that cannot be modified at runtime

### Alternatives Considered
1. **Supabase Table**: Rejected - adds unnecessary database complexity for read-only data; violates constitution's preference for bundled immutable data
2. **Markdown File (CHANGELOG.md)**: Rejected - requires parsing at runtime; harder to filter/search programmatically
3. **External API**: Rejected - adds external dependency; violates serverless architecture principles

---

## Decision 2: JSON Data Structure

### Decision
Use a flat array of version objects with embedded change entries.

### Rationale
- Simple to parse and filter client-side
- Supports efficient reverse chronological sorting
- Categories embedded per change for flexible filtering
- Compatible with TypeScript type inference

### Data Structure
```json
{
  "versions": [
    {
      "version": "1.2.0",
      "date": "2026-01-14",
      "changes": [
        { "category": "Added", "description": "New changelog feature" },
        { "category": "Fixed", "description": "Login redirect bug" }
      ]
    }
  ]
}
```

### Alternatives Considered
1. **Nested by Category**: Rejected - harder to display chronologically; duplicates version metadata
2. **Separate Files per Version**: Rejected - increases file count; complicates loading

---

## Decision 3: Pagination Strategy

### Decision
Client-side pagination with 20 entries per page (configurable).

### Rationale
- Static data is small enough to load entirely (100 versions ~ 50KB)
- Client-side filtering provides instant results
- No API round-trips for pagination
- Simple implementation with React state

### Alternatives Considered
1. **Server-side Pagination**: Rejected - unnecessary for static data; adds complexity
2. **Infinite Scroll**: Rejected - harder to navigate to specific versions; less accessible
3. **Virtual Scrolling**: Rejected - over-engineering for expected data size

---

## Decision 4: Search/Filter Implementation

### Decision
Client-side filtering with debounced search input.

### Rationale
- All data loaded on page mount
- Instant filtering without API calls
- Debounce prevents excessive re-renders
- Simple string matching for version numbers
- Category filtering via checkbox or dropdown

### Search Approach
- Version search: Case-insensitive prefix/substring match
- Category filter: Exact match on category field
- Combine filters with AND logic

### Alternatives Considered
1. **Server-side Search**: Rejected - adds latency; unnecessary for small dataset
2. **Full-text Search Library**: Rejected - over-engineering; simple string matching sufficient

---

## Decision 5: Navigation Access

### Decision
Add changelog link to application footer and/or header navigation.

### Rationale
- Accessible from any page (meets SC-001: within 2 clicks)
- Non-intrusive placement
- Follows existing navigation patterns

### Implementation
- Add link in `src/app/layout.tsx` footer section
- Route: `/changelog`

### Alternatives Considered
1. **Dedicated Menu Item**: Rejected - changelog is secondary feature; doesn't warrant primary navigation
2. **Modal/Overlay**: Rejected - less discoverable; harder to share direct links

---

## Decision 6: Semantic Versioning Format

### Decision
Use MAJOR.MINOR.PATCH format (e.g., 1.2.3).

### Rationale
- Industry standard (semver.org)
- Aligns with spec requirements (FR-003)
- Clear meaning: MAJOR (breaking), MINOR (features), PATCH (fixes)
- Already mentioned in constitution's amendment process

### Version Validation
- Regex pattern: `^\d+\.\d+\.\d+$`
- Sort by parsing each segment as integer

---

## Best Practices Applied

### Next.js App Router
- Use Server Component for initial data load
- Client Component for interactive filtering
- Static data import for build-time optimization

### TypeScript
- Define strict types for Version and ChangeEntry
- Use discriminated unions for category types
- Export types from `src/lib/changelog.ts`

### Accessibility
- Semantic HTML (headings, lists)
- Keyboard navigable filters
- ARIA labels for search input
- Visible focus states

### Performance
- Load changelog data once on mount
- Memoize filtered results
- Debounce search input (300ms)

---

## Open Items

None - all technical decisions resolved.
