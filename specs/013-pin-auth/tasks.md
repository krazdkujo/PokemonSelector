# Tasks: PIN Authentication Layer

**Input**: Design documents from `/specs/013-pin-auth/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/pin-api.yaml

**Tests**: Not explicitly requested - omitting test tasks per project pattern (manual testing via dev server)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Database & Core Infrastructure)

**Purpose**: Database migration and core PIN utilities

- [X] T001 Create database migration file sql/011_add_pin_fields.sql with PIN columns for trainers table
- [X] T002 Create audit log migration in sql/011_add_pin_fields.sql for pin_admin_log table
- [X] T003 Run database migration to apply PIN fields to Supabase
- [X] T004 [P] Create PIN utility library in src/lib/pin.ts with hashPin, verifyPin, validatePinFormat functions
- [X] T005 [P] Add PIN-related TypeScript types to src/lib/types.ts (PinVerifyResult, PinStatus, PinAdminLogEntry)

---

## Phase 2: Foundational (Session & Middleware)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Extend src/lib/session.ts with PIN verification state functions (getPinVerified, setPinVerified, clearPinVerified using sessionStorage)
- [X] T007 Create PIN status API route in src/app/api/pin/status/route.ts (GET - returns has_pin, is_locked, is_temporary)
- [X] T008 Update src/middleware.ts to check PIN status and redirect to /pin/create or /pin/verify as needed (implemented via client-side usePinGuard hook)
- [X] T009 Add PIN-exempt routes to middleware whitelist (/, /pin/create, /pin/verify, /api/*) (implemented via client-side PinGuard)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - First-Time PIN Setup (Priority: P1)

**Goal**: New users can create a 4-digit PIN during account creation

**Independent Test**: Create a new account and verify PIN setup flow completes with PIN stored securely (hashed)

### Implementation for User Story 1

- [X] T010 [P] [US1] Create PinInput component in src/components/PinInput.tsx (4 individual inputs with auto-advance)
- [X] T011 [P] [US1] Create PinCreateForm component in src/components/PinCreateForm.tsx (PIN + confirmation fields with validation)
- [X] T012 [US1] Create PIN creation page in src/app/pin/create/page.tsx using PinCreateForm component
- [X] T013 [US1] Create PIN create API route in src/app/api/pin/create/route.ts (POST - hash and store PIN)
- [X] T014 [US1] Add PIN mismatch error handling in PinCreateForm (display "PINs do not match" message)
- [X] T015 [US1] Add PIN format validation (exactly 4 numeric digits, reject non-numeric input)

**Checkpoint**: New users can create PINs - User Story 1 complete

---

## Phase 4: User Story 2 - Existing User PIN Setup on Login (Priority: P1)

**Goal**: Existing users without PIN are prompted to create one on login

**Independent Test**: Log in with existing account that has no PIN and verify redirect to PIN creation screen

### Implementation for User Story 2

- [X] T016 [US2] Update middleware PIN check logic to detect users with no PIN (pin_hash IS NULL) (via usePinGuard hook)
- [X] T017 [US2] Ensure /pin/create page works for existing users (no account creation, just PIN set)
- [X] T018 [US2] Add redirect to dashboard after PIN creation for existing users
- [X] T019 [US2] Prevent navigation away from /pin/create until PIN is set (via usePinGuard hook)

**Checkpoint**: Existing users without PIN are forced to create one - User Story 2 complete

---

## Phase 5: User Story 3 - PIN Verification on Session Start (Priority: P2)

**Goal**: Returning users with PIN must verify it before accessing application

**Independent Test**: Log in with account that has PIN set, verify PIN entry screen appears and correct PIN grants access

### Implementation for User Story 3

- [X] T020 [P] [US3] Create PIN verify page in src/app/pin/verify/page.tsx with PinInput component
- [X] T021 [US3] Create PIN verify API route in src/app/api/pin/verify/route.ts (POST - verify against hash)
- [X] T022 [US3] Add incorrect PIN error message display on verify page
- [X] T023 [US3] Set sessionStorage pin_verified flag on successful verification
- [X] T024 [US3] Update middleware to check sessionStorage for pin_verified before allowing protected routes (via usePinGuard hook)
- [X] T025 [US3] Clear pin_verified on logout (extend clearTrainerId in src/lib/session.ts)

**Checkpoint**: PIN verification flow complete - User Story 3 complete

---

## Phase 6: User Story 4 - PIN Lockout Protection (Priority: P3)

**Goal**: Account locks after 5 failed PIN attempts for 15 minutes

**Independent Test**: Enter wrong PIN 5 times, verify account locks and shows remaining lockout time

### Implementation for User Story 4

- [X] T026 [US4] Update PIN verify API to increment pin_failed_attempts on wrong PIN
- [X] T027 [US4] Add lockout logic: set pin_lockout_until = NOW() + 15 minutes when attempts >= 5
- [X] T028 [US4] Add lockout check before PIN verification (return 423 with remaining seconds if locked)
- [X] T029 [US4] Reset pin_failed_attempts to 0 on successful PIN verification
- [X] T030 [US4] Display lockout message with countdown on verify page
- [X] T031 [US4] Auto-refresh or enable retry button when lockout expires

**Checkpoint**: Lockout protection complete - User Story 4 complete

---

## Phase 7: User Story 5 - Admin PIN Management (Priority: P2)

**Goal**: Admins can reset PINs, unlock accounts, and set temporary PINs via admin portal

**Independent Test**: As admin, reset a user's PIN, unlock a locked account, and set a temporary PIN

### Implementation for User Story 5

- [X] T032 [P] [US5] Create admin PIN reset API route in src/app/api/pin/admin/reset/route.ts (clears pin_hash)
- [X] T033 [P] [US5] Create admin unlock API route in src/app/api/pin/admin/unlock/route.ts (clears lockout)
- [X] T034 [P] [US5] Create admin set-temp API route in src/app/api/pin/admin/set-temp/route.ts (sets PIN with is_temporary=true)
- [X] T035 [US5] Add admin role check to all admin PIN routes (return 403 if not admin)
- [X] T036 [US5] Add minimal audit logging to admin routes (insert action_type + timestamp to pin_admin_log)
- [X] T037 [P] [US5] Create AdminPinManager component in src/components/AdminPinManager.tsx with Reset/Unlock/Set Temp buttons
- [X] T038 [US5] Update admin page src/app/admin/page.tsx to include AdminPinManager for each trainer row (via TrainerList)
- [X] T039 [US5] Add confirmation dialogs for admin PIN actions in AdminPinManager

**Checkpoint**: Admin PIN management complete - User Story 5 complete

---

## Phase 8: User Story 6 - Temporary PIN Change Flow (Priority: P2)

**Goal**: Users with temporary PIN see message and must change PIN immediately

**Independent Test**: Log in with admin-set temporary PIN, verify message appears and PIN change is mandatory

### Implementation for User Story 6

- [X] T040 [US6] Update PIN verify API to detect pin_is_temporary and return must_change: true with message
- [X] T041 [US6] Update PIN verify page to show temporary PIN message: "Your PIN was reset by support. Please create a new PIN."
- [X] T042 [US6] Redirect to PIN create page after temporary PIN verification (cannot skip)
- [X] T043 [US6] Update PIN create API to clear pin_is_temporary flag when user sets new PIN
- [X] T044 [US6] Ensure temporary PIN flow cannot be bypassed (via verify page redirect and API enforcement)

**Checkpoint**: Temporary PIN flow complete - User Story 6 complete

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup and validation

- [X] T045 Verify external API endpoints remain unaffected by PIN (test /api/external/trainer with X-API-Key) - PIN is UI-only, APIs use separate auth
- [X] T046 Add loading states to PIN input components during API calls
- [X] T047 Add keyboard accessibility to PinInput (Tab, Shift+Tab, Backspace navigation)
- [X] T048 Run quickstart.md validation checklist - build successful, lint clean
- [X] T049 Clean up any console.log statements and add proper error logging

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Reuses US1 components (PinCreateForm)
- **User Story 3 (P2)**: Can start after Foundational - Reuses US1 components (PinInput)
- **User Story 4 (P3)**: Depends on US3 (verify flow must exist before lockout logic)
- **User Story 5 (P2)**: Can start after Foundational - Independent admin functionality
- **User Story 6 (P2)**: Depends on US3 (verify flow) and US5 (admin can set temp PIN)

### Parallel Opportunities

**Phase 1 (Setup)**:
- T004 and T005 can run in parallel (different files)

**Phase 3 (US1)**:
- T010 and T011 can run in parallel (different components)

**Phase 7 (US5)**:
- T032, T033, T034 can run in parallel (different API routes)
- T037 can run in parallel with API routes (different file)

**Cross-Story Parallelism**:
- US1 and US5 can be worked on simultaneously (no shared dependencies after Foundational)
- US3 and US5 can be worked on simultaneously

---

## Parallel Example: Phase 7 (User Story 5)

```bash
# Launch all admin API routes together:
Task: "Create admin PIN reset API route in src/app/api/pin/admin/reset/route.ts"
Task: "Create admin unlock API route in src/app/api/pin/admin/unlock/route.ts"
Task: "Create admin set-temp API route in src/app/api/pin/admin/set-temp/route.ts"
Task: "Create AdminPinManager component in src/components/AdminPinManager.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup (migrations, utilities)
2. Complete Phase 2: Foundational (session, middleware)
3. Complete Phase 3: User Story 1 (new user PIN creation)
4. Complete Phase 4: User Story 2 (existing user PIN creation)
5. **STOP and VALIDATE**: All users can now create PINs
6. Deploy/demo if ready - system is usable at this point

### Incremental Delivery

1. Setup + Foundational -> Foundation ready
2. Add US1 + US2 -> All users can create PINs (MVP!)
3. Add US3 -> PIN verification on session start
4. Add US4 -> Lockout protection (security hardening)
5. Add US5 + US6 -> Admin management + temporary PIN flow
6. Polish -> Final cleanup and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- External API auth (X-API-Key) must remain completely unaffected
