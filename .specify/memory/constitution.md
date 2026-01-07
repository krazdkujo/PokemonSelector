<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution ratification)

Modified principles: N/A (new constitution)

Added sections:
  - Core Principles (5 principles)
  - Technology Stack (new section)
  - Development Workflow (new section)
  - Governance

Removed sections: N/A (new constitution)

Templates requiring updates:
  - .specify/templates/plan-template.md ✅ (no changes required - generic template)
  - .specify/templates/spec-template.md ✅ (no changes required - generic template)
  - .specify/templates/tasks-template.md ✅ (no changes required - generic template)
  - .specify/templates/checklist-template.md ✅ (no changes required - generic template)
  - .specify/templates/agent-file-template.md ✅ (no changes required - generic template)

Follow-up TODOs: None
================================================================================
-->

# Pokemon Starter Selector Constitution

## Core Principles

### I. Unique Ownership Constraint

The system MUST enforce that each Pokemon can be claimed by exactly one user, and each
user can claim exactly one Pokemon as their starter. This one-to-one relationship is
non-negotiable and MUST be enforced at the database level via unique constraints.

- Database MUST have a unique constraint on `pokemon_id` in the ownership table
- Database MUST have a unique constraint on `user_id` in the ownership table
- Once claimed, a Pokemon is permanently assigned and MUST NOT be reassignable
- All claim operations MUST be atomic to prevent race conditions

### II. Authentication-First

All user-facing operations that modify state MUST require authentication via Supabase
Auth. Anonymous users may browse Pokemon but MUST NOT claim starters.

- Supabase Auth is the sole authentication provider
- Session tokens MUST be validated on all protected routes
- API routes MUST reject unauthenticated requests to protected endpoints with 401
- Client-side MUST handle auth state changes gracefully

### III. Serverless Architecture

The application MUST follow a serverless-first architecture using Next.js App Router
and Vercel deployment. No long-running server processes are permitted.

- All API endpoints MUST be implemented as Next.js API routes or Server Actions
- Database connections MUST be pooled appropriately for serverless (Supabase handles this)
- Cold start performance SHOULD be optimized by minimizing dependencies
- No stateful server-side sessions; use Supabase for all persistent state

### IV. Single Source of Truth

Pokemon master data (names, types, sprites) MUST be loaded from a local data source
bundled with the application. User ownership data MUST be stored in Supabase Postgres.

- Pokemon data: Local JSON/static files (immutable, versioned with the app)
- User profiles: Supabase `profiles` table linked to `auth.users`
- Ownership records: Supabase table with foreign keys to user and Pokemon ID
- The public API endpoint MUST query Supabase to resolve username-to-starter mappings

### V. API Simplicity

The public-facing serverless function MUST accept a username and return that user's
selected starter Pokemon. The API contract is simple and stable.

- Endpoint: `GET /api/starter?username={username}`
- Response: JSON containing Pokemon details or 404 if user has no starter
- No authentication required for public lookup (read-only)
- Response MUST include Pokemon name, ID, and sprite URL at minimum

## Technology Stack

**Frontend & API**: Next.js 14+ (App Router)
**Authentication**: Supabase Auth
**Database**: Supabase Postgres
**Hosting**: Vercel
**Language**: TypeScript (strict mode)

**Required Dependencies**:
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Server-side Supabase helpers for Next.js

**Database Schema Requirements**:
- `profiles` table: `id` (uuid, FK to auth.users), `username` (unique), `created_at`
- `starters` table: `user_id` (uuid, unique, FK to profiles), `pokemon_id` (integer, unique), `claimed_at`

## Development Workflow

**Branch Strategy**: Feature branches merged to `main` via pull request

**Testing Requirements**:
- Ownership constraint logic MUST have integration tests
- API endpoints MUST have contract tests validating response shapes
- Authentication flows SHOULD be tested with Supabase local emulator

**Code Quality**:
- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Prettier for formatting

**Deployment**:
- Vercel auto-deploys from `main` branch
- Preview deployments for pull requests
- Environment variables managed via Vercel dashboard

## Governance

This constitution supersedes all other development practices for the Pokemon Starter
Selector project. All features, bug fixes, and refactors MUST comply with these
principles.

**Amendment Process**:
1. Propose changes via pull request to this file
2. Document rationale for changes
3. Update version according to semantic versioning:
   - MAJOR: Principle removal or backward-incompatible redefinition
   - MINOR: New principle added or material expansion
   - PATCH: Clarifications, typos, non-semantic refinements
4. Update dependent templates if principles affect their structure

**Compliance Review**:
- All pull requests SHOULD reference applicable principles
- Constitution violations MUST be flagged in code review
- Complexity beyond these principles MUST be justified in writing

**Version**: 1.0.0 | **Ratified**: 2026-01-07 | **Last Amended**: 2026-01-07
