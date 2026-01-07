# Tasks: Pokemon Nickname

**Input**: Design documents from `/specs/004-pokemon-nickname/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: No test tasks included (no test framework configured, tests not explicitly requested).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js App Router (single project)
- **Source code**: `src/`
- **API routes**: `src/app/api/`
- **Components**: `src/components/`
- **SQL migrations**: `sql/`
- **Documentation**: `docs/`

---

## Phase 1: Setup

**Purpose**: Database migration and type system updates (required by all user stories)

- [x] T001 Create database migration file sql/005_add_nickname.sql with ALTER TABLE to add starter_pokemon_nickname VARCHAR(20) column and CHECK constraint
- [x] T002 Run database migration with `npm run db:migrate`
- [x] T003 Add starter_pokemon_nickname field to Trainer interface in src/lib/types.ts
- [x] T004 Add nickname field to ExternalTrainerResponse.pokemon interface in src/lib/types.ts

**Checkpoint**: Database schema updated and TypeScript types ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create the nickname API endpoint that all user stories depend on

**Why blocking**: US1, US2, and US3 all require the ability to set/update/clear nicknames via API

- [x] T005 Create new API route file src/app/api/trainer/[id]/nickname/route.ts with basic structure
- [x] T006 Implement PUT handler in src/app/api/trainer/[id]/nickname/route.ts for setting/updating nickname
- [x] T007 Add validation logic: trim whitespace, check 1-20 char length, reject whitespace-only in src/app/api/trainer/[id]/nickname/route.ts
- [x] T008 Add 400 error response for trainer without Pokemon in src/app/api/trainer/[id]/nickname/route.ts
- [x] T009 Add 404 error response for trainer not found in src/app/api/trainer/[id]/nickname/route.ts
- [x] T010 Implement DELETE handler in src/app/api/trainer/[id]/nickname/route.ts to clear nickname

**Checkpoint**: Foundation ready - nickname API endpoint fully functional with validation

---

## Phase 3: User Story 1 - Nickname Pokemon After Selection (Priority: P1) MVP

**Goal**: Allow trainers to set a nickname for their Pokemon and display it in the UI

**Independent Test**: Have a trainer with a selected Pokemon add a nickname and verify it displays correctly

### Implementation for User Story 1

- [x] T011 [P] [US1] Create NicknameEditor component file src/components/NicknameEditor.tsx with text input (maxLength=20), save button, clear button
- [x] T012 [P] [US1] Add state management to NicknameEditor: current value, loading state, error state in src/components/NicknameEditor.tsx
- [x] T013 [US1] Add API call to PUT /api/trainer/[id]/nickname in NicknameEditor save handler in src/components/NicknameEditor.tsx
- [x] T014 [US1] Add API call to DELETE /api/trainer/[id]/nickname in NicknameEditor clear handler in src/components/NicknameEditor.tsx
- [x] T015 [US1] Modify StarterDisplay to accept optional nickname prop and display it above species name in src/components/StarterDisplay.tsx
- [x] T016 [US1] Update StarterDisplay to show format "Nickname (Species Name)" or just "Species Name" when no nickname in src/components/StarterDisplay.tsx
- [x] T017 [US1] Integrate NicknameEditor into the page where StarterDisplay is used (src/app/page.tsx or relevant parent)
- [x] T018 [US1] Ensure nickname is included in trainer data fetch queries throughout the app

**Checkpoint**: User Story 1 complete - trainers can set nicknames and see them displayed

---

## Phase 4: User Story 2 - Change Existing Nickname (Priority: P2)

**Goal**: Allow trainers to update or remove their Pokemon's nickname

**Independent Test**: Have a trainer with existing nickname change it to a new value or clear it

### Implementation for User Story 2

- [x] T019 [US2] Update NicknameEditor to show current nickname as initial value in input field in src/components/NicknameEditor.tsx
- [x] T020 [US2] Add visual feedback for successful nickname update (success message or UI indicator) in src/components/NicknameEditor.tsx
- [x] T021 [US2] Add confirmation or instant feedback when nickname is cleared in src/components/NicknameEditor.tsx
- [x] T022 [US2] Ensure StarterDisplay updates immediately after nickname change without page refresh in src/components/StarterDisplay.tsx

**Checkpoint**: User Story 2 complete - trainers can change or clear existing nicknames

---

## Phase 5: User Story 3 - View Nickname via External API (Priority: P2)

**Goal**: Include nickname in external API response for third-party integrations

**Independent Test**: Make API request for trainer with nicknamed Pokemon and verify nickname field in response

### Implementation for User Story 3

- [x] T023 [US3] Update database SELECT query to include starter_pokemon_nickname in src/app/api/external/trainer/route.ts
- [x] T024 [US3] Add nickname field to pokemon response object in src/app/api/external/trainer/route.ts
- [x] T025 [US3] Ensure nickname is null (not omitted) when not set in src/app/api/external/trainer/route.ts
- [x] T026 [US3] Verify existing behavior unchanged when pokemon is null in src/app/api/external/trainer/route.ts

**Checkpoint**: User Story 3 complete - external API returns nickname in responses

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation updates and edge case handling

- [x] T027 [P] Update API documentation in docs/API.md to add nickname field to response format
- [x] T028 [P] Add nickname examples (with and without) to docs/API.md response examples
- [x] T029 [P] Update Python and JavaScript code examples in docs/API.md to show nickname usage
- [x] T030 Add to Response Fields table in docs/API.md: pokemon.nickname | string or null | Custom nickname set by trainer
- [x] T031 Run `npm run lint` to verify no TypeScript or ESLint errors
- [ ] T032 Manual verification: test all acceptance scenarios from spec.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001-T004) - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - US1, US2, US3 can proceed in parallel after Foundational
  - Recommended: Complete US1 first as it's MVP
- **Polish (Phase 6)**: Can start after US3 completes (for API docs accuracy)

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (nickname API). No dependencies on other stories.
- **User Story 2 (P2)**: Depends on Phase 2. Builds on US1 components but can be tested independently.
- **User Story 3 (P2)**: Depends on Phase 2 only. Completely independent of US1/US2 (different codebase area).

### Within Each Phase

- Setup: T001 → T002 (migration must exist before running), T003-T004 parallel
- Foundational: T005 → T006-T010 (route file must exist first)
- US1: T011-T012 parallel → T013-T014 → T015-T016 parallel → T017-T018
- US2: All tasks sequential (same file)
- US3: T023 → T024-T026 sequential (same file, dependent logic)
- Polish: T027-T030 all parallel (different files), T031-T032 sequential at end

### Parallel Opportunities

**Phase 1 (Setup):**
```
T001 (migration file)
T002 (run migration) - after T001
T003, T004 - parallel with each other, after T002
```

**Phase 2 (Foundational):**
```
T005 (create route file)
T006-T010 - sequential (same file)
```

**User Stories (can run in parallel after Phase 2):**
```
Team A: US1 (T011-T018)
Team B: US3 (T023-T026)
Then: US2 (T019-T022) after US1 components exist
```

**Phase 6 (Polish):**
```
T027, T028, T029, T030 - all parallel (docs changes)
T031 (lint) - after all code changes
T032 (manual test) - final
```

---

## Parallel Example: User Story 1

```bash
# Launch component creation in parallel:
Task: "Create NicknameEditor component file src/components/NicknameEditor.tsx"
Task: "Modify StarterDisplay to accept optional nickname prop src/components/StarterDisplay.tsx"

