# Tasks: Expand Constitution for Pokemon Battle and Capture System

**Input**: Design documents from `/specs/005-expand-constitution/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml, quickstart.md

**Tests**: Tests NOT explicitly requested in feature specification. Test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, this is a Next.js App Router project:
- **Source**: `src/` at repository root
- **API Routes**: `src/app/api/`
- **Pages**: `src/app/`
- **Components**: `src/components/`
- **Library**: `src/lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add dependencies and configure project for expanded functionality

- [ ] T001 Install new dependencies: `npm install bcryptjs seedrandom && npm install -D @types/bcryptjs @types/seedrandom`
- [ ] T002 [P] Add new TypeScript types to src/lib/types.ts (UserSecret, PokemonOwned, WildPokemon, Battle, BattleRound, UserStats, TrainerWithData)
- [ ] T003 [P] Create type chart constants in src/lib/type-chart.ts with Gen 1 type effectiveness data

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database Migrations

- [ ] T004 Create migration 001_create_user_secrets.sql in supabase/migrations/ per data-model.md
- [ ] T005 Create migration 002_create_pokemon_owned.sql in supabase/migrations/ per data-model.md
- [ ] T006 Create migration 003_create_battles.sql in supabase/migrations/ per data-model.md
- [ ] T007 Create migration 004_create_battle_rounds.sql in supabase/migrations/ per data-model.md
- [ ] T008 Create migration 005_create_user_stats.sql in supabase/migrations/ per data-model.md
- [ ] T009 Create migration 006_migrate_starters.sql to migrate existing starters to pokemon_owned table
- [ ] T010 Run migrations: `npm run db:migrate`

### Authentication Infrastructure

- [ ] T011 Create secret key utilities in src/lib/secret-key.ts (generateSecretKey, hashKey, verifyKey functions per research.md)
- [ ] T012 Create API authentication middleware in src/middleware.ts (validate X-API-Key header, inject X-User-ID)
- [ ] T013 Create /api/secret-key/route.ts with GET (metadata) and POST (generate/regenerate) handlers per contracts/openapi.yaml

### Core Library Functions

- [ ] T014 [P] Create battle logic library in src/lib/battle.ts (createBattleRng, calculateRoundWinChance, generateWildPokemon, hasStabBonus)
- [ ] T015 [P] Create capture logic library in src/lib/capture.ts (calculateCaptureDC, attemptCapture, checkFlee)
- [ ] T016 [P] Create moves utility library in src/lib/moves.ts (getAvailableMoves with evolution inheritance)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - First-Time User Selects Starter and Reaches Dashboard (Priority: P1)

**Goal**: New user logs in, selects a starter Pokemon (SR <= 0.5), and reaches dashboard showing their Pokemon and initial resources

**Independent Test**: Create new account, select starter, verify dashboard displays chosen Pokemon with correct stats and initial money/items

### Implementation for User Story 1

- [ ] T017 [US1] Update starter selection API in src/app/api/trainer/[id]/starter/route.ts to:
  - Filter Pokemon by SR <= 0.5 from docs/pokemon-cleaned.json
  - Create entry in pokemon_owned with is_active=true, is_starter=true, level=1
  - Create user_stats entry with default money (100)
  - Remove unique pokemon_id constraint check (multiple users can select same starter)
- [ ] T018 [US1] Create /api/dashboard/route.ts with GET handler returning Dashboard schema:
  - Fetch active Pokemon from pokemon_owned
  - Fetch user_stats (money, items, battles_won, etc.)
  - Check for active battle status
  - Return trainer_name, active_pokemon, stats, has_active_battle
- [ ] T019 [US1] Create SecretKeyManager component in src/components/SecretKeyManager.tsx:
  - Display key status (has key, created_at, last_used_at)
  - Generate/regenerate button
  - Show plaintext key once on generation with copy button
- [ ] T020 [US1] Update dashboard page in src/app/dashboard/page.tsx:
  - Display active Pokemon with sprite, name, level, types, SR
  - Display money balance
  - Display items inventory
  - Display gameplay statistics (battles_won, pokemon_captured)
  - Add SecretKeyManager component
  - Add navigation links to Battle, Pokecenter
- [ ] T021 [US1] Update starter selection page in src/app/select/page.tsx:
  - Filter displayed Pokemon to SR <= 0.5 only
  - Update selection handler to use new API
  - Redirect to dashboard after selection

**Checkpoint**: User Story 1 complete - new users can select starter and view dashboard

---

## Phase 4: User Story 2 - User Initiates and Completes a Battle Encounter (Priority: P2)

**Goal**: User navigates to battle endpoint, selects difficulty, encounters wild Pokemon, completes round-based combat until victory/defeat

**Independent Test**: Start battle on Normal difficulty, complete 3-5 rounds, verify winner determined by first to 3 round wins

