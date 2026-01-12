# Tasks: Pokecenter API Sorting and Documentation Update

**Input**: Design documents from `/specs/011-pokecenter-api-sorting/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Not requested - manual API testing specified in plan.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: No setup required - existing project infrastructure

**Note**: This feature modifies an existing codebase with established patterns. No project initialization needed.

**Checkpoint**: Ready to proceed directly to user stories (no foundational work required)

---

## Phase 2: User Story 1 - View Recently Caught Pokemon First (Priority: P1)

**Goal**: Update Pokecenter API to return Pokemon ordered by capture date descending (most recent first)

**Independent Test**: Call GET /api/pokecenter and verify the Pokemon array shows most recently caught Pokemon at index 0

### Implementation for User Story 1

- [x] T001 [US1] Change sort order from ascending to descending in src/app/api/pokecenter/route.ts line 37

**Checkpoint**: API now returns Pokemon with newest catches first. Test by calling the endpoint and verifying order.

---

## Phase 3: User Story 2 - Access API with Live Documentation (Priority: P2)

**Goal**: Update all API documentation to use production URL instead of placeholder

**Independent Test**: Read any code example from documentation and verify URL is `https://pokemon-selector-rctq.vercel.app/`

### Implementation for User Story 2

- [x] T002 [P] [US2] Replace all `your-app.vercel.app` with `pokemon-selector-rctq.vercel.app` in docs/API.md
- [x] T003 [P] [US2] Replace all `your-app.vercel.app` with `pokemon-selector-rctq.vercel.app` in public/docs/API.md
- [x] T004 [P] [US2] Update server URL in docs/openapi.yaml to use production URL
- [x] T005 [P] [US2] Update server URL in public/docs/openapi.yaml to use production URL
- [x] T006 [P] [US2] Update server URL in docs/api/openapi.yaml to use production URL (N/A - uses relative /api path)
- [x] T007 [US2] Remove placeholder instruction text "Replace with the actual deployment URL" from docs/API.md

**Checkpoint**: All documentation now references production URL. Test by copying a curl example and running it.

---

## Phase 4: Polish & Verification

**Purpose**: Final verification and cleanup

- [x] T008 Start dev server with `npm run dev` and manually test /api/pokecenter endpoint
- [x] T009 Verify documentation renders correctly with production URLs
- [x] T010 Run quickstart.md validation steps

---

## Dependencies & Execution Order

### Phase Dependencies

- **User Story 1 (Phase 2)**: No dependencies - can start immediately
- **User Story 2 (Phase 3)**: No dependencies - can run in parallel with US1
- **Polish (Phase 4)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Single task, no internal dependencies
- **User Story 2 (P2)**: All tasks can run in parallel (different files)

### Parallel Opportunities

All US2 tasks (T002-T006) can run simultaneously as they modify different files.

---

## Parallel Example: User Story 2

```bash
# Launch all documentation updates together:
Task: "Replace URLs in docs/API.md"
Task: "Replace URLs in public/docs/API.md"
Task: "Update server URL in docs/openapi.yaml"
Task: "Update server URL in public/docs/openapi.yaml"
Task: "Update server URL in docs/api/openapi.yaml"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete T001 (sort order change)
2. **STOP and VALIDATE**: Test API returns newest Pokemon first
3. Can deploy immediately for core functionality

### Full Implementation

1. Complete T001 (US1 - API change)
2. Complete T002-T007 in parallel (US2 - documentation)
3. Complete T008-T010 (verification)
4. Deploy

### Estimated Effort

- **User Story 1**: 1 task, ~5 minutes
- **User Story 2**: 6 tasks, ~15 minutes (parallel execution)
- **Total**: ~20-30 minutes including verification

---

## Notes

- All US2 tasks marked [P] can run in parallel (different files)
- T001 is the critical path - provides immediate user value
- Documentation tasks are lower risk and can be batched
- Commit after T001 for immediate value delivery
