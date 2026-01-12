# Tasks: Dark Mode Toggle

**Input**: Design documents from `/specs/014-dark-mode/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not requested - manual testing per quickstart.md checklist

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## User Stories Summary

| Story | Priority | Title | Goal |
|-------|----------|-------|------|
| US1 | P1 | Manual Theme Toggle | User can click toggle to switch between light and dark themes |
| US2 | P2 | Theme Preference Persistence | Theme choice persists across browser sessions |
| US3 | P3 | System Preference Detection | Auto-detect OS dark mode for first-time visitors |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Enable Tailwind dark mode and create base theme utilities

- [ ] T001 Enable dark mode class strategy in tailwind.config.ts
- [ ] T002 Create theme utility functions in src/lib/theme.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core theme infrastructure that ALL user stories depend on

- [ ] T003 Create ThemeProvider context component in src/components/ThemeProvider.tsx
- [ ] T004 Create ThemeToggle button component in src/components/ThemeToggle.tsx
- [ ] T005 Add dark mode CSS variables to src/app/globals.css
- [ ] T006 Update button utility classes (.btn-primary, .btn-secondary) with dark variants in src/app/globals.css
- [ ] T007 Update error-message and loading-spinner utility classes with dark variants in src/app/globals.css

**Checkpoint**: Foundation ready - theme infrastructure in place, user story implementation can begin

---

## Phase 3: User Story 1 - Manual Theme Toggle (Priority: P1)

**Goal**: User can click a visible toggle button on any page to immediately switch between light and dark themes

**Independent Test**: Click the theme toggle on any page and verify the entire UI switches between light and dark color schemes

### Core Implementation

- [ ] T008 [US1] Update root layout with ThemeProvider, ThemeToggle, and dark body classes in src/app/layout.tsx
- [ ] T009 [US1] Add dark mode styles to PokemonCard component in src/components/PokemonCard.tsx
- [ ] T010 [US1] Add dark mode styles to TrainerInfo component in src/components/TrainerInfo.tsx
- [ ] T011 [P] [US1] Add dark mode styles to NameEntryForm component in src/components/NameEntryForm.tsx
- [ ] T012 [P] [US1] Add dark mode styles to TypeFilter component in src/components/TypeFilter.tsx
- [ ] T013 [P] [US1] Add dark mode styles to PokemonGrid component in src/components/PokemonGrid.tsx

### Page-Level Updates

- [ ] T014 [P] [US1] Add dark mode styles to home page in src/app/page.tsx
- [ ] T015 [P] [US1] Add dark mode styles to dashboard page in src/app/dashboard/page.tsx
- [ ] T016 [P] [US1] Add dark mode styles to select page in src/app/select/page.tsx
- [ ] T017 [P] [US1] Add dark mode styles to battle page in src/app/battle/page.tsx
- [ ] T018 [P] [US1] Add dark mode styles to pokecenter page in src/app/pokecenter/page.tsx
- [ ] T019 [P] [US1] Add dark mode styles to pokedex page in src/app/pokedex/page.tsx
- [ ] T020 [P] [US1] Add dark mode styles to admin page in src/app/admin/page.tsx
- [ ] T021 [P] [US1] Add dark mode styles to api-docs page in src/app/api-docs/page.tsx
- [ ] T022 [P] [US1] Add dark mode styles to PIN pages in src/app/pin/create/page.tsx and src/app/pin/verify/page.tsx

### Remaining Components

- [ ] T023 [P] [US1] Add dark mode styles to MoveSelector component in src/components/MoveSelector.tsx
- [ ] T024 [P] [US1] Add dark mode styles to ZoneCard component in src/components/ZoneCard.tsx
- [ ] T025 [P] [US1] Add dark mode styles to ZoneSelector component in src/components/ZoneSelector.tsx
- [ ] T026 [P] [US1] Add dark mode styles to ConfirmationModal component in src/components/ConfirmationModal.tsx
- [ ] T027 [P] [US1] Add dark mode styles to NicknameEditor component in src/components/NicknameEditor.tsx
- [ ] T028 [P] [US1] Add dark mode styles to StarterDisplay component in src/components/StarterDisplay.tsx
- [ ] T029 [P] [US1] Add dark mode styles to BattleArena component in src/components/BattleArena.tsx
- [ ] T030 [P] [US1] Add dark mode styles to CaptureAttempt component in src/components/CaptureAttempt.tsx
- [ ] T031 [P] [US1] Add dark mode styles to EvolutionModal component in src/components/EvolutionModal.tsx
- [ ] T032 [P] [US1] Add dark mode styles to PokemonCollection component in src/components/PokemonCollection.tsx
- [ ] T033 [P] [US1] Add dark mode styles to PokemonSearch component in src/components/PokemonSearch.tsx
- [ ] T034 [P] [US1] Add dark mode styles to PostBattleScreen component in src/components/PostBattleScreen.tsx
- [ ] T035 [P] [US1] Add dark mode styles to SecretKeyManager component in src/components/SecretKeyManager.tsx
- [ ] T036 [P] [US1] Add dark mode styles to ZonePreview component in src/components/ZonePreview.tsx
- [ ] T037 [P] [US1] Add dark mode styles to PinCreateForm component in src/components/PinCreateForm.tsx
- [ ] T038 [P] [US1] Add dark mode styles to PinGuard component in src/components/PinGuard.tsx
- [ ] T039 [P] [US1] Add dark mode styles to TrainerList component in src/components/TrainerList.tsx
- [ ] T040 [P] [US1] Add dark mode styles to PinInput component in src/components/PinInput.tsx
- [ ] T041 [P] [US1] Add dark mode styles to AdminPinManager component in src/components/AdminPinManager.tsx

**Checkpoint**: User Story 1 complete - theme toggle works, all components display correctly in both themes

---

## Phase 4: User Story 2 - Theme Preference Persistence (Priority: P2)

**Goal**: User's theme choice persists in localStorage and is applied on subsequent visits

**Independent Test**: Select dark mode, close browser, reopen site - dark mode should be active immediately

### Implementation

- [ ] T042 [US2] Add localStorage read/write to ThemeProvider in src/components/ThemeProvider.tsx
- [ ] T043 [US2] Verify theme persists across page navigation (test all routes)
- [ ] T044 [US2] Add fallback handling for localStorage unavailability in src/lib/theme.ts

**Checkpoint**: User Story 2 complete - theme preference persists across sessions

---

## Phase 5: User Story 3 - System Preference Detection (Priority: P3)

**Goal**: First-time visitors with OS dark mode enabled see dark theme automatically

**Independent Test**: Clear site data, set OS to dark mode, visit site - dark mode should be applied

### Implementation

- [ ] T045 [US3] Add FOUC prevention inline script to html head in src/app/layout.tsx
- [ ] T046 [US3] Implement system preference detection in src/lib/theme.ts (getSystemTheme function)
- [ ] T047 [US3] Update ThemeProvider to use system preference as fallback when no stored preference exists in src/components/ThemeProvider.tsx
- [ ] T048 [US3] Add suppressHydrationWarning to html element in src/app/layout.tsx

**Checkpoint**: User Story 3 complete - system preference detected for new visitors, no FOUC

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and edge case handling

- [ ] T049 Verify Pokemon type badge colors are readable in dark mode in src/app/globals.css
- [ ] T050 Verify WCAG AA contrast (4.5:1 ratio) for all text in both themes
- [ ] T051 Verify keyboard accessibility of theme toggle button
- [ ] T052 Run quickstart.md testing checklist and fix any issues
- [ ] T053 Test edge case: localStorage unavailable (private browsing)
- [ ] T054 Test edge case: JavaScript disabled (should default to light theme)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational
- **User Story 2 (Phase 4)**: Depends on User Story 1 (extends ThemeProvider)
- **User Story 3 (Phase 5)**: Depends on User Story 2 (extends theme detection)
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

```
Setup → Foundational → US1 → US2 → US3 → Polish
         (blocks)       ↓
                   All components
                   get dark mode
