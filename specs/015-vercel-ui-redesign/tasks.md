# Tasks: Vercel-Inspired UI Redesign

**Input**: Design documents from `/specs/015-vercel-ui-redesign/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No automated tests requested. This is a visual redesign verified through manual testing and accessibility audits.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

This is a Next.js web application with paths at repository root:
- `src/app/` - Pages and layouts
- `src/components/` - React components
- `src/lib/` - Utilities
- `tailwind.config.ts` - Tailwind configuration

---

## Phase 1: Setup (Design System Foundation)

**Purpose**: Establish the core design tokens and typography that all other changes depend on

- [x] T001 [P] Download and configure Geist fonts via next/font in src/app/layout.tsx
- [x] T002 [P] Define CSS custom properties for design tokens (colors, spacing, borders, shadows) in src/app/globals.css
- [x] T003 Extend Tailwind config with design token references in tailwind.config.ts (depends on T002)
- [x] T004 [P] Define base component classes (btn, btn-primary, btn-secondary, btn-ghost, card, card-interactive, input) via @apply in src/app/globals.css
- [x] T005 [P] Update Pokemon type color classes to use refined dark/light values in src/app/globals.css
- [x] T006 Update body and root element styling to use new tokens in src/app/layout.tsx (depends on T001, T003)

**Checkpoint**: Design system foundation ready - all design tokens, fonts, and base classes available

---

## Phase 2: Foundational Components

**Purpose**: Update core shared components that are used across multiple pages

**CRITICAL**: These components must be updated before page-level changes to ensure consistency

- [ ] T007 Update ThemeProvider to use new theme class names (.light instead of .dark override) in src/components/ThemeProvider.tsx
- [ ] T008 Update ThemeToggle styling to match Vercel aesthetic (ghost button style, refined icon) in src/components/ThemeToggle.tsx
- [ ] T009 Update NameEntryForm with new input and button classes in src/components/NameEntryForm.tsx
- [ ] T010 [P] Update PokemonCard with card-interactive class, refined type badges, and hover effects in src/components/PokemonCard.tsx
- [ ] T011 [P] Update ConfirmationModal with new card styling, backdrop, and button variants in src/components/ConfirmationModal.tsx
- [ ] T012 [P] Update EvolutionModal with new modal styling in src/components/EvolutionModal.tsx
- [ ] T013 [P] Update PinInput with new input styling in src/components/PinInput.tsx

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Visual Identity Transformation (Priority: P1) MVP

**Goal**: Users see a dark-first design with modern typography and consistent visual language on all pages

**Independent Test**: Visit the home page and verify dark theme, Geist typography, spacing, and overall techy aesthetic are present and cohesive

### Implementation for User Story 1

- [ ] T014 [US1] Update home page (src/app/page.tsx) with new background, typography, and card styling
- [ ] T015 [US1] Update dashboard page (src/app/dashboard/page.tsx) with new layout, cards, and text styles
- [ ] T016 [US1] Update select page (src/app/select/page.tsx) with new card grid and button styling
- [ ] T017 [P] [US1] Update pokedex page (src/app/pokedex/page.tsx) with new grid layout and card styling
- [ ] T018 [P] [US1] Update pokecenter page (src/app/pokecenter/page.tsx) with new layout and component styling
- [ ] T019 [P] [US1] Update admin page (src/app/admin/page.tsx) with new dashboard styling
- [ ] T020 [P] [US1] Update api-docs page (src/app/api-docs/page.tsx) with new typography and code styling
- [ ] T021 [P] [US1] Update pin/create page (src/app/pin/create/page.tsx) with new form styling
- [ ] T022 [P] [US1] Update pin/verify page (src/app/pin/verify/page.tsx) with new form styling

**Checkpoint**: All pages display the new visual identity - dark-first theme, modern typography, consistent spacing

---

## Phase 4: User Story 2 - Interactive Element Refinement (Priority: P2)

**Goal**: Buttons, inputs, and cards have subtle animations, refined borders, and professional hover states

**Independent Test**: Interact with buttons, form inputs, and cards across the application verifying smooth animations and consistent hover states

### Implementation for User Story 2

- [ ] T023 [US2] Add transition animations to button classes in src/app/globals.css
- [ ] T024 [US2] Add focus glow effects to input class in src/app/globals.css
- [ ] T025 [US2] Add hover scale and border transitions to card-interactive class in src/app/globals.css
- [ ] T026 [P] [US2] Update MoveSelector with refined button states and transitions in src/components/MoveSelector.tsx
- [ ] T027 [P] [US2] Update PokemonSearch with new input styling and focus states in src/components/PokemonSearch.tsx
- [ ] T028 [P] [US2] Update TypeFilter with refined badge styling and hover effects in src/components/TypeFilter.tsx
- [ ] T029 [P] [US2] Update PokemonGrid with consistent card hover behavior in src/components/PokemonGrid.tsx
- [ ] T030 [P] [US2] Update PokemonCollection with refined list styling in src/components/PokemonCollection.tsx
- [ ] T031 [P] [US2] Update TrainerList with new list item styling and hover states in src/components/TrainerList.tsx
- [ ] T032 [P] [US2] Update TrainerInfo with refined card styling in src/components/TrainerInfo.tsx
- [ ] T033 [P] [US2] Update SecretKeyManager with new input and button styling in src/components/SecretKeyManager.tsx
- [ ] T034 [P] [US2] Update NicknameEditor with new input styling in src/components/NicknameEditor.tsx
- [ ] T035 [P] [US2] Update PinCreateForm with refined form styling in src/components/PinCreateForm.tsx
- [ ] T036 [P] [US2] Update PinGuard with new loading and form states in src/components/PinGuard.tsx
- [ ] T037 [P] [US2] Update AdminPinManager with new table and button styling in src/components/AdminPinManager.tsx

**Checkpoint**: All interactive elements have polished hover/focus states and smooth animations

---

## Phase 5: User Story 3 - Navigation and Layout Modernization (Priority: P2)

**Goal**: Clean grid-based layouts with generous whitespace and clear visual hierarchy

**Independent Test**: Navigate through multiple pages verifying consistent spacing, logical content grouping, and clear visual hierarchy

### Implementation for User Story 3

- [ ] T038 [US3] Add grid utility classes and container styling to globals.css in src/app/globals.css
- [ ] T039 [US3] Update main container and navigation structure in src/app/layout.tsx
- [ ] T040 [P] [US3] Update StarterDisplay with improved grid layout in src/components/StarterDisplay.tsx
- [ ] T041 [P] [US3] Update ZoneSelector with grid-based zone layout in src/components/ZoneSelector.tsx
- [ ] T042 [P] [US3] Update ZoneCard with consistent card sizing and spacing in src/components/ZoneCard.tsx
- [ ] T043 [P] [US3] Update ZonePreview with refined preview layout in src/components/ZonePreview.tsx
- [ ] T044 [US3] Add responsive breakpoint adjustments to layout in src/app/globals.css

**Checkpoint**: All pages have consistent grid layouts, proper spacing, and clear visual hierarchy

---

## Phase 6: User Story 4 - Battle Interface Enhancement (Priority: P3)

**Goal**: Enhanced battle interface with dramatic visual effects and improved action feedback

**Independent Test**: Initiate a battle and verify enhanced visual presentation, smooth attack animations, and clear feedback

### Implementation for User Story 4

- [ ] T045 [US4] Update BattleArena with new battle container styling and layout in src/components/BattleArena.tsx
- [ ] T046 [US4] Add health bar animations and damage flash effects in src/components/BattleArena.tsx
- [ ] T047 [US4] Update attack animation styles and timing in src/components/BattleArena.tsx
- [ ] T048 [P] [US4] Update CaptureAttempt with enhanced capture animation in src/components/CaptureAttempt.tsx
- [ ] T049 [P] [US4] Update PostBattleScreen with polished result presentation in src/components/PostBattleScreen.tsx
- [ ] T050 [US4] Update battle page with new layout and visual hierarchy in src/app/battle/page.tsx

**Checkpoint**: Battle interface has dramatic visual feedback and polished animations

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements and validation across all user stories

- [ ] T051 Add prefers-reduced-motion media query support to all animations in src/app/globals.css
- [ ] T052 Verify WCAG AA color contrast compliance across all pages
- [ ] T053 Test responsive behavior on mobile (375px), tablet (768px), and desktop (1024px+)
- [ ] T054 Test theme toggle switching without flash on page load
- [ ] T055 Update lib/theme.ts if needed to support new theme class names in src/lib/theme.ts
- [ ] T056 Visual audit: verify all pages use consistent design tokens
- [ ] T057 Functional testing: verify login, starter selection, battle, pokecenter flows still work
- [ ] T058 Run development server and validate quickstart.md testing checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (P1) should complete first as MVP
  - US2 and US3 (P2) can proceed in parallel after US1
  - US4 (P3) can start after US1, benefits from US2 animations
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (Visual Identity)**: Can start after Phase 2 - Foundation for all other stories
- **User Story 2 (Interactive Elements)**: Can start after Phase 2 - Independent of US1 pages
- **User Story 3 (Navigation/Layout)**: Can start after Phase 2 - Independent of US1/US2
- **User Story 4 (Battle Interface)**: Can start after Phase 2 - Benefits from US2 animation patterns

### Within Each Phase

- Tasks marked [P] can run in parallel (different files)
- Non-[P] tasks have implicit dependencies on prior tasks

### Parallel Opportunities

**Phase 1 Parallel**:
- T001, T002, T004, T005 can all run in parallel

**Phase 2 Parallel**:
- T010, T011, T012, T013 can all run in parallel

**Phase 3 Parallel**:
- T017, T018, T019, T020, T021, T022 can all run in parallel

**Phase 4 Parallel** (after T023-T025):
- T026 through T037 can all run in parallel

**Phase 5 Parallel**:
- T040, T041, T042, T043 can all run in parallel

**Phase 6 Parallel**:
- T048, T049 can run in parallel

---

## Parallel Example: Phase 4 Component Updates

```bash
# After completing T023-T025 (animation classes), launch all component updates together:
Task: "Update MoveSelector in src/components/MoveSelector.tsx"
Task: "Update PokemonSearch in src/components/PokemonSearch.tsx"
Task: "Update TypeFilter in src/components/TypeFilter.tsx"
Task: "Update PokemonGrid in src/components/PokemonGrid.tsx"
Task: "Update PokemonCollection in src/components/PokemonCollection.tsx"
Task: "Update TrainerList in src/components/TrainerList.tsx"
Task: "Update TrainerInfo in src/components/TrainerInfo.tsx"
Task: "Update SecretKeyManager in src/components/SecretKeyManager.tsx"
Task: "Update NicknameEditor in src/components/NicknameEditor.tsx"
Task: "Update PinCreateForm in src/components/PinCreateForm.tsx"
Task: "Update PinGuard in src/components/PinGuard.tsx"
Task: "Update AdminPinManager in src/components/AdminPinManager.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (design tokens, fonts, base classes)
2. Complete Phase 2: Foundational Components
3. Complete Phase 3: User Story 1 (all pages with new visual identity)
4. **STOP and VALIDATE**: Test all pages display correctly
5. Deploy/demo if ready - app has new Vercel-inspired look

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add User Story 1 -> Test pages -> Deploy (MVP - new visual identity)
3. Add User Story 2 -> Test interactions -> Deploy (polished interactions)
4. Add User Story 3 -> Test layouts -> Deploy (refined layouts)
5. Add User Story 4 -> Test battles -> Deploy (enhanced battle UI)
6. Polish phase -> Final validation -> Release

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (pages)
   - Developer B: User Story 2 (components)
   - Developer C: User Story 3 (layouts)
3. Developer D joins for User Story 4 after US2 patterns established
4. All complete Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No database changes - purely CSS/component updates
- Each user story can be demonstrated independently
- Verify visual changes don't break functionality
- Commit after each task or logical group
- Test on multiple browsers and screen sizes
