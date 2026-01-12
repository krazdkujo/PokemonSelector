# Feature Specification: PIN Authentication Layer

**Feature Branch**: `013-pin-auth`
**Created**: 2026-01-12
**Status**: Draft
**Input**: User description: "I want to add in a light auth layer that asks you to create a pin on login if you don't have one already. When you create an account you have to enter and confirm a 4 digit pin number that you can use to auth your account. I would prefer if the pin not be used to authenticate the API's, the API should be enough."

## Clarifications

### Session 2026-01-12

- Q: What admin PIN management capabilities are needed? -> A: Full control - Admins can reset PINs, unlock locked accounts, AND set specific temporary PINs for users
- Q: Should admin PIN actions be audited? -> A: Minimal logging - Only log action type and timestamp, no admin/user details
- Q: How should users be prompted when using a temporary PIN? -> A: Informative prompt - Message explains "Your PIN was reset by support. Please create a new PIN." then shows change form

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time PIN Setup (Priority: P1)

As a new user creating an account, I need to set up a 4-digit PIN so that I can quickly authenticate my identity for future sessions.

**Why this priority**: This is the foundational flow - without PIN creation, no other PIN-related functionality can work. It establishes the core security credential for all users.

**Independent Test**: Can be fully tested by creating a new account and verifying the PIN setup flow completes successfully, storing the PIN securely.

**Acceptance Scenarios**:

1. **Given** I am on the account creation screen, **When** I complete the initial registration, **Then** I am prompted to create a 4-digit PIN
2. **Given** I am on the PIN creation screen, **When** I enter a 4-digit PIN and confirm it with a matching PIN, **Then** my account is created with the PIN saved securely
3. **Given** I am on the PIN creation screen, **When** I enter a confirmation PIN that does not match the original, **Then** I see an error message and must re-enter both PINs

---

### User Story 2 - Existing User PIN Setup on Login (Priority: P1)

As an existing user who does not yet have a PIN, I need to be prompted to create one when I log in so that my account gains the additional security layer.

**Why this priority**: Critical for transitioning existing users to the new PIN system. Without this, legacy accounts would never have PINs.

**Independent Test**: Can be tested by logging in with an existing account that has no PIN and verifying the PIN setup prompt appears before accessing the main application.

**Acceptance Scenarios**:

1. **Given** I am an existing user without a PIN, **When** I successfully log in, **Then** I am redirected to the PIN creation screen before accessing the app
2. **Given** I am on the PIN creation screen (as existing user), **When** I create and confirm a matching 4-digit PIN, **Then** I am redirected to the main application
3. **Given** I am on the PIN creation screen, **When** I try to navigate away or skip PIN creation, **Then** I cannot proceed until a PIN is set

---

### User Story 3 - PIN Verification on Session Start (Priority: P2)

As a returning user with a PIN already set, I need to enter my PIN after logging in to verify my identity before accessing the application.

**Why this priority**: This is the primary ongoing use case for PIN authentication - verifying user identity on each session.

**Independent Test**: Can be tested by logging in with an account that has a PIN set and verifying the PIN entry screen appears and validates correctly.

**Acceptance Scenarios**:

1. **Given** I am a user with a PIN set, **When** I log in successfully, **Then** I am presented with a PIN entry screen
2. **Given** I am on the PIN entry screen, **When** I enter my correct 4-digit PIN, **Then** I am granted access to the main application
3. **Given** I am on the PIN entry screen, **When** I enter an incorrect PIN, **Then** I see an error message and can retry

---

### User Story 4 - PIN Lockout Protection (Priority: P3)

As a system administrator, I need the system to lock accounts after multiple failed PIN attempts to prevent brute-force attacks.

**Why this priority**: Security enhancement that protects against attacks, but core functionality works without it.

**Independent Test**: Can be tested by entering incorrect PINs repeatedly and verifying account lockout occurs after the threshold.

**Acceptance Scenarios**:

1. **Given** I have entered incorrect PINs multiple times, **When** I reach the maximum failed attempts (5), **Then** my account is temporarily locked for 15 minutes
2. **Given** my account is locked due to failed PIN attempts, **When** I try to enter a PIN, **Then** I see a message indicating the lockout and remaining time
3. **Given** my account was locked, **When** the lockout period expires, **Then** I can attempt PIN entry again

---

### User Story 5 - Admin PIN Management (Priority: P2)

As an administrator, I need to manage user PINs through the admin portal so that I can assist users who are locked out or have forgotten their PINs.

**Why this priority**: Essential support capability that enables admins to resolve user access issues without requiring complex self-service flows.

**Independent Test**: Can be tested by an admin searching for a user in the admin portal and performing reset, unlock, or temporary PIN assignment actions.

**Acceptance Scenarios**:

