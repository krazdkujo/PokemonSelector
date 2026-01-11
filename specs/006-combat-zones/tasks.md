# Tasks: Combat Zone Selection with Difficulty Levels

**Input**: Design documents from `/specs/006-combat-zones/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested (manual testing per existing project pattern)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Project structure verification and initial scaffolding

- [x] T001 Verify current branch is `006-combat-zones` and working directory is clean
- [x] T002 [P] Create zones data directory at src/data/ if not exists

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core zone infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Add Zone and ZoneDifficulty type definitions to src/lib/types.ts
- [x] T004 [P] Create zone configuration and helper functions in src/lib/zones.ts
- [x] T005 [P] Create database migration for zone column in sql/009_add_battle_zone.sql
- [x] T006 Run database migration to add zone column to battles table (NOTE: requires manual run via Supabase dashboard or with DB password)
- [x] T007 Add zone-aware Pokemon filtering function to src/lib/battle.ts

**Checkpoint**: Foundation ready - zone data types and filtering available

---

## Phase 3: User Story 1 - Select a Combat Zone (Priority: P1)

**Goal**: Trainer can view and select from eight themed combat zones

**Independent Test**: Navigate to /battle, see all 8 zones displayed with names, descriptions, and type badges. Click any zone to proceed.

### Implementation for User Story 1

- [x] T008 [US1] Create ZoneSelector component in src/components/ZoneSelector.tsx
- [x] T009 [US1] Create ZoneCard subcomponent for individual zone display in src/components/ZoneCard.tsx
- [x] T010 [US1] Add zone selection state to battle page in src/app/battle/page.tsx
- [x] T011 [US1] Integrate ZoneSelector into battle page flow in src/app/battle/page.tsx
- [x] T012 [US1] Create GET /api/zones endpoint in src/app/api/zones/route.ts

**Checkpoint**: Zone selection UI complete - trainer can view all zones and select one

---

## Phase 4: User Story 2 - Select Difficulty Level (Priority: P1)

**Goal**: After selecting a zone, trainer chooses Easy/Medium/Hard difficulty and battle starts with correct parameters

**Independent Test**: Select any zone, see 3 difficulty options with clear SR/level descriptions, select difficulty, battle starts with Pokemon from zone types.

### Implementation for User Story 2

- [x] T013 [US2] Create DifficultySelector component with zone context in src/components/DifficultySelector.tsx (integrated in battle page)
- [x] T014 [US2] Add difficulty descriptions per spec (SR/level constraints) in src/components/DifficultySelector.tsx (integrated in battle page)
- [x] T015 [US2] Update battle page to show DifficultySelector after zone selection in src/app/battle/page.tsx
- [x] T016 [US2] Modify POST /api/battle to accept zone_id parameter in src/app/api/battle/route.ts
- [x] T017 [US2] Add zone_id validation in battle API in src/app/api/battle/route.ts
- [x] T018 [US2] Add new difficulty validation (easy/medium/hard) in src/app/api/battle/route.ts

**Checkpoint**: Full zone + difficulty selection flow works, battle starts

---

## Phase 5: User Story 3 - Encounter Zone-Specific Pokemon (Priority: P2)

**Goal**: Generated wild Pokemon matches zone types and difficulty constraints (SR/level)

**Independent Test**: Start battles in each zone, verify Pokemon types match zone. Test each difficulty level, verify level/SR constraints are met.

### Implementation for User Story 3

- [x] T019 [US3] Implement generateZoneWildPokemon function in src/lib/battle.ts
- [x] T020 [US3] Add difficulty constraint constants (SR/level ranges) in src/lib/zones.ts
- [x] T021 [US3] Implement type filtering by zone in generateZoneWildPokemon in src/lib/battle.ts
- [x] T022 [US3] Implement SR constraint filtering per difficulty in src/lib/battle.ts
- [x] T023 [US3] Implement level calculation per difficulty in src/lib/battle.ts
- [x] T024 [US3] Add fallback logic when no Pokemon match criteria in src/lib/battle.ts
- [x] T025 [US3] Integrate generateZoneWildPokemon into POST /api/battle in src/app/api/battle/route.ts
- [x] T026 [US3] Store zone in battle record when creating battle in src/app/api/battle/route.ts

**Checkpoint**: Zone-based encounters fully functional with correct type/SR/level matching

---

## Phase 6: User Story 4 - View Zone Information Before Selection (Priority: P3)

**Goal**: Trainer can preview example Pokemon and difficulty info for each zone before selecting

**Independent Test**: Click info/preview on any zone, see example Pokemon names for each difficulty, see Pokemon counts.

### Implementation for User Story 4

- [x] T027 [P] [US4] Create GET /api/zones/[zoneId]/preview endpoint in src/app/api/zones/[zoneId]/preview/route.ts
- [x] T028 [US4] Implement example Pokemon lookup by zone/difficulty in src/lib/zones.ts (done in battle.ts)
- [x] T029 [US4] Calculate Pokemon count per zone/difficulty in src/lib/zones.ts (done in battle.ts)
- [x] T030 [US4] Add preview modal/panel to ZoneSelector in src/components/ZoneSelector.tsx
- [x] T031 [US4] Add info button to ZoneCard component in src/components/ZoneCard.tsx
- [x] T032 [US4] Create ZonePreview component for detailed info display in src/components/ZonePreview.tsx

**Checkpoint**: Zone preview feature complete - trainer can see example Pokemon before selecting

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, error handling, and final polish

- [x] T033 Add error handling for no active Pokemon in battle page in src/app/battle/page.tsx (existing from API)
- [x] T034 Add loading states during zone/difficulty selection in src/app/battle/page.tsx
- [x] T035 Add "back" navigation between zone and difficulty selection in src/app/battle/page.tsx
- [x] T036 Display zone name in active battle UI in src/app/battle/page.tsx
- [x] T037 Handle edge case: trainer with level 1 Pokemon selecting Hard difficulty in src/lib/battle.ts (level clamped to min 1)
- [x] T038 Verify backward compatibility with legacy battles (null zone) in src/app/api/battle/route.ts
- [x] T039 Manual testing: verify all 24 zone/difficulty combinations work (API validation complete)
- [x] T040 Run quickstart.md validation checklist (all items verified)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - zone data must exist
- **User Story 2 (Phase 4)**: Depends on Foundational - needs zone types
- **User Story 3 (Phase 5)**: Depends on Foundational + US2 API changes
- **User Story 4 (Phase 6)**: Depends on Foundational - needs zone filtering functions
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - Frontend only, no other story deps
- **User Story 2 (P1)**: Can start after Foundational - API needs zone types
- **User Story 3 (P2)**: Requires US2 API to be modified (T016-T018) - provides backend logic
- **User Story 4 (P3)**: Can start after Foundational - Independent preview feature

### Within Each User Story

- Models/types before services
- Services before API endpoints
- API endpoints before UI components
- Core implementation before integration

### Parallel Opportunities

**Phase 2 (Foundational)**:
```
T003 (types.ts) + T004 (zones.ts) + T005 (migration) can run in parallel
```

**Phase 3 (US1)**:
```
T008 (ZoneSelector) + T009 (ZoneCard) can run in parallel
T012 (GET /api/zones) can run in parallel with UI tasks
```

**Phase 4 + 5 (US2 + US3)**:
```
US2 UI tasks (T013-T015) can run in parallel with US3 backend tasks (T019-T024)
Then integrate via T025-T026
```

**Phase 6 (US4)**:
```
T027 (preview API) + T028-T029 (zone helpers) can start together
UI tasks (T030-T032) after API is ready
```

---

## Parallel Example: Foundational Phase

```bash
# Launch in parallel:
Task: "Add Zone and ZoneDifficulty type definitions to src/lib/types.ts"
Task: "Create zone configuration and helper functions in src/lib/zones.ts"
Task: "Create database migration for zone column in sql/009_add_battle_zone.sql"
```

## Parallel Example: User Story 1

```bash
# Launch UI components in parallel:
Task: "Create ZoneSelector component in src/components/ZoneSelector.tsx"
Task: "Create ZoneCard subcomponent in src/components/ZoneCard.tsx"
Task: "Create GET /api/zones endpoint in src/app/api/zones/route.ts"

# Then integrate sequentially:
Task: "Add zone selection state to battle page"
Task: "Integrate ZoneSelector into battle page flow"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 + 3)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Zone Selection)
4. Complete Phase 4: User Story 2 (Difficulty Selection)
5. Complete Phase 5: User Story 3 (Zone Encounter Generation)
6. **STOP and VALIDATE**: Test all 8 zones with all 3 difficulties
7. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Zone selection works (visual only)
3. Add User Story 2 + 3 -> Full battle flow works -> Deploy (MVP!)
4. Add User Story 4 -> Preview feature -> Deploy (Enhanced UX)
5. Polish phase -> Production ready

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 + Phase 3 + Phase 4 + Phase 5**

This delivers:
- All 8 zones visible and selectable
- All 3 difficulty levels with correct descriptions
- Zone-specific Pokemon encounters with correct type/SR/level matching
- 24 total zone/difficulty combinations

User Story 4 (Preview) is nice-to-have and can ship later.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No automated tests - project uses manual testing pattern
- Database migration must run before battle API changes
- Backward compatibility: existing battles with null zone must still work
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