### Implementation for User Story 2

- [ ] T022 [US2] Create /api/battle/route.ts with:
  - GET: Return current active battle or null
  - POST: Start new battle (check no active battle, generate wild Pokemon based on difficulty, create seed)
- [ ] T023 [US2] Create /api/battle/round/route.ts with POST handler:
  - Validate active battle exists
  - Validate move_id is in player's selected_moves
  - Calculate round winner using seeded RNG (level diff, SR diff, type effectiveness, STAB)
  - Create battle_round record
  - Update battle player_wins/wild_wins
  - Check for battle end (first to 3 wins)
  - Return RoundResult and updated Battle
- [ ] T024 [US2] Create BattleArena component in src/components/BattleArena.tsx:
  - Display player Pokemon vs wild Pokemon (sprites, names, levels)
  - Show round wins for each side (0-3)
  - Display available moves as action buttons
  - Show round results with winner, roll, bonuses
- [ ] T025 [US2] Create battle page in src/app/battle/page.tsx:
  - Show difficulty selection if no active battle
  - Show BattleArena if battle active
  - Handle round execution via API
  - Show battle end result with options (return to dashboard, capture attempt)
- [ ] T026 [US2] Add battle status indicator to dashboard in src/app/dashboard/page.tsx:
  - Show "Battle in Progress" if has_active_battle
  - Link to continue battle

**Checkpoint**: User Story 2 complete - users can battle wild Pokemon

---

## Phase 5: User Story 3 - User Attempts to Capture a Wild Pokemon (Priority: P3)

**Goal**: During battle, after winning rounds, user attempts capture using DC-based system. Success adds Pokemon to collection.

**Independent Test**: Win rounds in battle, attempt capture, verify DC calculation (base 15, adjustments for level/SR, -3 per round won)

### Implementation for User Story 3

- [ ] T027 [US3] Create /api/capture/route.ts with POST handler:
  - Validate active battle exists
  - Validate player has at least 1 round win
  - Calculate capture DC using capture.ts library
  - Roll d20 using seeded RNG
  - On success: create pokemon_owned entry, update battle status to 'captured', update user_stats
  - On failure: increment wild_wins, check flee (25% chance), update battle status if fled
  - Return CaptureResult with success, roll, dc, fled, and captured_pokemon if successful
- [ ] T028 [US3] Create CaptureAttempt component in src/components/CaptureAttempt.tsx:
  - Display current capture DC
  - "Attempt Capture" button
  - Show result: success animation or failure with flee status
- [ ] T029 [US3] Integrate CaptureAttempt into battle page src/app/battle/page.tsx:
  - Show CaptureAttempt component when player_wins >= 1
  - Handle capture API response
  - Update battle state on success/failure
  - Navigate to dashboard on capture success

**Checkpoint**: User Story 3 complete - users can capture wild Pokemon

---

## Phase 6: User Story 4 - User Manages Pokemon at Pokecenter (Priority: P4)

**Goal**: User with multiple Pokemon visits Pokecenter to swap active Pokemon

**Independent Test**: Have 2+ Pokemon, visit Pokecenter, swap active Pokemon, verify dashboard shows new active

### Implementation for User Story 4

- [ ] T030 [US4] Create /api/pokecenter/route.ts with GET handler:
  - Return all pokemon_owned for user
  - Include active_pokemon_id
  - Enrich with Pokemon data from JSON (name, types, sprite)
- [ ] T031 [US4] Create /api/pokecenter/swap/route.ts with POST handler:
  - Validate pokemon_id belongs to user
  - Check no active battle (prevent swap during battle)
  - Update is_active flags (set old to false, new to true)
  - Return new active_pokemon
- [ ] T032 [US4] Create PokemonCollection component in src/components/PokemonCollection.tsx:
  - Display all owned Pokemon as cards
  - Highlight currently active Pokemon
  - "Set Active" button on non-active Pokemon
  - Show Pokemon stats (level, types, SR, is_starter badge)
- [ ] T033 [US4] Create Pokecenter page in src/app/pokecenter/page.tsx:
  - Display PokemonCollection
  - Handle swap via API
  - Show success/error feedback
  - Link back to dashboard
- [ ] T034 [US4] Add Pokecenter navigation to dashboard in src/app/dashboard/page.tsx:
  - Add "Pokecenter" link/button
  - Show Pokemon count badge

**Checkpoint**: User Story 4 complete - users can manage Pokemon collection

---

## Phase 7: User Story 5 - User Interacts via External API with Secret Key (Priority: P5)

**Goal**: User retrieves secret key from dashboard and uses it to interact with gameplay endpoints programmatically

**Independent Test**: Generate secret key, make authenticated API request with X-API-Key header, verify JSON response

### Implementation for User Story 5

