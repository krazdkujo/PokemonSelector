# Tasks: Admin Dashboard and External API Documentation

**Input**: Design documents from `/specs/009-admin-dashboard-api/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: No test tasks included (not explicitly requested in specification).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Project type**: Next.js full-stack (single project)
- **Source**: `src/` at repository root
- **Docs**: `docs/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and type definitions

- [x] T001 [P] Add TrainerStatsSummary interface to src/lib/types.ts
- [x] T002 [P] Add TrainerWithStats interface extending Trainer in src/lib/types.ts
- [x] T003 [P] Add RoleUpdateRequest interface to src/lib/types.ts
- [x] T004 [P] Add RoleUpdateResponse interface to src/lib/types.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**Note**: This feature builds on existing infrastructure. No blocking foundational tasks required - the existing admin page, trainers API, and authentication are already in place.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Admin Views All Trainers and Statistics (Priority: P1)

**Goal**: Display comprehensive trainer statistics in admin dashboard including battles won/lost, Pokemon captured, and collection count.

**Independent Test**: Log in as admin, navigate to /admin, verify all trainers display with complete statistics (battles, captures, collection size).

### Implementation for User Story 1

- [x] T005 [US1] Enhance /api/trainers GET to aggregate user_stats data in src/app/api/trainers/route.ts
- [x] T006 [US1] Add Pokemon count query to /api/trainers endpoint in src/app/api/trainers/route.ts
- [x] T007 [US1] Return TrainerWithStats array from /api/trainers endpoint in src/app/api/trainers/route.ts
- [x] T008 [P] [US1] Add statistics columns (Battles, Captured, Collection) to TrainerList header in src/components/TrainerList.tsx
- [x] T009 [US1] Add statistics data cells to TrainerList rows in src/components/TrainerList.tsx
- [x] T010 [US1] Handle null/missing stats with zero defaults in TrainerList display in src/components/TrainerList.tsx
- [x] T011 [US1] Update admin page to use TrainerWithStats type in src/app/admin/page.tsx

**Checkpoint**: User Story 1 complete - admin dashboard displays all trainer statistics

---

## Phase 4: User Story 2 - Admin Assigns Admin Role to Another Trainer (Priority: P2)

**Goal**: Enable admins to promote trainers to admin role and demote admins (with last-admin protection).

**Independent Test**: As admin, promote a trainer to admin, verify they can access /admin. Try to demote last admin, verify error prevents it.

### Implementation for User Story 2

- [x] T012 [US2] Create role assignment endpoint directory structure at src/app/api/trainers/[id]/role/
- [x] T013 [US2] Implement PATCH handler with session authentication in src/app/api/trainers/[id]/role/route.ts
- [x] T014 [US2] Add admin role verification for requester in src/app/api/trainers/[id]/role/route.ts
- [x] T015 [US2] Add role value validation (trainer/admin only) in src/app/api/trainers/[id]/role/route.ts
- [x] T016 [US2] Implement last-admin protection check in src/app/api/trainers/[id]/role/route.ts
- [x] T017 [US2] Update trainer role and return RoleUpdateResponse in src/app/api/trainers/[id]/role/route.ts
- [x] T018 [P] [US2] Add handleRoleChange function to admin page in src/app/admin/page.tsx
- [x] T019 [US2] Add role toggle button to TrainerList component in src/components/TrainerList.tsx
- [x] T020 [US2] Pass onRoleChange prop from admin page to TrainerList in src/app/admin/page.tsx
- [x] T021 [US2] Disable role change button for current user (prevent self-demotion UI) in src/components/TrainerList.tsx
- [x] T022 [US2] Add confirmation dialog before role change in src/app/admin/page.tsx
- [x] T023 [US2] Handle and display last-admin error in admin page UI in src/app/admin/page.tsx

**Checkpoint**: User Story 2 complete - admins can manage roles with proper safeguards

---

## Phase 5: User Story 3 - External Developer Accesses API Documentation (Priority: P3)

**Goal**: Provide comprehensive, professional API documentation for external developers to integrate with the platform.

**Independent Test**: Read docs/API.md, follow authentication instructions, make a successful API call, verify response matches documented format.

### Implementation for User Story 3

