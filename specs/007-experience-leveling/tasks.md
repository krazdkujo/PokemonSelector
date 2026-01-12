# Tasks: Experience and Leveling System

**Input**: Design documents from `/specs/007-experience-leveling/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated tests requested. Manual browser testing per quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema changes and shared type definitions

- [x] T001 Create database migration to add experience column in sql/010_add_experience.sql
- [ ] T002 Run migration with `npm run db:migrate` to apply schema changes (REQUIRES DB CREDENTIALS)
- [x] T003 [P] Add experience field to PokemonOwned interface in src/lib/types.ts
- [x] T004 [P] Add ExperienceInfo interface to src/lib/types.ts
- [x] T005 [P] Add experience_to_next field to PokemonOwnedWithDetails interface in src/lib/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core experience calculation utilities that ALL user stories depend on

**CRITICAL**: US1/US2 depend on this phase being complete

- [x] T006 Create src/lib/experience.ts with calculateExperienceGained function
- [x] T007 Add calculateExperienceThreshold function to src/lib/experience.ts
- [x] T008 Add applyExperience function with multi-level-up support in src/lib/experience.ts
- [x] T009 Add LevelUpResult interface export from src/lib/experience.ts

**Checkpoint**: Experience calculation utilities ready - user story implementation can begin

---

## Phase 3: User Story 1+2 - Experience Gain and Leveling Up (Priority: P1)

**Goal**: Pokemon gain XP from battle victories and level up when threshold is met

**Independent Test**: Win a battle, verify XP increases. Accumulate enough XP to verify level-up occurs.

**Note**: US1 and US2 are combined because experience gain immediately triggers level-up check - they are inseparable.

### Implementation for User Story 1+2

- [x] T010 [US1] Import experience utilities in src/app/api/battle/round/route.ts
- [x] T011 [US1] Add XP calculation when newStatus === 'player_won' in src/app/api/battle/round/route.ts
- [x] T012 [US2] Call applyExperience to handle level-up logic in src/app/api/battle/round/route.ts
- [x] T013 [US1] Update pokemon_owned record with new experience and level in src/app/api/battle/round/route.ts
- [x] T014 [US1] Add experience_gained object to API response in src/app/api/battle/round/route.ts
- [x] T015 [P] [US1] Add ExperienceGained type to src/lib/types.ts for API response typing

**Checkpoint**: Winning battles now grants XP and triggers level-ups. Test by completing battles.

---

## Phase 4: User Story 3 - Viewing Experience Progress (Priority: P2)

**Goal**: Players can see current XP and XP needed for next level

**Independent Test**: View dashboard/pokecenter and verify XP progress displays correctly

### Implementation for User Story 3

- [x] T016 [P] [US3] Update src/app/api/dashboard/route.ts to include experience in response
- [x] T017 [P] [US3] Update src/app/api/pokecenter/route.ts to include experience in response
- [x] T018 [US3] Add XP progress display to PokemonCollection component in src/components/PokemonCollection.tsx
- [x] T019 [US3] Handle max level (level 10) display case showing "MAX" in src/components/PokemonCollection.tsx
- [x] T020 [P] [US3] Add getExperienceRequired helper function to src/lib/experience.ts
- [x] T021 [P] [US3] Add formatExperienceDisplay helper function to src/lib/experience.ts

**Checkpoint**: XP progress is visible in dashboard and pokecenter views

---

## Phase 5: User Story 4 - All Moves Available in Move Selector (Priority: P2)

**Goal**: Move selector shows ALL learnable moves regardless of Pokemon level

**Independent Test**: Open move selector for any Pokemon, verify all moves are shown regardless of level

### Implementation for User Story 4

- [x] T022 [US4] Modify getAvailableMoves function to return ALL moves in src/lib/moves.ts
- [x] T023 [US4] Remove LEVEL_TO_MOVE_TIER filtering logic from collectMoveIds in src/lib/moves.ts
- [x] T024 [US4] Update validateSelectedMoves to use full move pool in src/lib/moves.ts
- [x] T025 [US4] Verify GET /api/moves returns all moves (uses updated lib) - no route changes needed

**Checkpoint**: Move selector displays all available moves. Players can select any 4 moves.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration and validation

- [x] T026 Verify battle round API response matches contract in specs/007-experience-leveling/contracts/battle-round-response.md
- [x] T027 Verify moves API response matches contract in specs/007-experience-leveling/contracts/moves-response.md
- [ ] T028 Run through all quickstart.md test scenarios manually
- [x] T029 Verify level 10 Pokemon cannot exceed max level after XP gain
- [x] T030 Verify multi-level-up scenario works correctly (large XP gain)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup) ─────────────────────────────────────────┐
                                                          │
Phase 2 (Foundational) ──────────────────────────────────┤
         │                                                │
         ├───> Phase 3 (US1+2: XP Gain & Level Up) ──────┤
         │                                                │
         ├───> Phase 4 (US3: View XP Progress) ──────────┤
         │                                                │
         └───> Phase 5 (US4: Move Selector Fix) ─────────┤
                                                          │
                                               Phase 6 (Polish)
```

