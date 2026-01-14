# Implementation Tasks: Type Effectiveness Reference

**Feature**: 017-type-effectiveness
**Generated**: 2026-01-14
**Source**: [plan.md](./plan.md), [spec.md](./spec.md)

## Task Summary

| User Story | Tasks | Priority |
|------------|-------|----------|
| US1 - View Type Effectiveness Grid | T001-T005 | P1 |
| US2 - Look Up Single Type Effectiveness | T006-T010 | P2 |
| US3 - Update Documentation and Changelog | T011-T013 | P3 |

**Total Tasks**: 13

---

## Phase 1: Type Effectiveness Grid (US1 - P1)

### T001: Create TypeEffectivenessGrid component

**Priority**: P1
**Depends on**: None
**File**: `src/components/TypeEffectivenessGrid.tsx`

Create the main 18x18 grid component showing all type matchups.

**Implementation**:
1. Create new file `src/components/TypeEffectivenessGrid.tsx`
2. Import `TYPE_CHART` and `getTypeEffectiveness` from `@/lib/type-chart`
3. Define `TYPES` array from `Object.keys(TYPE_CHART)`
4. Create helper function `getEffectivenessClass(multiplier)` returning appropriate Tailwind classes:
   - 0 (immune): `bg-gray-800 text-gray-400`
   - 2 (super effective): `bg-green-500/20 text-green-400`
   - 0.5 (not very effective): `bg-red-500/20 text-red-400`
   - 1 (neutral): `text-[var(--fg-300)]`
5. Create helper function `getEffectivenessDisplay(multiplier)` returning display text:
   - 0 -> "0"
   - 0.5 -> "1/2"
   - 2 -> "2"
   - 1 -> "-"
6. Implement grid using HTML `<table>` with semantic markup
7. Add sticky first column for row labels using `sticky left-0`
8. Add `title` attribute for tooltips on each cell

**Acceptance Criteria**:
- [X] Grid displays all 18 types as rows and columns
- [X] Cells are color-coded by effectiveness
- [X] First column stays visible during horizontal scroll
- [X] Tooltips show on hover

---

### T002: Create TypeDetailCard component

**Priority**: P1
**Depends on**: None
**File**: `src/components/TypeDetailCard.tsx`

Create a component to display detailed effectiveness info for a selected type.

**Implementation**:
1. Create new file `src/components/TypeDetailCard.tsx`
2. Define `TypeDetailCardProps` interface with `type: string`
3. Import `TYPE_CHART` from `@/lib/type-chart`
4. Look up type data from `TYPE_CHART[type]`
5. Return null if type not found
6. Display sections for:
   - Super Effective Against (2x) - green badges
   - Not Very Effective Against (0.5x) - red badges
   - No Effect On (0x) - gray badges
7. Only show sections if array is non-empty
8. Use `card` class for container styling

**Acceptance Criteria**:
- [X] Component displays type name as heading
- [X] Shows strongAgainst types with green styling
- [X] Shows weakAgainst types with red styling
- [X] Shows immuneTo types with gray styling
- [X] Handles missing type gracefully

---

### T003: Create TypeSelector component

**Priority**: P1
**Depends on**: T002
**File**: `src/components/TypeSelector.tsx`

Create a dropdown selector for choosing a type to view details.

**Implementation**:
1. Create new file `src/components/TypeSelector.tsx`
2. Add 'use client' directive
3. Import `useState` from React
4. Import `TYPE_CHART` from `@/lib/type-chart`
5. Import `TypeDetailCard` from `./TypeDetailCard`
6. Create `TYPES` array from `Object.keys(TYPE_CHART)`
7. Use `useState<string>('')` for selected type
8. Render `<select>` with `input` class styling
9. Add default "Select a type..." option with empty value
10. Map types to `<option>` elements with capitalized text
11. Conditionally render `TypeDetailCard` when type is selected

**Acceptance Criteria**:
- [X] Dropdown lists all 18 types
- [X] Selecting a type shows TypeDetailCard
- [X] Default state shows no card
- [X] Types are capitalized in dropdown

---

### T004: Create types page

**Priority**: P1
**Depends on**: T001, T003
**File**: `src/app/types/page.tsx`

Create the main types page combining grid and selector.

**Implementation**:
1. Create directory `src/app/types/`
2. Create file `src/app/types/page.tsx`
3. Import `Link` from `next/link`
4. Import `TypeEffectivenessGrid` and `TypeSelector` components
5. Add back link to home page
6. Add page title "Type Effectiveness" with h1
7. Add descriptive paragraph
8. Create "Look Up Type" section with TypeSelector
9. Create "Full Type Chart" section with TypeEffectivenessGrid
10. Use responsive layout with appropriate spacing

**Acceptance Criteria**:
- [X] Page accessible at `/types`
- [X] Back link navigates to home
- [X] Type selector section displays
- [X] Full grid section displays
- [X] Layout is responsive

---

### T005: Add navigation link to types page

**Priority**: P1
**Depends on**: T004
**File**: `src/app/layout.tsx`

Add Types link to the footer navigation.

**Implementation**:
1. Open `src/app/layout.tsx`
2. Locate footer navigation section
3. Add Link to `/types` with text "Types"
4. Match existing link styling

**Acceptance Criteria**:
- [X] Types link appears in footer
- [X] Link navigates to `/types` page
- [X] Styling matches other footer links

---

