# Tasks: Pokemon Evolution System

**Input**: Design documents from `/specs/012-pokemon-evolution/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/evolution-api.md, quickstart.md

**Tests**: Not explicitly requested - manual testing specified in plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database schema and type definitions needed by all user stories

- [ ] T001 Add `can_evolve` boolean column to `pokemon_owned` table via Supabase migration
- [ ] T002 [P] Add EvolutionInfo interface to src/lib/types.ts
- [ ] T003 [P] Add EvolutionResult interface to src/lib/types.ts
- [ ] T004 [P] Extend ExperienceGained with evolution_available and evolution_details fields in src/lib/types.ts

**Checkpoint**: Schema ready, types defined - foundation can proceed

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core evolution logic library that all user stories depend on

- [ ] T005 Create src/lib/evolution.ts with parseEvolutionStage function
- [ ] T006 Add getEvolutionThreshold function to src/lib/evolution.ts (Level 5 for 2-stage, Levels 3/6 for 3-stage)
- [ ] T007 Add getNextEvolution function to src/lib/evolution.ts
- [ ] T008 Add checkEvolutionEligibility function to src/lib/evolution.ts
- [ ] T009 Add performEvolution function to src/lib/evolution.ts (updates pokemon_id, clears can_evolve)

**Checkpoint**: Evolution library ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Evolve Pokemon After Battle Victory (Priority: P1)

**Goal**: Show evolution prompt at battle end when Pokemon levels up to evolution threshold

**Independent Test**: Win a battle with a level 2 Pokemon (3-stage), gain XP to level 3, verify evolution prompt appears

### Implementation for User Story 1

- [ ] T010 [US1] Create src/components/EvolutionModal.tsx with before/after sprites and Evolve/Later buttons
- [ ] T011 [US1] Create POST /api/pokecenter/evolve endpoint in src/app/api/pokecenter/evolve/route.ts
- [ ] T012 [US1] Modify src/app/api/battle/round/route.ts to check evolution eligibility after XP update
- [ ] T013 [US1] Modify src/app/api/battle/round/route.ts to set can_evolve=true when threshold reached
- [ ] T014 [US1] Add evolution_available and evolution_details to battle round response in src/app/api/battle/round/route.ts
- [ ] T015 [US1] Modify src/app/api/capture/route.ts to check evolution eligibility after capture XP
- [ ] T016 [US1] Add evolution_available and evolution_details to capture response in src/app/api/capture/route.ts
- [ ] T017 [US1] Modify src/app/battle/page.tsx to show EvolutionModal when evolution_available is true
- [ ] T018 [US1] Handle "Evolve" button click in battle page - call API and update state
- [ ] T019 [US1] Handle "Later" button click in battle page - dismiss modal and continue

**Checkpoint**: After battle evolution prompt fully functional. Test by winning a battle and leveling to threshold.

---

## Phase 4: User Story 2 - Evolve Pokemon from Pokecenter (Priority: P2)

**Goal**: Show "Evolve" button for eligible Pokemon in Pokecenter

**Independent Test**: Have a Pokemon at level 3+ (3-stage) that hasn't evolved, visit Pokecenter, verify Evolve button appears

### Implementation for User Story 2

- [ ] T020 [US2] Modify src/app/api/pokecenter/route.ts to include can_evolve field in response
- [ ] T021 [US2] Add getEvolutionInfo helper to enrich Pokemon response in src/app/api/pokecenter/route.ts
- [ ] T022 [US2] Modify src/app/pokecenter/page.tsx to show "Evolve" button when can_evolve is true
- [ ] T023 [US2] Add click handler for Evolve button to show EvolutionModal in src/app/pokecenter/page.tsx
- [ ] T024 [US2] Handle evolution completion - call API and refresh Pokemon list in src/app/pokecenter/page.tsx
- [ ] T025 [US2] Hide Evolve button for final-stage Pokemon in src/app/pokecenter/page.tsx

**Checkpoint**: Pokecenter evolution fully functional. Test by visiting Pokecenter with eligible Pokemon.

---

## Phase 5: User Story 3 - View Evolution Requirements (Priority: P3)

**Goal**: Display evolution level requirements in Pokemon details

**Independent Test**: View a Stage 1 of 3 Pokemon and verify "Evolves at level 3" is displayed

### Implementation for User Story 3

- [ ] T026 [US3] Add evolution_info to PokemonOwnedWithDetails in src/app/api/pokecenter/route.ts
- [ ] T027 [US3] Display "Evolves at level X" text in src/app/pokecenter/page.tsx for eligible Pokemon
- [ ] T028 [US3] Display "Final evolution" text for Stage 3 of 3 Pokemon in src/app/pokecenter/page.tsx
- [ ] T029 [US3] Display next evolution name and sprite preview in Pokemon card in src/app/pokecenter/page.tsx

**Checkpoint**: Evolution info display complete. Test by viewing Pokemon details.

---

## Phase 6: Polish & Verification

**Purpose**: Final testing and cleanup

- [ ] T030 Start dev server with npm run dev and test full evolution flow
- [ ] T031 Verify moves are preserved after evolution
- [ ] T032 Verify can_evolve persists when evolution is deferred
- [ ] T033 Verify final-stage Pokemon cannot evolve
- [ ] T034 Run quickstart.md testing checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on T002-T004 (types) being complete
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion (evolution library)
- **User Story 2 (Phase 4)**: Depends on Phase 2 + T011 (evolve endpoint from US1)
- **User Story 3 (Phase 5)**: Depends on Phase 2 only (uses evolution library)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Requires evolution library + creates evolve endpoint (reused by US2)
- **User Story 2 (P2)**: Reuses evolve endpoint from US1, can run in parallel with US3
- **User Story 3 (P3)**: No cross-story dependencies, can run in parallel with US2

### Parallel Opportunities

- T002, T003, T004 can run in parallel (different sections of types.ts)
- T020-T025 (US2) and T026-T029 (US3) can run in parallel after US1 completes T011

---

## Parallel Example: Setup Phase

```bash
# Launch all type additions together:
Task: "Add EvolutionInfo interface to src/lib/types.ts"
Task: "Add EvolutionResult interface to src/lib/types.ts"
Task: "Extend ExperienceGained with evolution fields in src/lib/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (database + types)
2. Complete Phase 2: Foundational (evolution library)
3. Complete Phase 3: User Story 1 (post-battle evolution)
4. **STOP and VALIDATE**: Test evolution after battle
5. Deploy if ready - trainers can evolve immediately after battle

### Full Implementation

1. Complete Setup + Foundational
2. Complete User Story 1 (post-battle) -> Test -> Deploy
3. Complete User Story 2 (Pokecenter) -> Test -> Deploy
4. Complete User Story 3 (info display) -> Test -> Deploy
5. Polish phase for final cleanup

### Estimated Effort

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 5 tasks
- **Phase 3 (US1 - Post-Battle)**: 10 tasks
- **Phase 4 (US2 - Pokecenter)**: 6 tasks
- **Phase 5 (US3 - Info Display)**: 4 tasks
- **Phase 6 (Polish)**: 5 tasks
- **Total**: 34 tasks

---

## Notes

- US1 creates the core evolve endpoint that US2 reuses
- Evolution library functions are shared across all stories
- EvolutionModal component is reused in both battle and Pokecenter pages
- Existing move inheritance system handles new moves automatically after evolution
