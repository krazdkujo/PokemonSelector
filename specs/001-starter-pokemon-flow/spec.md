# Feature Specification: Starter Pokemon Selection Flow

**Feature Branch**: `001-starter-pokemon-flow`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Set up initial project functionality. Login screen with just a name, then taken to a screen that filters pokemon by type to select a starter pokemon, then taken to a dashboard."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Name Entry and Login (Priority: P1)

A new user arrives at the application and enters their name to begin their Pokemon journey. The login is simple - just a name field with no password or complex authentication required.

**Why this priority**: This is the entry point to the entire application. Without a working login flow, users cannot access any other functionality.

**Independent Test**: Can be fully tested by entering a name and verifying the user is recognized and can proceed. Delivers immediate value by establishing user identity.

**Acceptance Scenarios**:

1. **Given** a user on the login screen, **When** they enter a valid name (1-20 characters) and submit, **Then** they are taken to the Pokemon selection screen
2. **Given** a user on the login screen, **When** they attempt to submit with an empty name field, **Then** they see a validation message prompting them to enter a name
3. **Given** a user on the login screen, **When** they enter a name with only whitespace, **Then** they see a validation message prompting them to enter a valid name

---

### User Story 2 - Filter and Select Starter Pokemon (Priority: P1)

After logging in, the user can browse available Pokemon filtered by type. They can select one Pokemon as their starter to begin their journey.

**Why this priority**: This is the core feature of the application - selecting a starter Pokemon. It provides the primary value proposition.

**Independent Test**: Can be fully tested by displaying the Pokemon list, filtering by type, and selecting a Pokemon. Delivers value by allowing users to make their starter choice.

**Acceptance Scenarios**:

1. **Given** a logged-in user on the Pokemon selection screen, **When** the page loads, **Then** they see a list of available Pokemon and type filter options
2. **Given** a user viewing the Pokemon list, **When** they select a type filter (e.g., Fire, Water, Grass), **Then** the list updates to show only Pokemon of that type
3. **Given** a user viewing filtered Pokemon, **When** they select "All Types" or clear the filter, **Then** all available Pokemon are displayed again
4. **Given** a user viewing the Pokemon list, **When** they click on a Pokemon to select it as their starter, **Then** they are prompted to confirm their selection
5. **Given** a user who has confirmed their starter selection, **When** the confirmation is complete, **Then** they are taken to the dashboard

---

### User Story 3 - View Dashboard with Selected Starter (Priority: P2)

After selecting a starter Pokemon, the user arrives at their personal dashboard where they can see their chosen Pokemon and their trainer name.

**Why this priority**: The dashboard is the destination after the core flow is complete. It provides closure to the selection process and displays the user's choice.

**Independent Test**: Can be fully tested by displaying the dashboard with the user's name and selected Pokemon. Delivers value by confirming the user's selection and providing a "home base."

**Acceptance Scenarios**:

1. **Given** a user who has selected a starter Pokemon, **When** they arrive at the dashboard, **Then** they see their trainer ID and trainer name displayed
2. **Given** a user on the dashboard, **When** they view their Pokemon section, **Then** they see their selected starter Pokemon with its name, image, and type
3. **Given** a user on the dashboard, **When** they need to use the API, **Then** they can copy their trainer ID for external use
4. **Given** a user on the dashboard, **When** they want to start over, **Then** they can log out and return to the login screen

---

### Edge Cases

- What happens when a user refreshes the page during Pokemon selection? (Session state should persist)
- How does the system handle a user navigating directly to the dashboard without selecting a Pokemon? (Redirect to Pokemon selection)
- What happens if the Pokemon data fails to load? (Show a user-friendly error with retry option)
- How does the system handle a user navigating back to selection after choosing a starter? (Redirect to dashboard - selection is final)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a login/registration screen with a single name input field
- **FR-001a**: System MUST create a new Trainer record in the database when a name is submitted
- **FR-002**: System MUST validate that the name field is not empty and contains at least 1 non-whitespace character
- **FR-003**: System MUST limit trainer names to 20 characters maximum
- **FR-004**: System MUST display available Pokemon with their name, image, and type on the selection screen
- **FR-005**: System MUST provide type filter options for all Pokemon types present in the available Pokemon data
- **FR-006**: System MUST filter the Pokemon list in real-time when a type filter is selected
- **FR-007**: System MUST allow users to clear the type filter to show all Pokemon
- **FR-008**: System MUST display a confirmation prompt when a user selects a Pokemon as their starter
- **FR-008a**: System MUST NOT allow changing starter Pokemon after confirmation (selection is final)
- **FR-009**: System MUST persist the user's name and selected Pokemon to the database (Supabase)
- **FR-010**: System MUST display the trainer ID, trainer name, and selected starter Pokemon on the dashboard
- **FR-011**: System MUST provide a logout option that returns the user to the login screen
- **FR-012**: System MUST redirect users to the appropriate screen based on their progress (login → selection → dashboard)
- **FR-013**: System MUST expose trainer data via API for external consumption (lookup by trainer ID)
- **FR-014**: System MUST support two roles: Trainer (default) and Admin
- **FR-014a**: Admin role MUST be assigned manually via database (no in-app role assignment)
- **FR-015**: Admin role MUST be able to view all trainers and their selected Pokemon

### Key Entities

- **Trainer**: Represents the user; stored in Supabase database with id (auto-generated), name (string, 1-20 characters), role (Trainer or Admin, default: Trainer), selected starter Pokemon reference, and timestamps
- **Pokemon**: Represents a selectable Pokemon; has a name, image/sprite reference, and type(s); sourced from project data

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the entire flow (login → select Pokemon → view dashboard) in under 2 minutes
- **SC-002**: 95% of users successfully enter a valid name on first attempt
- **SC-003**: Pokemon list filtering updates within 500ms of selecting a type filter
- **SC-004**: Users can identify their selected starter Pokemon on the dashboard within 5 seconds of arriving
- **SC-005**: The application maintains user data persistently in the database across sessions and devices

## Assumptions

- Pokemon data (names, types, images/sprites) is already available or will be sourced from existing data files in the project
- The available Pokemon for starter selection will come from the project's Pokemon data set
- The dashboard is the final destination in the initial flow; additional dashboard features may be added in future iterations
- This is a hidden endpoint for classroom use; security/authentication is not a concern

## Clarifications

### Session 2026-01-07

- Q: What authentication method should be used with Supabase? → A: Skip auth entirely; when a user enters a name, create a new database entry for that trainer (no authentication required - hidden classroom endpoint)
- Q: What RBAC roles are needed? → A: Two roles - Trainer (regular users) and Admin (can view all trainer information)
- Q: How should Admin access be granted? → A: Manual database flag (set role directly in Supabase)
- Q: Should duplicate trainer names be allowed? → A: Yes, duplicates allowed; the unique trainer ID (displayed on dashboard) is the identifier used for API calls
- Q: Can trainers change their starter Pokemon after selection? → A: No, selection is final