- [ ] T035 [US5] Update existing external trainer API in src/app/api/external/trainer/route.ts:
  - Require X-API-Key header authentication
  - Use middleware-injected X-User-ID
  - Return trainer data with active Pokemon
- [ ] T036 [US5] Create /api/trainer/route.ts with GET handler:
  - Return authenticated user's trainer profile
  - Include id, name, role, created_at
- [ ] T037 [US5] Create /api/starter/route.ts with:
  - GET: Return available starters (SR <= 0.5)
  - POST: Select starter (validate no existing starter, create pokemon_owned)
- [ ] T038 [US5] Copy OpenAPI spec to docs/api/openapi.yaml for API documentation
- [ ] T039 [US5] Add API documentation link to dashboard page in src/app/dashboard/page.tsx

**Checkpoint**: User Story 5 complete - users can interact via external API

---

## Phase 8: User Story 6 - User Configures Pokemon Moves (Priority: P6)

**Goal**: User selects four moves from active Pokemon's available moveset

**Independent Test**: View available moves, select 4, save, verify selected moves used in battles

### Implementation for User Story 6

- [ ] T040 [US6] Create /api/moves/route.ts with:
  - GET: Return available moves for active Pokemon (using moves.ts library) and current selected_moves
  - PUT: Update selected_moves (validate exactly 4, validate moves available to Pokemon)
- [ ] T041 [US6] Create MoveSelector component in src/components/MoveSelector.tsx:
  - Display all available moves with type and description
  - Allow selection of exactly 4 moves
  - Highlight currently selected moves
  - Save button
- [ ] T042 [US6] Add MoveSelector to Pokecenter page in src/app/pokecenter/page.tsx:
  - Show moves for active Pokemon
  - Handle move selection via API
- [ ] T043 [US6] Update BattleArena component in src/components/BattleArena.tsx:
  - Only show selected_moves as action buttons (not all available)
  - Validate move selection before round execution

**Checkpoint**: User Story 6 complete - users can configure Pokemon moves

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T044 [P] Add error handling to all API routes with consistent Error schema response
- [ ] T045 [P] Add loading states to all page components
- [ ] T046 Update constitution.md with amendments documented in plan.md (Principles I, II, V, and new VI-IX)
- [ ] T047 [P] Add form validation to all input components
- [ ] T048 Run lint and fix issues: `npm run lint`
- [ ] T049 Verify all acceptance scenarios from spec.md work end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3 -> P4 -> P5 -> P6)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Requires US1 for active Pokemon
- **User Story 3 (P3)**: Requires US2 (battle system) - Extends battle with capture
- **User Story 4 (P4)**: Can start after Foundational - Requires US1 or US3 for multiple Pokemon
- **User Story 5 (P5)**: Can start after Foundational - Benefits from US1-4 for full API coverage
- **User Story 6 (P6)**: Requires US1 for Pokemon - Integrates with US2 for battle usage

### Within Each User Story

- Models/types before services
- Library functions before API routes
- API routes before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- T002 and T003 (types and type-chart) are independent
- T014, T015, T016 (battle, capture, moves libs) are independent
- Different user stories can be worked on in parallel by different team members after Foundational completes

---

## Parallel Example: Foundational Phase

```bash
# After migrations complete, launch library tasks together:
Task: "Create battle logic library in src/lib/battle.ts" [T014]
Task: "Create capture logic library in src/lib/capture.ts" [T015]
Task: "Create moves utility library in src/lib/moves.ts" [T016]
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test starter selection and dashboard independently
5. Deploy/demo if ready

### Recommended Order

1. Setup + Foundational -> Foundation ready
2. User Story 1 (starter + dashboard) -> MVP!
3. User Story 2 (battle system) -> Core gameplay
4. User Story 3 (capture) -> Pokemon collection
5. User Story 4 (pokecenter) -> Pokemon management
6. User Story 5 (API access) -> Automation support
7. User Story 6 (moves) -> Strategic depth
8. Polish -> Production ready

### Parallel Team Strategy

With multiple developers after Foundational phase:

- Developer A: User Story 1 -> User Story 4
- Developer B: User Story 2 -> User Story 3
- Developer C: User Story 5 -> User Story 6

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Summary

| Phase | Tasks | Description |
|-------|-------|-------------|
| Setup | 3 | Dependencies, types, constants |
| Foundational | 13 | Migrations, auth, core libraries |
| US1 (P1) | 5 | Starter selection, dashboard |
| US2 (P2) | 5 | Battle system |
| US3 (P3) | 3 | Capture system |
| US4 (P4) | 5 | Pokecenter |
| US5 (P5) | 5 | External API |
| US6 (P6) | 4 | Moves configuration |
| Polish | 6 | Error handling, validation, constitution |
| **Total** | **49** | |
