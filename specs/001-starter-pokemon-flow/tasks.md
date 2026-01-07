# Tasks: Starter Pokemon Selection Flow

**Input**: Design documents from `/specs/001-starter-pokemon-flow/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure (Next.js App Router):
- Source: `src/app/`, `src/components/`, `src/lib/`, `src/data/`
- No separate tests directory (tests omitted per specification)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and Next.js configuration

- [x] T001 Initialize Next.js 14 project with TypeScript in project root
- [x] T002 Install dependencies: `@supabase/supabase-js`, `@supabase/ssr` in package.json
- [x] T003 [P] Configure TypeScript strict mode in tsconfig.json
- [x] T004 [P] Create .env.local with Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
- [x] T005 [P] Create base layout with global styles in src/app/layout.tsx and src/app/globals.css

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create TypeScript types in src/lib/types.ts (Pokemon, Trainer, TrainerWithStarter interfaces from data-model.md)
- [x] T007 [P] Implement Supabase browser client in src/lib/supabase/client.ts
- [x] T008 [P] Implement Supabase server client in src/lib/supabase/server.ts
- [x] T009 Update pokemon data script to add types field - modify scripts/sanitize-pokemon.ts to fetch types from PokeAPI
- [x] T010 Run sanitize script and copy output to src/data/pokemon.json with types included
- [x] T011 Create Pokemon data utilities in src/lib/pokemon.ts (getPokemon, getPokemonByType, getUniqueTypes, getPokemonById)
- [x] T012 Execute Supabase schema SQL from data-model.md to create trainers table (SQL in scripts/setup-database.sql - run manually in Supabase dashboard)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Name Entry and Login (Priority: P1) MVP

**Goal**: User can enter their name and create a trainer record in the database

**Independent Test**: Enter a name on login screen, verify redirect to selection screen and trainer record created in Supabase

### Implementation for User Story 1

- [x] T013 [US1] Create name input form component in src/components/NameEntryForm.tsx
- [x] T014 [US1] Implement POST /api/trainer route in src/app/api/trainer/route.ts (createTrainer endpoint from OpenAPI)
- [x] T015 [US1] Implement login page with NameEntryForm in src/app/page.tsx
- [x] T016 [US1] Add client-side validation (1-20 chars, non-whitespace) in src/components/NameEntryForm.tsx
- [x] T017 [US1] Add localStorage session management (store trainerId after creation) in src/lib/session.ts
- [x] T018 [US1] Add redirect to /select after successful trainer creation in src/app/page.tsx

**Checkpoint**: User Story 1 complete - users can register with a name and proceed to selection

---

## Phase 4: User Story 2 - Filter and Select Starter Pokemon (Priority: P1)

**Goal**: User can browse Pokemon, filter by type, and select a starter

**Independent Test**: View Pokemon grid, filter by type, select Pokemon, confirm selection, verify database update

### Implementation for User Story 2

- [x] T019 [P] [US2] Create PokemonCard component in src/components/PokemonCard.tsx (displays name, sprite, types)
- [x] T020 [P] [US2] Create TypeFilter component in src/components/TypeFilter.tsx (dropdown/buttons for type selection)
- [x] T021 [P] [US2] Create ConfirmationModal component in src/components/ConfirmationModal.tsx
- [x] T022 [US2] Create PokemonGrid component in src/components/PokemonGrid.tsx (uses PokemonCard, handles filtering)
- [x] T023 [US2] Implement POST /api/trainer/[id]/starter route in src/app/api/trainer/[id]/starter/route.ts (selectStarter endpoint)
- [x] T024 [US2] Implement selection page with PokemonGrid, TypeFilter in src/app/select/page.tsx
- [x] T025 [US2] Add session check and redirect logic in src/app/select/page.tsx (no trainerId → redirect to /, has starter → redirect to /dashboard)
- [x] T026 [US2] Integrate confirmation modal with starter selection API call in src/app/select/page.tsx
- [x] T027 [US2] Add redirect to /dashboard after successful starter selection in src/app/select/page.tsx

**Checkpoint**: User Story 2 complete - users can filter, browse, and select their starter Pokemon

---

## Phase 5: User Story 3 - View Dashboard with Selected Starter (Priority: P2)

**Goal**: User can view their trainer info and selected starter on a personal dashboard

**Independent Test**: Navigate to dashboard, verify trainer ID, name, and starter Pokemon are displayed correctly

### Implementation for User Story 3

- [x] T028 [P] [US3] Create TrainerInfo component in src/components/TrainerInfo.tsx (displays trainer ID, name, copy ID button)
- [x] T029 [P] [US3] Create StarterDisplay component in src/components/StarterDisplay.tsx (displays selected Pokemon with image and types)
- [x] T030 [US3] Implement GET /api/trainer/[id] route in src/app/api/trainer/[id]/route.ts (getTrainer endpoint)
- [x] T031 [US3] Implement dashboard page in src/app/dashboard/page.tsx
- [x] T032 [US3] Add session check and redirect logic in src/app/dashboard/page.tsx (no trainerId → redirect to /, no starter → redirect to /select)
- [x] T033 [US3] Add logout functionality (clear localStorage, redirect to /) in src/app/dashboard/page.tsx
- [x] T034 [US3] Add copy trainer ID to clipboard functionality in src/components/TrainerInfo.tsx

**Checkpoint**: User Story 3 complete - full user flow from registration to dashboard is functional

---

## Phase 6: Admin View (Priority: P3)

**Goal**: Admin users can view all trainers and their selected Pokemon

**Independent Test**: Set trainer role to admin in database, navigate to /admin, verify all trainers are displayed

### Implementation for Admin View

- [x] T035 [P] [US-Admin] Create TrainerList component in src/components/TrainerList.tsx (displays list of all trainers with their starters)
- [x] T036 [US-Admin] Implement GET /api/trainers route in src/app/api/trainers/route.ts (listTrainers endpoint with role check)
- [x] T037 [US-Admin] Implement admin page in src/app/admin/page.tsx
- [x] T038 [US-Admin] Add admin role check and redirect logic in src/app/admin/page.tsx (non-admin → redirect to /dashboard)

**Checkpoint**: Admin functionality complete

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T039 [P] Add loading states to all pages (login, select, dashboard, admin)
- [x] T040 [P] Add error handling UI (error boundaries, user-friendly error messages)
- [x] T041 [P] Add responsive styling for mobile devices in src/app/globals.css
- [x] T042 Verify navigation guards work correctly (all redirect scenarios from edge cases)
- [x] T043 Run quickstart.md validation - verify complete flow works end-to-end
- [x] T044 [P] Add page metadata (titles, descriptions) in each page.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1 priority - US1 should complete first as US2 depends on session
  - US3 (P2) depends on having a starter selected (US2 flow)
  - Admin view can be done in parallel with US3
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Requires US1 session management (T017) to be complete
- **User Story 3 (P2)**: Requires US2 starter selection flow to work
- **Admin View (P3)**: Can run in parallel with US3 after Foundational

### Within Each User Story

- Components before pages (build blocks first)
- API routes before page integration
- Session/redirect logic after core functionality

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T003, T004, T005 can run in parallel
```

