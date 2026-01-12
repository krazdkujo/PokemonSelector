# Tasks: Combat System Refinement

**Input**: Design documents from `/specs/008-combat-refinement/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No automated tests - manual testing via dev server per project configuration.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Web app (Next.js)**: `src/app/`, `src/components/`, `src/lib/`
- API routes in `src/app/api/`
- Components in `src/components/`
- Utilities in `src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Type definitions and shared utilities needed by multiple user stories

- [x] T001 Add PostBattleSummary type definition in src/lib/types.ts
- [x] T002 [P] Add CaptureEligibility type definition in src/lib/types.ts
- [x] T003 [P] Add MovePreview type definition in src/lib/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: No foundational changes needed - all infrastructure exists from previous features

**Checkpoint**: Foundation ready - this feature builds on existing battle system from 006-combat-zones and XP system from 007-experience-leveling

---

## Phase 3: User Story 1 - Show DC Before Roll (Priority: P1)

**Goal**: Display the Difficulty Class (DC) before revealing the roll result so players understand what they're trying to hit

**Independent Test**: Start any battle, select a move, and verify the DC is displayed prominently before the roll result is shown

### Implementation for User Story 1

- [x] T004 [US1] Add pendingMove state to track selected move before execution in src/app/battle/page.tsx
- [x] T005 [US1] Create DC preview display section in src/components/BattleArena.tsx showing "DC: X - Roll X+ to win"
- [x] T006 [US1] Modify move selection flow to show DC before calling API in src/app/battle/page.tsx
- [x] T007 [US1] Add "Confirm Attack" button after DC is shown to trigger actual roll in src/components/BattleArena.tsx
- [x] T008 [US1] Update round result display to show roll vs DC comparison clearly in src/components/BattleArena.tsx

**Checkpoint**: Players now see DC before roll - verify by starting battle, selecting move, seeing DC, then confirming to see roll

---

## Phase 4: User Story 2 - Post-Battle XP Display (Priority: P1)

**Goal**: Show a summary screen after battle ends with XP progression (previous XP, gained, new total)

**Independent Test**: Win or lose a battle and verify the post-battle screen displays XP information

### Implementation for User Story 2

- [x] T009 [P] [US2] Create PostBattleScreen component skeleton in src/components/PostBattleScreen.tsx
- [x] T010 [US2] Implement battle outcome display (Victory/Defeat/Capture/Fled) in src/components/PostBattleScreen.tsx
- [x] T011 [US2] Implement XP display section showing previous, gained, and new total in src/components/PostBattleScreen.tsx
- [x] T012 [US2] Add XP progress bar visualization in src/components/PostBattleScreen.tsx
- [x] T013 [US2] Track experience_gained from round API response in src/app/battle/page.tsx
- [x] T014 [US2] Replace battle end screen with PostBattleScreen component in src/app/battle/page.tsx
- [x] T015 [US2] Add "Continue" button to return to dashboard or start new battle in src/components/PostBattleScreen.tsx

**Checkpoint**: After any battle ends, players see XP summary - verify win (formula XP), loss (1 XP), and capture scenarios

---

## Phase 5: User Story 3 - Level-Up Notification (Priority: P2)

**Goal**: Show celebratory level-up notification when Pokemon gains levels after battle

**Independent Test**: Win battles until a level-up occurs and verify the level-up notification appears with previous and new level

**Dependency**: Depends on US2 (PostBattleScreen must exist)

### Implementation for User Story 3

- [x] T016 [US3] Add level-up detection logic checking levels_gained > 0 in src/components/PostBattleScreen.tsx
- [x] T017 [US3] Create level-up banner component section in src/components/PostBattleScreen.tsx
- [x] T018 [US3] Implement "Level X -> Level Y!" display format in src/components/PostBattleScreen.tsx
- [x] T019 [US3] Handle multi-level gains display (e.g., "Level 3 -> Level 5!") in src/components/PostBattleScreen.tsx
- [x] T020 [US3] Handle max level edge case showing "MAX LEVEL REACHED!" in src/components/PostBattleScreen.tsx
- [x] T021 [US3] Add celebratory styling (colors, emphasis) for level-up banner in src/components/PostBattleScreen.tsx

**Checkpoint**: Level-up notification appears correctly for single and multi-level gains, max level shows special message

---

## Phase 6: User Story 4 - Capture Restriction for Owned Pokemon (Priority: P2)

**Goal**: Prevent players from capturing Pokemon species they already own, encouraging diverse collections

**Independent Test**: Encounter a Pokemon species you already own and verify the capture button is disabled with explanatory message

