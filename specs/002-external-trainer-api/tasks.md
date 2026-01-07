# Tasks: External Trainer API

**Input**: Design documents from `/specs/002-external-trainer-api/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in specification. Test tasks omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md structure (Next.js App Router - extending existing project):
- Source: `src/app/`, `src/lib/`
- No separate tests directory (tests omitted per specification)

---

## Phase 1: Setup (Configuration)

**Purpose**: Environment configuration for the external API

- [x] T001 Add EXTERNAL_API_SECRET_KEY to .env.local with a generated secret value
- [x] T002 [P] Add ExternalTrainerResponse type to src/lib/types.ts

---

## Phase 2: User Story 1 - Student Retrieves Trainer Data (Priority: P1) MVP

**Goal**: Students can retrieve their trainer ID, name, and Pokemon details via external API

**Independent Test**: Make HTTP request with valid X-API-Key and X-Trainer-Name headers, verify correct trainer data returned

### Implementation for User Story 1

- [x] T003 [US1] Create external API route file at src/app/api/external/trainer/route.ts
- [x] T004 [US1] Implement GET handler with trainer name lookup (case-insensitive) in src/app/api/external/trainer/route.ts
- [x] T005 [US1] Add Pokemon details enrichment using getPokemonById utility in src/app/api/external/trainer/route.ts
- [x] T006 [US1] Return ExternalTrainerResponse format with trainer_id, trainer_name, and pokemon in src/app/api/external/trainer/route.ts
- [x] T007 [US1] Handle trainer not found case with 404 response in src/app/api/external/trainer/route.ts

**Checkpoint**: User Story 1 complete - students can retrieve their trainer data

---

## Phase 3: User Story 2 - Unauthorized Access Prevention (Priority: P1)

**Goal**: API rejects requests without valid secret key

**Independent Test**: Make requests with missing/invalid X-API-Key header, verify 401 Unauthorized response

### Implementation for User Story 2

- [x] T008 [US2] Add secret key validation at start of GET handler in src/app/api/external/trainer/route.ts
- [x] T009 [US2] Return 401 Unauthorized for missing X-API-Key header in src/app/api/external/trainer/route.ts
- [x] T010 [US2] Return 401 Unauthorized for invalid X-API-Key value in src/app/api/external/trainer/route.ts
- [x] T011 [US2] Return 400 Bad Request for missing X-Trainer-Name header in src/app/api/external/trainer/route.ts

**Checkpoint**: User Story 2 complete - unauthorized access is prevented

---

## Phase 4: Polish & Validation

**Purpose**: Final validation and documentation

- [x] T012 Test complete flow with curl using quickstart.md examples
- [x] T013 Verify error responses match OpenAPI contract in contracts/openapi.yaml
- [ ] T014 Update quickstart.md with actual deployed URL after Vercel deployment

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup (T001, T002)
- **User Story 2 (Phase 3)**: Implemented in same file as US1, but logically separate
- **Polish (Phase 4)**: Depends on US1 and US2 completion

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - retrieves trainer data
- **User Story 2 (P1)**: Same priority, implements in same route file - adds auth validation

### Within Each User Story

- T003 creates file, T004-T007 add functionality
- T008-T011 add validation on top of existing handler

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T001, T002 can run in parallel (different files)
```

**Note**: US1 and US2 tasks are in the same file so should be done sequentially within the file.

---

## Parallel Example: Setup Phase

```bash
# Launch both setup tasks together:
Task: "Add EXTERNAL_API_SECRET_KEY to .env.local"
Task: "Add ExternalTrainerResponse type to src/lib/types.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: User Story 1 (T003-T007)
3. **STOP and VALIDATE**: Test retrieval with valid key and name
4. Continue to Phase 3: User Story 2 (T008-T011)
5. Final validation in Phase 4

### Single Developer Flow

1. T001 + T002 (parallel)
2. T003 → T004 → T005 → T006 → T007 (sequential, same file)
3. T008 → T009 → T010 → T011 (sequential, same file)
4. T012 → T013 → T014 (sequential validation)

### Suggested MVP Scope

**MVP = Phase 1 + Phase 2 (User Story 1)**
- Students can retrieve trainer data with valid credentials
- Minimal but complete value delivery

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story
- Both user stories share the same route file - implement sequentially
- No tests requested - manual curl testing per quickstart.md
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
