# Research: PIN Authentication Layer

**Feature**: 013-pin-auth
**Date**: 2026-01-12

## Research Summary

This document captures technical decisions made during Phase 0 research for the PIN authentication feature.

---

## 1. PIN Hashing Strategy

**Decision**: Use bcryptjs with salt rounds of 10

**Rationale**:
- bcryptjs is already used in the codebase for API key hashing (`src/lib/secret-key.ts`)
- Salt rounds of 10 provides adequate security for 4-digit PINs (10,000 possible values)
- Consistent with existing security patterns in the project
- bcrypt's built-in salt generation prevents rainbow table attacks

**Alternatives Considered**:
- SHA-256 with salt: Rejected - faster hashing makes brute-force easier for small keyspace
- Argon2: Rejected - not currently in dependencies; bcrypt is sufficient for this use case
- Higher salt rounds (12+): Rejected - would slow login verification noticeably

**Implementation Reference**: Follow pattern from `src/lib/secret-key.ts` lines 24-26

---

## 2. PIN Storage Location

**Decision**: Extend existing `trainers` table with new columns

**Rationale**:
- PIN has 1:1 relationship with user (no need for separate table)
- Reduces query complexity (no JOINs needed for PIN verification)
- Follows existing pattern of user data in `trainers` table
- Simpler migration and rollback

**Alternatives Considered**:
- New `user_pins` table: Rejected - adds unnecessary complexity for 1:1 relationship
- Store in `user_secrets` table: Rejected - that table is for API keys, different purpose

**New Columns**:
```sql
pin_hash          VARCHAR(255)   -- bcrypt hash of PIN
pin_failed_attempts INTEGER DEFAULT 0
pin_lockout_until TIMESTAMPTZ    -- NULL if not locked
pin_is_temporary  BOOLEAN DEFAULT FALSE
pin_created_at    TIMESTAMPTZ
```

---

## 3. Session State Management

**Decision**: Use localStorage key `pin_verified` + session cookie pattern

**Rationale**:
- Matches existing session management in `src/lib/session.ts`
- PIN verification state is per-browser-session (cleared on tab close)
- Does not affect API authentication (cookie-based trainer_id unchanged)
- Simple client-side check enables fast redirects

**Alternatives Considered**:
- Server-side session: Rejected - would require stateful server; violates serverless principle
- JWT token with PIN claim: Rejected - over-engineered for UI-only gating
- Cookie-only: Rejected - need sessionStorage behavior (clear on tab close)

**Implementation**:
- Store `pin_verified: true` in sessionStorage (not localStorage)
- Clear on logout via `clearTrainerId()` extension
- Middleware checks sessionStorage flag before allowing protected routes

---

## 4. Lockout Implementation

**Decision**: Database-enforced lockout with timestamp comparison

**Rationale**:
- Lockout state persists across browser sessions (intentional)
- Server-side enforcement prevents bypass
- Timestamp allows automatic unlock after 15 minutes
- Failed attempt counter resets on successful verification

**Flow**:
1. On PIN entry, check `pin_lockout_until > NOW()`
2. If locked, return error with remaining time
3. If wrong PIN, increment `pin_failed_attempts`
4. If attempts >= 5, set `pin_lockout_until = NOW() + 15 minutes`
5. If correct PIN, reset `pin_failed_attempts = 0` and clear lockout

**Alternatives Considered**:
- Redis-based lockout: Rejected - no Redis in stack; Supabase sufficient
- Client-side lockout: Rejected - easily bypassed; must be server-enforced

---

## 5. Admin PIN Management

**Decision**: Three separate admin endpoints with minimal audit logging

**Rationale**:
- Clear separation of concerns (reset vs unlock vs set-temp)
- Each action has distinct authorization and logging needs
- Follows existing admin API pattern (`PATCH /api/trainers/[id]/role`)
- Minimal logging (action type + timestamp only) per clarification

**Endpoints**:
- `POST /api/pin/admin/reset` - Clears PIN hash; user must create new
- `POST /api/pin/admin/unlock` - Sets `pin_lockout_until = NULL`, `pin_failed_attempts = 0`
- `POST /api/pin/admin/set-temp` - Sets PIN hash + `pin_is_temporary = true`

**Authorization**: Check `trainer.role === 'admin'` (existing pattern)

---

## 6. Temporary PIN Flow

**Decision**: Flag-based detection with forced change on verification

**Rationale**:
- Simple boolean flag avoids complex state machine
- Verification endpoint checks flag and returns `must_change: true`
- Client redirects to PIN change flow before allowing app access
- Flag cleared only after user creates their own PIN

**User Experience**:
1. User enters temp PIN on verify screen
2. Server validates PIN, sees `pin_is_temporary = true`
3. Response: `{ valid: true, must_change: true, message: "Your PIN was reset by support. Please create a new PIN." }`
4. Client shows message, then PIN change form
5. User creates new PIN, `pin_is_temporary` set to `false`

---

## 7. Middleware Integration

**Decision**: Extend existing middleware with PIN redirect logic

**Rationale**:
- Existing `middleware.ts` handles API key auth; can add PIN checks
- Redirect logic runs before page render (better UX)
- Whitelist approach for PIN-exempt routes

**PIN-Exempt Routes** (no PIN check):
- `/` (login page)
- `/pin/create` (PIN creation)
- `/pin/verify` (PIN entry)
- `/api/*` (API routes use different auth)
- `/_next/*`, `/favicon.ico` (static assets)

**Logic**:
```
if (has_trainer_id && !has_pin_verified) {
  if (user_has_no_pin) redirect('/pin/create')
  else redirect('/pin/verify')
}
```

---

## 8. PIN Input Component Design

**Decision**: Four individual numeric inputs with auto-advance

**Rationale**:
- Common pattern for PIN entry (banking apps, phone unlock)
- Auto-advance on digit entry improves UX
- Backspace moves to previous input
- Paste support for all 4 digits at once
- Input type="tel" for numeric keyboard on mobile

**Accessibility**:
- Each input labeled (screen reader: "PIN digit 1 of 4")
- Support keyboard navigation (Tab, Shift+Tab)
- Error state announced to screen readers

---

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been resolved through this research phase. No blocking questions remain.