### Implementation for User Story 4

- [x] T022 [US4] Add ownership check query in GET /api/capture route in src/app/api/capture/route.ts
- [x] T023 [US4] Add already_owned and ownership_message to GET /api/capture response in src/app/api/capture/route.ts
- [x] T024 [US4] Add ownership check before capture attempt in POST /api/capture route in src/app/api/capture/route.ts
- [x] T025 [US4] Add ALREADY_OWNED error response to POST /api/capture in src/app/api/capture/route.ts
- [x] T026 [US4] Add wild_pokemon_owned field to GET /api/battle response in src/app/api/battle/route.ts
- [x] T027 [US4] Update CaptureAttempt props to accept alreadyOwned and ownershipMessage in src/components/CaptureAttempt.tsx
- [x] T028 [US4] Disable capture button when alreadyOwned is true in src/components/CaptureAttempt.tsx
- [x] T029 [US4] Show "Already caught - can only knock out" tooltip/message in src/components/CaptureAttempt.tsx
- [x] T030 [US4] Pass ownership info from battle API to CaptureAttempt in src/app/battle/page.tsx

**Checkpoint**: Capture disabled for owned species with clear message, capture works normally for new species

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and edge case handling

- [x] T031 Verify DC display handles edge cases (DC 1, DC 20) in src/components/BattleArena.tsx
- [x] T032 Verify XP display handles 0 XP scenarios (fled before battle end) in src/components/PostBattleScreen.tsx
- [x] T033 Test ownership check with multiple Pokemon of same species from different sources in src/app/api/capture/route.ts
- [ ] T034 Run quickstart.md validation checklist manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: N/A - no foundational tasks needed
- **User Story 1 (Phase 3)**: Depends on Setup (type definitions)
- **User Story 2 (Phase 4)**: Depends on Setup (type definitions)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (PostBattleScreen must exist)
- **User Story 4 (Phase 6)**: Depends on Setup (type definitions)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - can start after Setup
- **User Story 2 (P1)**: Independent - can start after Setup
- **User Story 3 (P2)**: Depends on US2 (builds on PostBattleScreen)
- **User Story 4 (P2)**: Independent - can start after Setup

### Within Each User Story

- UI components before page integration
- API changes before UI consumption
- Core implementation before edge cases

### Parallel Opportunities

- Setup tasks T001, T002, T003 can run in parallel (different type definitions)
- US1 and US2 can run in parallel (different components, no shared dependencies)
- US4 can run in parallel with US1/US2 (different code paths)
- US3 must wait for US2 completion (extends PostBattleScreen)

---

## Parallel Example: Setup Phase

```bash
# Launch all type definition tasks together:
Task: "Add PostBattleSummary type definition in src/lib/types.ts"
Task: "Add CaptureEligibility type definition in src/lib/types.ts"
Task: "Add MovePreview type definition in src/lib/types.ts"
```

## Parallel Example: User Stories 1, 2, and 4

```bash
# After Setup, these stories can be worked in parallel:
# Stream 1: User Story 1 (DC Display)
Task: "Add pendingMove state to track selected move before execution in src/app/battle/page.tsx"

# Stream 2: User Story 2 (XP Display)
Task: "Create PostBattleScreen component skeleton in src/components/PostBattleScreen.tsx"

# Stream 3: User Story 4 (Capture Restriction)
Task: "Add ownership check query in GET /api/capture route in src/app/api/capture/route.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (type definitions)
2. Complete Phase 3: User Story 1 (DC before roll)
3. Complete Phase 4: User Story 2 (XP display)
4. **STOP and VALIDATE**: Both P1 stories deliver core value
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup -> Foundation ready
2. Add User Story 1 (DC display) -> Test -> Core UX improvement
3. Add User Story 2 (XP display) -> Test -> Progression feedback
4. Add User Story 3 (Level-up) -> Test -> Enhanced reward feeling
5. Add User Story 4 (Capture restriction) -> Test -> Collection strategy
6. Polish phase -> Final validation

### Single Developer Strategy

1. Setup phase (T001-T003)
2. User Story 1 (T004-T008) - DC display
3. User Story 2 (T009-T015) - XP display
4. User Story 3 (T016-T021) - Level-up (builds on US2)
5. User Story 4 (T022-T030) - Capture restriction
6. Polish (T031-T034) - Edge cases and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US3 depends on US2 - PostBattleScreen must exist first
- US1, US2, US4 are independent and can be worked in parallel
- No automated tests - use quickstart.md checklist for manual validation
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