# These touch different files - safe to parallelize
```

---

## Parallel Example: Phase 6 Documentation

```bash
# All documentation tasks can run in parallel:
Task: "Update API documentation in docs/API.md to add nickname field"
Task: "Add nickname examples to docs/API.md"
Task: "Update code examples in docs/API.md"
Task: "Add to Response Fields table in docs/API.md"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010)
3. Complete Phase 3: User Story 1 (T011-T018)
4. **STOP and VALIDATE**: Test nickname set/display flow
5. Deploy/demo if ready - trainers can now nickname their Pokemon!

### Incremental Delivery

1. Complete Setup + Foundational → API ready
2. Add User Story 1 → Trainers can set and see nicknames (MVP!)
3. Add User Story 2 → Trainers can change/clear nicknames
4. Add User Story 3 → External API returns nicknames
5. Complete Polish → Documentation complete

### Recommended Execution Order

For a single developer:
```
T001 → T002 → T003 + T004 → T005 → T006-T010 →
T011 + T012 → T013 → T014 → T015 + T016 → T017 → T018 →
T019 → T020 → T021 → T022 →
T023 → T024 → T025 → T026 →
T027 + T028 + T029 + T030 → T031 → T032
```

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 is completely independent of US1/US2 - can be developed in parallel
- US2 enhances US1 components but both stories remain independently testable
- No test tasks included - test framework not configured in project
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
