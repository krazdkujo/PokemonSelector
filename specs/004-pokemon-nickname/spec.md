# Feature Specification: Pokemon Nickname

**Feature Branch**: `004-pokemon-nickname`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Add the ability for players to nickname their pokemon. This needs to be updated in the database and sent in the API payload, update the docs\API.md"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Nickname Pokemon After Selection (Priority: P1)

A trainer who has already selected their starter Pokemon wants to give it a personal nickname to make it feel more their own. The trainer navigates to their Pokemon view and enters a nickname for their Pokemon.

**Why this priority**: This is the core functionality that delivers the primary user value - personalization of the trainer's Pokemon experience. Without this, the feature has no value.

**Independent Test**: Can be fully tested by having a trainer with a selected Pokemon add a nickname and verifying it persists and displays correctly.

**Acceptance Scenarios**:

1. **Given** a trainer has selected a starter Pokemon and has no nickname set, **When** they enter a nickname and save it, **Then** the nickname is saved and displayed alongside the Pokemon's species name.

2. **Given** a trainer has a Pokemon with a nickname, **When** they view their trainer profile or Pokemon details, **Then** both the nickname and the species name are displayed.

3. **Given** a trainer enters a nickname, **When** the nickname is valid (meets character requirements), **Then** the system accepts and saves the nickname.

---

### User Story 2 - Change Existing Nickname (Priority: P2)

A trainer who previously nicknamed their Pokemon wants to change the nickname to something different.

**Why this priority**: Supports user flexibility and correcting mistakes, but requires P1 to be implemented first.

**Independent Test**: Can be tested by having a trainer with an existing nickname change it to a new value and verifying the update persists.

**Acceptance Scenarios**:

1. **Given** a trainer has a Pokemon with an existing nickname, **When** they edit the nickname and save a new value, **Then** the old nickname is replaced with the new one.

2. **Given** a trainer has a Pokemon with an existing nickname, **When** they clear the nickname field and save, **Then** the nickname is removed and only the species name is displayed.

---

### User Story 3 - View Nickname via External API (Priority: P2)

External applications (such as student projects) that query the trainer API need to receive the Pokemon's nickname along with other Pokemon data.

**Why this priority**: Enables integration with external systems, which is explicitly requested in the user requirements. Equal priority to P2 as it's a parallel concern.

**Independent Test**: Can be tested by making an API request for a trainer with a nicknamed Pokemon and verifying the nickname is included in the response.

**Acceptance Scenarios**:

1. **Given** a trainer has a Pokemon with a nickname, **When** the external API is queried for that trainer, **Then** the response includes the nickname field with the nickname value.

2. **Given** a trainer has a Pokemon without a nickname, **When** the external API is queried for that trainer, **Then** the response includes the nickname field as null.

3. **Given** a trainer has no Pokemon selected, **When** the external API is queried, **Then** the pokemon object is null (existing behavior unchanged).

---

### Edge Cases

- What happens when a trainer enters a nickname that is only whitespace? The system should reject it and treat it as no nickname.
- What happens when a trainer enters special characters or emoji in a nickname? The system should allow letters, numbers, spaces, and common punctuation.
- What happens when a trainer tries to nickname a Pokemon they don't have? The system should prevent this action.
- What happens when a nickname exceeds the maximum length? The system should prevent entry beyond the limit.
- What happens when a trainer changes their Pokemon selection? The nickname should be cleared since it belonged to the previous Pokemon.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow trainers to set a nickname for their selected Pokemon.
- **FR-002**: System MUST allow trainers to update an existing nickname.
- **FR-003**: System MUST allow trainers to remove a nickname (set to empty/null).
- **FR-004**: System MUST persist the nickname in the trainer's record.
- **FR-005**: System MUST validate that nicknames are between 1 and 20 characters when provided.
- **FR-006**: System MUST trim leading and trailing whitespace from nicknames.
- **FR-007**: System MUST reject nicknames that are only whitespace.
- **FR-008**: System MUST display the nickname alongside the Pokemon's species name when a nickname exists.
- **FR-009**: System MUST include the nickname field in the external API response for trainer data.
- **FR-010**: System MUST clear the nickname when a trainer changes their Pokemon selection.
- **FR-011**: System MUST only allow trainers to nickname their own Pokemon.

### Key Entities

- **Trainer**: Extended with an optional nickname field that stores the personalized name for their Pokemon (1-20 characters, nullable).
- **Pokemon**: Unchanged - the species name comes from static Pokemon data, not the database.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trainers can set, update, or remove a nickname for their Pokemon within 5 seconds of interaction.
- **SC-002**: 100% of valid nickname changes are persisted and retrievable across sessions.
- **SC-003**: External API consumers receive the nickname field in all trainer responses that include Pokemon data.
- **SC-004**: API documentation accurately reflects the new nickname field with examples.
- **SC-005**: Users can distinguish between a Pokemon's nickname and its species name in the interface.

## Assumptions

- Nicknames are limited to 20 characters to match the existing trainer name constraint for UI consistency.
- Nicknames are optional - trainers are not required to set one.
- Nicknames are case-sensitive and stored as entered (after trimming whitespace).
- The nickname belongs to the trainer-Pokemon relationship, not to a specific Pokemon instance globally.
- When a trainer selects a new Pokemon, their previous nickname does not carry over.