## Phase 2: Single Type Lookup API (US2 - P2)

### T006: Create types API endpoint

**Priority**: P2
**Depends on**: None
**File**: `src/app/api/types/route.ts`

Create GET endpoint for type effectiveness queries.

**Implementation**:
1. Create directory `src/app/api/types/`
2. Create file `src/app/api/types/route.ts`
3. Import `NextRequest`, `NextResponse` from `next/server`
4. Import `TYPE_CHART` from `@/lib/type-chart`
5. Implement `GET` handler:
   - Extract `type` query parameter (lowercase)
   - Get `availableTypes` from `Object.keys(TYPE_CHART)`
   - If no type parameter: return `{ types: availableTypes }`
   - Look up type in `TYPE_CHART`
   - If not found: return 404 with error, message, and suggestions
   - If found: return type, strongAgainst, weakAgainst, immuneTo
6. Add similar type suggestions for typos

**Acceptance Criteria**:
- [X] `GET /api/types` returns list of all types
- [X] `GET /api/types?type=fire` returns fire type data
- [X] `GET /api/types?type=invalid` returns 404 with error
- [X] Type lookup is case-insensitive

---

### T007: Test API endpoint - list all types

**Priority**: P2
**Depends on**: T006
**File**: N/A (manual test)

Verify API returns all types when no parameter provided.

**Test Steps**:
1. Start dev server
2. Request `GET /api/types`
3. Verify response contains `types` array with 18 items
4. Verify all standard Pokemon types are present

**Acceptance Criteria**:
- [ ] Response status is 200
- [ ] Response contains types array
- [ ] Array contains exactly 18 types

---

### T008: Test API endpoint - single type lookup

**Priority**: P2
**Depends on**: T006
**File**: N/A (manual test)

Verify API returns correct data for specific type queries.

**Test Steps**:
1. Request `GET /api/types?type=fire`
2. Verify response includes:
   - type: "fire"
   - strongAgainst: ["grass", "ice", "bug", "steel"]
   - weakAgainst: ["fire", "water", "rock", "dragon"]
   - immuneTo: []
3. Test case insensitivity with `?type=FIRE`
4. Test with other types (ghost, normal)

**Acceptance Criteria**:
- [ ] Response contains correct type name
- [ ] strongAgainst array is accurate
- [ ] weakAgainst array is accurate
- [ ] immuneTo array is accurate
- [ ] Case insensitivity works

---

### T009: Test API endpoint - invalid type

**Priority**: P2
**Depends on**: T006
**File**: N/A (manual test)

Verify API returns proper error for invalid types.

**Test Steps**:
1. Request `GET /api/types?type=invalid`
2. Verify 404 status
3. Verify response includes:
   - error: "TYPE_NOT_FOUND"
   - message with type name
   - availableTypes array
4. Test with partial match (e.g., "fir") to verify suggestions

**Acceptance Criteria**:
- [ ] Response status is 404
- [ ] Error code is TYPE_NOT_FOUND
- [ ] Message includes searched type
- [ ] Suggestions are provided when applicable

---

### T010: Test grid mobile responsiveness

**Priority**: P2
**Depends on**: T001, T004
**File**: N/A (manual test)

Verify grid works properly on mobile devices.

**Test Steps**:
1. Open `/types` page in mobile viewport (375px width)
2. Verify horizontal scrolling works
3. Verify first column (type names) stays sticky
4. Verify grid content is readable
5. Test touch interactions

**Acceptance Criteria**:
- [ ] Grid scrolls horizontally
- [ ] First column stays visible
- [ ] Content is readable
- [ ] Touch interactions work

---

## Phase 3: Documentation Updates (US3 - P3)

### T011: Update API documentation page

**Priority**: P3
**Depends on**: T006
**File**: `src/app/api-docs/page.tsx`

Add types endpoint to API documentation.

**Implementation**:
1. Open `src/app/api-docs/page.tsx`
2. Add new section for Types API
3. Document endpoints:
   - `GET /api/types` - List all types
   - `GET /api/types?type={name}` - Get type effectiveness
4. Include request/response examples
5. Document error responses
6. Match existing documentation style

**Acceptance Criteria**:
- [X] Types API section added
- [X] Both endpoints documented
- [X] Examples provided
- [X] Error responses documented

---

### T012: Update changelog

**Priority**: P3
**Depends on**: T004, T006
**File**: `src/data/changelog.json`

Add entry for type effectiveness feature.

**Implementation**:
1. Open `src/data/changelog.json`
2. Add new version entry (1.3.0 or appropriate version)
3. Include changes:
   - Added: Type effectiveness reference page
   - Added: 18x18 type matchup grid
   - Added: Single type lookup with dropdown
   - Added: /api/types endpoint
4. Set appropriate date

**Acceptance Criteria**:
- [X] New version entry added
- [X] All feature additions listed
- [X] Date is correct
- [X] Version follows semver

---

### T013: Final verification and cleanup

**Priority**: P3
**Depends on**: T001-T012
**File**: N/A

Complete final testing and verification.

**Test Steps**:
1. Run `npm run build` to verify no build errors
2. Run `npm run lint` to verify no lint errors
3. Navigate through all new pages
4. Verify all links work
5. Test on different viewport sizes
6. Review console for errors

**Acceptance Criteria**:
- [X] Build succeeds
- [X] No lint errors
- [X] All pages accessible
- [X] No console errors
- [X] Mobile responsive
