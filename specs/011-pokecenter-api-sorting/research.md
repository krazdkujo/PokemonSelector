# Research: Pokecenter API Sorting and Documentation Update

**Date**: 2026-01-11
**Feature**: 011-pokecenter-api-sorting

## Research Tasks

### 1. Current API Implementation

**Finding**: The Pokecenter API is located at `src/app/api/pokecenter/route.ts`

**Current Sort Order**:
```typescript
.order('captured_at', { ascending: true })
```

**Decision**: Change to `ascending: false` to show most recent first
**Rationale**: Single parameter change achieves the requirement with no side effects
**Alternatives Considered**: None needed - Supabase query API is well-documented

### 2. Database Schema Verification

**Finding**: The `pokemon_owned` table has a `captured_at` column (confirmed by existing query usage)

**Decision**: No schema changes required
**Rationale**: The column already exists and is used for ordering
**Alternatives Considered**: None

### 3. Documentation URL Audit

**Finding**: API documentation exists at:
- `docs/API.md` - Primary documentation
- `public/docs/API.md` - Public-facing copy

**Current Placeholder URLs**:
- Base URL section: `https://your-app.vercel.app`
- All curl examples: `https://your-app.vercel.app`
- Python examples: `https://your-app.vercel.app`
- JavaScript examples: `https://your-app.vercel.app`

**Decision**: Replace all instances of `your-app.vercel.app` with `pokemon-selector-rctq.vercel.app`
**Rationale**: Direct find-and-replace ensures consistency across all examples
**Alternatives Considered**: None - straightforward text replacement

### 4. OpenAPI Specification Check

**Finding**: The documentation references `openapi.yaml` at the bottom. Need to verify if it exists and update accordingly.

**Decision**: Check for OpenAPI spec and update if present
**Rationale**: Complete documentation update requires all API specification files

## Summary

All technical context is clear. No clarifications needed.

| Item | Status | Action |
|------|--------|--------|
| Sort order change | Clear | Flip `ascending: true` to `ascending: false` |
| Database schema | Clear | No changes needed |
| Documentation URLs | Clear | Replace placeholder with production URL |
| OpenAPI spec | To verify | Update if exists |