1. **Given** I am an admin viewing a user's account, **When** I click "Reset PIN", **Then** the user's PIN is cleared and they must create a new PIN on next login
2. **Given** I am an admin viewing a locked user account, **When** I click "Unlock Account", **Then** the lockout is cleared and the user can attempt PIN entry immediately
3. **Given** I am an admin viewing a user's account, **When** I set a temporary PIN, **Then** the user can log in with that PIN and is prompted to change it immediately

---

### User Story 6 - Temporary PIN Change Flow (Priority: P2)

As a user who has been assigned a temporary PIN by an administrator, I need to be clearly informed and guided to create my own PIN so that I can regain full control of my account security.

**Why this priority**: Completes the admin-assisted recovery flow with good user experience; critical for support scenarios.

**Independent Test**: Can be tested by logging in with an admin-set temporary PIN and verifying the informative prompt and mandatory change flow.

**Acceptance Scenarios**:

1. **Given** I have a temporary PIN set by an admin, **When** I successfully enter it, **Then** I see a message: "Your PIN was reset by support. Please create a new PIN."
2. **Given** I see the temporary PIN notification, **When** the message is displayed, **Then** I am immediately shown the PIN change form (cannot dismiss or skip)
3. **Given** I am on the temporary PIN change form, **When** I create and confirm a new PIN, **Then** my temporary flag is cleared and I proceed to the main application

---

### Edge Cases

- What happens when a user enters non-numeric characters in the PIN field? System only accepts numeric input (0-9)
- How does the system handle network interruptions during PIN creation? PIN is not saved until confirmation is complete; user must restart PIN creation
- What happens if a user forgets their PIN? User can self-reset via primary authentication, or contact admin for PIN reset/temporary PIN
- How are leading zeros handled? PINs like "0012" are valid 4-digit PINs
- What happens during concurrent login attempts? Each session requires independent PIN verification

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST require a 4-digit numeric PIN (0000-9999) during account creation
- **FR-002**: System MUST require PIN confirmation (entering the same PIN twice) during creation
- **FR-003**: System MUST prompt existing users without a PIN to create one upon login
- **FR-004**: System MUST NOT allow access to the main application until a PIN is set
- **FR-005**: System MUST verify PIN on each new session for users with PINs set
- **FR-006**: System MUST securely hash and store PINs (never in plaintext)
- **FR-007**: System MUST limit failed PIN attempts to 5 before temporary lockout
- **FR-008**: System MUST enforce a 15-minute lockout period after exceeding failed attempts
- **FR-009**: System MUST display user-friendly error messages for incorrect PINs
- **FR-010**: System MUST NOT use PIN for API authentication (existing API authentication remains unchanged)
- **FR-011**: System MUST validate PIN input as exactly 4 numeric digits
- **FR-012**: System MUST allow users to reset their PIN through the existing authentication mechanism
- **FR-013**: Admin portal MUST allow administrators to reset a user's PIN (clearing it, forcing new PIN creation on next login)
- **FR-014**: Admin portal MUST allow administrators to unlock a user's account that is locked due to failed PIN attempts
- **FR-015**: Admin portal MUST allow administrators to set a temporary PIN for a user
- **FR-016**: System MUST flag admin-set temporary PINs and require the user to change them on first successful login
- **FR-017**: System MUST log admin PIN actions with action type and timestamp only (no admin ID or target user details)

### Key Entities

- **User PIN**: A 4-digit numeric credential associated with a user account, stored as a secure hash. Attributes include: hashed value, creation timestamp, failed attempt count, lockout expiration time, is_temporary flag (true if admin-set and requires change on next login)
- **PIN Session State**: Tracks whether the current session has completed PIN verification. Used only for UI/session gating, not API access

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete PIN creation flow in under 30 seconds
- **SC-002**: 100% of new account registrations include PIN setup
- **SC-003**: Existing users without PINs are prompted within 24 hours of their next login
- **SC-004**: Failed PIN attempts are tracked and lockout triggers reliably after 5 failures
- **SC-005**: PIN verification adds less than 2 seconds to the login experience
- **SC-006**: Zero PINs are stored in plaintext
- **SC-007**: API endpoints remain fully functional without PIN authentication (existing auth preserved)

## Assumptions

- The existing authentication system (username/password or OAuth) remains the primary authentication method
- PIN is an additional layer for session verification, not a replacement for primary auth
- The lockout period of 15 minutes is appropriate for this application's security model
- 5 failed attempts before lockout balances security with usability
- Users can access PIN reset through a "Forgot PIN" flow that requires re-authentication with their primary credentials
- The PIN is per-user, not per-device or per-session
- Session timeout/logout clears PIN verification state, requiring re-entry on next login

## Out of Scope

- Biometric authentication alternatives (fingerprint, face ID)
- PIN change without re-authentication
- PIN complexity requirements beyond 4 digits
- Multi-factor authentication beyond PIN
- API-level PIN authentication (explicitly excluded per user request)
- Admin ability to view existing PIN values (PINs remain hashed; admins can only reset or set new ones)