```

Note: US2 and US3 build on US1's infrastructure rather than being fully independent. This is because:
- US1 establishes the ThemeProvider and toggle
- US2 adds persistence to that provider
- US3 adds system detection to the persistence logic

### Within User Story 1

- T008 (layout update) must complete first - provides ThemeProvider wrapper
- All component updates (T009-T041) can run in parallel after T008
- Page updates (T014-T022) can run in parallel with component updates

### Parallel Opportunities

```bash
# After T008 completes, launch all component updates in parallel:
T009-T013: Core components (5 tasks)
T014-T022: Page updates (9 tasks)
T023-T041: Remaining components (19 tasks)

# Total: 33 parallelizable tasks in User Story 1
```

---

## Parallel Example: User Story 1 Components

```bash
# Launch all page updates together:
Task: "Add dark mode styles to home page in src/app/page.tsx"
Task: "Add dark mode styles to dashboard page in src/app/dashboard/page.tsx"
Task: "Add dark mode styles to select page in src/app/select/page.tsx"
Task: "Add dark mode styles to battle page in src/app/battle/page.tsx"
# ... (9 page tasks total)

# Launch all component updates together:
Task: "Add dark mode styles to PokemonCard in src/components/PokemonCard.tsx"
Task: "Add dark mode styles to TrainerInfo in src/components/TrainerInfo.tsx"
# ... (24 component tasks total)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (2 tasks)
2. Complete Phase 2: Foundational (5 tasks)
3. Complete Phase 3: User Story 1 (34 tasks)
4. **STOP and VALIDATE**: Click toggle, verify all pages switch themes
5. Deploy - users can manually toggle dark mode

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 = Working toggle (41 tasks)
2. **+Persistence**: Add US2 = Preference saved (3 tasks)
3. **+Auto-detect**: Add US3 = System preference detection (4 tasks)
4. **+Polish**: Verification and edge cases (6 tasks)

### Single Developer Workflow

Since US2 and US3 depend on previous stories:
1. Complete phases sequentially: 1 → 2 → 3 → 4 → 5 → 6
2. Within Phase 3 (US1), maximize parallel component updates
3. Test after each phase checkpoint

---

## Task Count Summary

| Phase | Task Count | Parallelizable |
|-------|------------|----------------|
| Phase 1: Setup | 2 | 0 |
| Phase 2: Foundational | 5 | 0 |
| Phase 3: User Story 1 | 34 | 33 |
| Phase 4: User Story 2 | 3 | 0 |
| Phase 5: User Story 3 | 4 | 0 |
| Phase 6: Polish | 6 | 0 |
| **Total** | **54** | **33** |

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks
- [Story] label maps task to specific user story for traceability
- Most work is in US1 (component updates) - highly parallelizable
- US2 and US3 are quick extensions to the infrastructure
- Manual testing per quickstart.md checklist - no automated tests requested
- Dark mode styles follow pattern: add `dark:` variants to existing Tailwind classes
- Commit after each completed component or logical group