**Phase 2 (Foundational)**:
```
T007, T008 can run in parallel (different Supabase clients)
```

**Phase 4 (US2)**:
```
T019, T020, T021 can run in parallel (independent components)
```

**Phase 5 (US3)**:
```
T028, T029 can run in parallel (independent components)
```

**Phase 7 (Polish)**:
```
T039, T040, T041, T044 can run in parallel
```

---

## Parallel Example: User Story 2 Components

```bash
# Launch all independent components together:
Task: "Create PokemonCard component in src/components/PokemonCard.tsx"
Task: "Create TypeFilter component in src/components/TypeFilter.tsx"
Task: "Create ConfirmationModal component in src/components/ConfirmationModal.tsx"

# After components complete, build composite components:
Task: "Create PokemonGrid component in src/components/PokemonGrid.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Name Entry)
4. Complete Phase 4: User Story 2 (Pokemon Selection)
5. **STOP and VALIDATE**: Test registration → selection flow
6. Deploy/demo if ready - users can now complete the core journey!

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. User Story 1 → Users can register
3. User Story 2 → Users can select starter (MVP!)
4. User Story 3 → Users have dashboard
5. Admin View → Instructors can view all selections
6. Polish → Production-ready

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4**
- Users can enter name, select Pokemon, and confirm
- Minimal but complete value delivery

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Pokemon type data must be added in Phase 2 before selection screen works
