# Tasks: Sanitize Pokemon Data

**Input**: Design documents from `/specs/001-sanitize-pokemon-data/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, quickstart.md

**Tests**: No tests explicitly requested in spec. Manual verification per quickstart.md.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Script**: `scripts/sanitize-pokemon.ts`
- **Data Input**: `pokemon/pokemon.json`
- **Data Output**: `pokemon/pokemon-sanitized.json`

---

## Phase 1: Setup

**Purpose**: Create scripts directory and TypeScript configuration

- [x] T001 Create scripts directory at repository root: `scripts/`
- [x] T002 [P] Add tsx as dev dependency for running TypeScript scripts: `package.json`

**Checkpoint**: Scripts directory exists, tsx available for running .ts files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define TypeScript interfaces that both user stories depend on

- [x] T003 Create Pokemon and Sprites TypeScript interfaces in `scripts/sanitize-pokemon.ts` (top of file, before main logic)

**Checkpoint**: Type definitions ready for implementation

---

## Phase 3: User Story 1 - Developer Loads Minimal Pokemon Data (Priority: P1) 🎯 MVP

**Goal**: Transform pokemon.json to contain only 151 Pokemon with name, number, and sprites fields

**Independent Test**: Run script, verify output file has exactly 151 entries with 3 fields each

### Implementation for User Story 1

- [x] T004 [US1] Implement file reading logic to load `pokemon/pokemon.json` in `scripts/sanitize-pokemon.ts`
- [x] T005 [US1] Implement filter function to select only Pokemon with numbers 1-151 in `scripts/sanitize-pokemon.ts`
- [x] T006 [US1] Implement transform function to extract only name, number, and sprites fields in `scripts/sanitize-pokemon.ts`
- [x] T007 [US1] Implement sprites transformation to keep only main and sprite URLs (exclude shiny variants) in `scripts/sanitize-pokemon.ts`
- [x] T008 [US1] Implement sorting to ensure output is ordered by Pokemon number ascending in `scripts/sanitize-pokemon.ts`
- [x] T009 [US1] Implement file writing logic to save output to `pokemon/pokemon-sanitized.json`
- [x] T010 [US1] Add console output showing entry count and file size comparison in `scripts/sanitize-pokemon.ts`

**Checkpoint**: Running `npx tsx scripts/sanitize-pokemon.ts` produces valid output file with 151 Pokemon

---

## Phase 4: User Story 2 - Application Displays Pokemon Images (Priority: P2)

**Goal**: Ensure all image URLs in sanitized data are valid and accessible

**Independent Test**: Verify sprites object contains exactly main and sprite URLs, no shiny variants

### Implementation for User Story 2

- [x] T011 [US2] Add validation to confirm each Pokemon has both main and sprite URLs in `scripts/sanitize-pokemon.ts`
- [x] T012 [US2] Add console warning for any Pokemon missing image URLs in `scripts/sanitize-pokemon.ts`
- [x] T013 [US2] Run script and manually verify first/last Pokemon image URLs are accessible (Bulbasaur #1, Mew #151)

**Checkpoint**: All 151 Pokemon have valid, accessible image URLs

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T014 Verify output file size is reduced by at least 80% compared to original
- [x] T015 Run quickstart.md validation steps to confirm all success criteria met
- [x] T016 [P] Add npm script `sanitize-pokemon` to package.json for easy execution

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion (needs output file)
- **Polish (Phase 5)**: Depends on User Story 2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Independent - creates the sanitized data file
- **User Story 2 (P2)**: Depends on US1 output file existing for validation

### Within User Story 1

Sequential execution required:
1. T004 (read) → T005 (filter) → T006 (transform) → T007 (sprites) → T008 (sort) → T009 (write) → T010 (output)

### Parallel Opportunities

- T001 and T002 can run in parallel (Setup phase)
- T014 and T016 can run in parallel (Polish phase)

---

## Parallel Example: Setup Phase

```bash
# Launch setup tasks together:
Task: "Create scripts directory at repository root: scripts/"
Task: "Add tsx as dev dependency for running TypeScript scripts: package.json"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (type definitions)
3. Complete Phase 3: User Story 1 (core transformation)
4. **STOP and VALIDATE**: Run script, verify 151 Pokemon in output
5. Output file ready for app integration

### Incremental Delivery

1. Complete Setup + Foundational → Type definitions ready
2. Complete User Story 1 → Sanitized file created (MVP!)
3. Complete User Story 2 → Image URLs validated
4. Complete Polish → All success criteria verified

---

## Notes

- All US1 tasks modify the same file (`scripts/sanitize-pokemon.ts`) - must be sequential
- US2 tasks add validation to the same script - builds on US1
- This is a one-time data preprocessing task, not runtime code
- Commit after each phase completion
- Output file (`pokemon-sanitized.json`) is the deliverable
