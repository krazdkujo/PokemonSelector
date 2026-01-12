# Feature Specification: Pokecenter API Sorting and Documentation Update

**Feature Branch**: `011-pokecenter-api-sorting`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Update the pokecenter API to list pokemon in order they were caught showing the most recent first. Ensure this is updated in the API documentation and replace the generic or local host references with the live vercel link since hosting is up. https://pokemon-selector-rctq.vercel.app/"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Recently Caught Pokemon First (Priority: P1)

As a trainer using the Pokecenter API, I want to see my most recently caught Pokemon at the top of the list so I can quickly access and manage my newest captures without scrolling through my entire collection.

**Why this priority**: This is the core functionality change requested. Trainers catching new Pokemon will want to see their latest catches prominently displayed, improving the user experience for active players.

**Independent Test**: Can be fully tested by calling the Pokecenter API after catching multiple Pokemon and verifying the response order shows most recent catches first.

**Acceptance Scenarios**:

1. **Given** a trainer has caught Pokemon on different dates, **When** they call GET /api/pokecenter, **Then** the Pokemon array is ordered with the most recently captured Pokemon first.
2. **Given** a trainer catches a new Pokemon, **When** they immediately call GET /api/pokecenter, **Then** the newly caught Pokemon appears at the top of the list.
3. **Given** a trainer has only a starter Pokemon (no captured Pokemon), **When** they call GET /api/pokecenter, **Then** the starter Pokemon is returned in the list.

---

### User Story 2 - Access API with Live Documentation (Priority: P2)

As a developer integrating with the Pokemon Selector API, I want the documentation to show the actual production URL so I can copy working examples directly without needing to modify placeholder URLs.

**Why this priority**: Documentation accuracy enables developers to integrate faster and reduces support requests. This is essential for the API to be usable in production.

**Independent Test**: Can be tested by reading the API documentation and verifying all URLs point to the live Vercel deployment.

**Acceptance Scenarios**:

1. **Given** a developer reads the API documentation, **When** they view code examples, **Then** all URLs reference `https://pokemon-selector-rctq.vercel.app/` instead of placeholders.
2. **Given** a developer copies a curl example from the documentation, **When** they run it with their API key, **Then** the request goes to the correct production server.

---

### Edge Cases

- What happens when a trainer has no Pokemon? The API returns an empty array.
- What happens when multiple Pokemon have the same capture timestamp? The system maintains consistent ordering using database default behavior.
- What happens when a trainer only has a starter Pokemon with no capture date? Starter Pokemon appear in the list using their creation timestamp.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST return Pokemon in the Pokecenter API ordered by capture date with most recent first (descending order).
- **FR-002**: System MUST maintain the existing response structure and all fields in the Pokecenter API.
- **FR-003**: API documentation MUST use the production URL `https://pokemon-selector-rctq.vercel.app/` in the Base URL section.
- **FR-004**: API documentation MUST update all code examples (curl, Python, JavaScript) to use the production URL.
- **FR-005**: API documentation MUST remove placeholder text that instructs users to "replace with the actual deployment URL."

### Key Entities

- **Pokemon Collection**: The list of Pokemon owned by a trainer, with capture timestamps indicating when each was obtained.
- **API Documentation**: The markdown documentation file describing the API endpoints with code examples.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All Pokecenter API responses return Pokemon sorted by capture date in descending order (most recent first).
- **SC-002**: 100% of URL references in API documentation point to the live production URL.
- **SC-003**: Developers can copy any code example from documentation and execute it without URL modifications.
- **SC-004**: Existing API consumers experience no breaking changes to response structure or field names.

## Assumptions

- The `captured_at` field exists and is populated for all Pokemon in the database.
- Starter Pokemon have a valid timestamp for ordering purposes.
- The production URL `https://pokemon-selector-rctq.vercel.app/` is stable and will remain the canonical URL.