- [x] T024 [P] [US3] Create OpenAPI specification file at docs/openapi.yaml from specs/009-admin-dashboard-api/contracts/openapi.yaml
- [x] T025 [US3] Write API overview section with purpose and capabilities in docs/API.md
- [x] T026 [US3] Write authentication section with step-by-step key generation instructions in docs/API.md
- [x] T027 [US3] Document GET /api/external/trainer endpoint with request/response examples in docs/API.md
- [x] T028 [US3] Document GET /api/dashboard endpoint with request/response examples in docs/API.md
- [x] T029 [P] [US3] Document GET /api/pokecenter endpoint with request/response examples in docs/API.md
- [x] T030 [P] [US3] Document POST /api/pokecenter/swap endpoint with request/response examples in docs/API.md
- [x] T031 [P] [US3] Document GET /api/pokedex endpoint with request/response examples in docs/API.md
- [x] T032 [P] [US3] Document GET /api/moves and PUT /api/moves endpoints with request/response examples in docs/API.md
- [x] T033 [P] [US3] Document GET /api/zones endpoint (public) with response examples in docs/API.md
- [x] T034 [P] [US3] Document GET /api/zones/[zoneId]/preview endpoint with request/response examples in docs/API.md
- [x] T035 [P] [US3] Document GET /api/battle endpoint with request/response examples in docs/API.md
- [x] T036 [P] [US3] Document POST /api/battle endpoint with request/response examples in docs/API.md
- [x] T037 [P] [US3] Document POST /api/battle/round endpoint with request/response examples in docs/API.md
- [x] T038 [P] [US3] Document GET /api/capture and POST /api/capture endpoints with request/response examples in docs/API.md
- [x] T039 [US3] Write comprehensive error reference section with all error codes in docs/API.md
- [x] T040 [US3] Add curl examples for all documented endpoints in docs/API.md
- [x] T041 [US3] Add Python examples for key endpoints (auth, trainer, battle) in docs/API.md
- [x] T042 [US3] Add JavaScript examples for key endpoints (auth, trainer, battle) in docs/API.md
- [x] T043 [US3] Add troubleshooting section with common issues and solutions in docs/API.md
- [x] T044 [US3] Add quick reference section with endpoint summary table in docs/API.md

**Checkpoint**: User Story 3 complete - comprehensive API documentation is available

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T045 [P] Verify admin dashboard loads all trainers with stats in under 3 seconds
- [x] T046 [P] Verify non-admin users cannot access /admin (redirect works)
- [x] T047 [P] Verify all code examples in API documentation execute correctly
- [x] T048 Run npm run lint and fix any linting errors
- [x] T049 Run quickstart.md validation checklist against implementation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - no blocking tasks for this feature
- **User Stories (Phase 3-5)**: All depend on Setup (Phase 1) completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 -> P2 -> P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 1 - Builds on US1 TrainerList but independently testable
- **User Story 3 (P3)**: Can start after Phase 1 - Completely independent (documentation only)

### Within Each User Story

- Types (T001-T004) before API changes
- API changes before UI changes
- Core implementation before polish

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- Within US1: T008 can run parallel to T005-T007
- Within US2: T018 can run parallel to T012-T017
- Within US3: Most documentation tasks (T024, T029-T038) can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Phase 1 - All in parallel:
Task T001: "Add TrainerStatsSummary interface to src/lib/types.ts"
Task T002: "Add TrainerWithStats interface extending Trainer in src/lib/types.ts"
Task T003: "Add RoleUpdateRequest interface to src/lib/types.ts"
Task T004: "Add RoleUpdateResponse interface to src/lib/types.ts"

# User Story 1 - API work sequential, UI work parallel:
# Sequential: T005 -> T006 -> T007 (same file, dependent logic)
# Parallel with API: T008 (different file)
Task T008: "Add statistics columns to TrainerList header in src/components/TrainerList.tsx"
```

---

## Parallel Example: User Story 3 (Documentation)

```bash
# All endpoint documentation can run in parallel:
Task T029: "Document GET /api/pokecenter endpoint"
Task T030: "Document POST /api/pokecenter/swap endpoint"
Task T031: "Document GET /api/pokedex endpoint"
Task T032: "Document GET/PUT /api/moves endpoints"
Task T033: "Document GET /api/zones endpoint"
Task T034: "Document GET /api/zones/[zoneId]/preview endpoint"
Task T035: "Document GET /api/battle endpoint"
Task T036: "Document POST /api/battle endpoint"
Task T037: "Document POST /api/battle/round endpoint"
Task T038: "Document GET/POST /api/capture endpoints"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 3: User Story 1 (T005-T011)
3. **STOP and VALIDATE**: Test admin dashboard displays all statistics
4. Deploy/demo if ready - MVP delivered!

### Incremental Delivery

1. Complete Setup (Phase 1) -> Types ready
2. Add User Story 1 (Phase 3) -> Test independently -> Deploy (MVP: Admin sees stats)
3. Add User Story 2 (Phase 4) -> Test independently -> Deploy (Role management)
4. Add User Story 3 (Phase 5) -> Test independently -> Deploy (API docs)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. All developers complete Setup together (fast - just types)
2. Once Setup is done:
   - Developer A: User Story 1 (Admin Dashboard Statistics)
   - Developer B: User Story 2 (Role Assignment)
   - Developer C: User Story 3 (API Documentation)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No new database tables needed - feature uses existing schema
- Existing admin page provides foundation - this enhances it