### User Story Dependencies

- **US1+2 (P1)**: Depends on Phase 2 (experience.ts utilities)
- **US3 (P2)**: Depends on Phase 2 AND T003-T005 (type definitions)
- **US4 (P2)**: No dependencies on other user stories - can start after Phase 1

### Within Each Phase

- Setup: T001 -> T002 (migration must exist before running)
- Setup: T003, T004, T005 are parallel [P]
- Foundational: T006 -> T007 -> T008 -> T009 (sequential, building on each other)
- US1+2: T010 -> T011 -> T012 -> T013 -> T014 (sequential API changes)
- US3: T016, T017, T020, T021 are parallel [P]; T018 -> T019 sequential
- US4: T022 -> T023 -> T024 -> T025 (sequential lib changes)

### Parallel Opportunities

```
After Phase 2 completes, these can run in parallel:
- Phase 3 (US1+2): Battle API changes
- Phase 4 (US3): UI display changes
- Phase 5 (US4): Move selector changes

Within Phase 1:
- T003, T004, T005 can run in parallel (different interfaces in types.ts)

Within Phase 4:
- T016, T017 can run in parallel (different API routes)
- T020, T021 can run in parallel (independent helper functions)
```

---

## Parallel Example: User Story 3

```bash
# After Phase 2 completes, launch these in parallel:
Task: "Update src/app/api/dashboard/route.ts to include experience in response"
Task: "Update src/app/api/pokecenter/route.ts to include experience in response"
Task: "Add getExperienceRequired helper function to src/lib/experience.ts"
Task: "Add formatExperienceDisplay helper function to src/lib/experience.ts"

# Then sequentially:
Task: "Add XP progress display to PokemonCard component"
Task: "Handle max level display case"
```

---

## Implementation Strategy

### MVP First (User Stories 1+2 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T009)
3. Complete Phase 3: US1+2 Experience & Leveling (T010-T015)
4. **STOP and VALIDATE**: Win battles, verify XP gain and level-up
5. Can deploy with core progression system working

### Incremental Delivery

1. Phase 1+2 -> Foundation ready
2. Add US1+2 -> Test XP/leveling -> Deploy (MVP - progression works!)
3. Add US3 -> Test XP display -> Deploy (better UX)
4. Add US4 -> Test move selector -> Deploy (complete feature)
5. Polish -> Final validation -> Deploy

### Full Parallel Strategy

With multiple developers after Phase 2:
- Developer A: Phase 3 (US1+2 - battle API)
- Developer B: Phase 4 (US3 - UI display)
- Developer C: Phase 5 (US4 - move selector)

---

## Notes

- No automated tests - use manual browser testing per quickstart.md
- US1 and US2 are combined due to tight coupling (XP gain triggers level-up)
- US4 (move selector fix) is completely independent of XP system
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All API changes preserve existing response structure (additive only)
