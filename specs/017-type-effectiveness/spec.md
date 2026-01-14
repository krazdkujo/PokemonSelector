# Feature Specification: Type Effectiveness Reference

**Feature Branch**: `017-type-effectiveness`
**Created**: 2026-01-14
**Status**: Draft
**Input**: User description: "Add in a /types page, endpoint that you can send a request with a type and find out what it is strong and weak against, and update documentation and the change log"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Type Effectiveness Grid (Priority: P1)

As a trainer, I want to view a complete type effectiveness grid showing all Pokemon types and their relationships, so that I can plan battle strategies by understanding which types are strong or weak against others.

**Why this priority**: This is the core visual reference that most users will access. A comprehensive grid provides immediate value for battle planning without needing to look up individual types.

**Independent Test**: Can be fully tested by navigating to the types page and verifying that an 18x18 grid displays with correct effectiveness values (2x, 0.5x, 0x, 1x) for all type combinations.

**Acceptance Scenarios**:

1. **Given** a user is on any page, **When** they navigate to the types page, **Then** they see a grid showing all 18 Pokemon types as both attackers (rows) and defenders (columns)
2. **Given** the type grid is displayed, **When** the user views a cell, **Then** they see the damage multiplier (super effective, not very effective, immune, or neutral) with color coding
3. **Given** the type grid is displayed, **When** the user hovers over or taps a cell, **Then** they see a tooltip explaining the relationship (e.g., "Fire is super effective against Grass")

---

### User Story 2 - Look Up Single Type Effectiveness (Priority: P2)

As a trainer or external developer, I want to query a specific type to see what it is strong against, weak against, and immune to, so that I can quickly reference effectiveness without viewing the entire grid.

**Why this priority**: Provides focused information for users who know what type they want to look up, and enables programmatic access for external integrations.

**Independent Test**: Can be verified by selecting a type from a dropdown or sending an API request and confirming the response lists correct strengths, weaknesses, and immunities.

**Acceptance Scenarios**:

1. **Given** the types page is displayed, **When** the user selects a specific type from a dropdown, **Then** they see a detailed breakdown of that type's offensive and defensive matchups
2. **Given** a valid type name, **When** an API request is made, **Then** the response includes lists of types it is strong against, weak against, and immune to
3. **Given** an invalid type name, **When** an API request is made, **Then** the response returns an appropriate error message

---

### User Story 3 - Update Documentation and Changelog (Priority: P3)

As a maintainer, I want the API documentation and changelog updated to reflect the new types endpoint, so that users and developers can discover and use the new functionality.

**Why this priority**: Documentation is essential for discoverability but depends on the feature being implemented first.

**Independent Test**: Can be verified by checking that the API docs page lists the new endpoint and the changelog includes an entry for this feature.

**Acceptance Scenarios**:

1. **Given** the types API is implemented, **When** a user visits the API documentation page, **Then** they see the new types endpoint with usage examples
2. **Given** the feature is complete, **When** a user visits the changelog, **Then** they see an entry for the type effectiveness feature

---

### Edge Cases

- What happens when a user searches for a type that doesn't exist? Display "Type not found" message with suggestion to check spelling.
- How does the grid handle mobile/small screens? Implement horizontal scrolling or a condensed view.
- What happens if the API receives no type parameter? Return a list of all available types.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a types page accessible from the main navigation
- **FR-002**: System MUST display an 18x18 grid showing all type matchups (attacking vs defending)
- **FR-003**: Grid cells MUST be color-coded to indicate effectiveness (super effective, not very effective, immune, neutral)
- **FR-004**: System MUST provide a type selector to view detailed effectiveness for a single type
- **FR-005**: System MUST provide an API endpoint to query type effectiveness by type name
- **FR-006**: API endpoint MUST return strongAgainst, weakAgainst, and immuneTo arrays for the queried type
- **FR-007**: API endpoint MUST return an error response for invalid type names
- **FR-008**: System MUST update the API documentation page to include the new endpoint
- **FR-009**: System MUST add an entry to the changelog for this feature
- **FR-010**: Grid MUST support mobile viewing (horizontal scroll or responsive layout)

### Key Entities

- **PokemonType**: One of 18 types (Normal, Fire, Water, Electric, Grass, Ice, Fighting, Poison, Ground, Flying, Psychic, Bug, Rock, Ghost, Dragon, Dark, Steel, Fairy)
- **TypeEffectiveness**: The relationship between an attacking type and defending type, expressed as a multiplier (0x, 0.5x, 1x, 2x)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access the types page within 2 clicks from any page in the application
- **SC-002**: Type effectiveness grid loads and displays within 2 seconds
- **SC-003**: Users can identify the effectiveness of any type combination within 5 seconds using the grid
- **SC-004**: API endpoint returns type effectiveness data within 500ms
- **SC-005**: 100% of the 18 Pokemon types are represented in the grid and API
- **SC-006**: API documentation includes complete endpoint specification with examples

## Assumptions

- The 18 standard Pokemon types are used (matching existing type-chart.ts data)
- Type effectiveness data already exists in the codebase and does not need to be created
- The types page is publicly accessible (no authentication required)
- Color coding follows common conventions: green for super effective, red for not very effective, black/gray for immune
- The API endpoint follows RESTful conventions consistent with existing endpoints
- Changelog uses the existing changelog.json format
