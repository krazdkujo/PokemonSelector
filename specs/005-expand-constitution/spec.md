# Feature Specification: Expand Constitution for Pokemon Battle and Capture System

**Feature Branch**: `005-expand-constitution`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Expand the Pokemon Starter Selector constitution to support a full MIT Pokemon Automation and Gameplay Application with battle, capture, and automation capabilities."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - First-Time User Selects Starter and Reaches Dashboard (Priority: P1)

A new MIT student logs in for the first time, selects their starter Pokemon from available options (SR 1/2 or lower), and lands on their dashboard showing their new Pokemon and initial resources.

**Why this priority**: This is the entry point for all users. Without starter selection and dashboard access, no other gameplay is possible.

**Independent Test**: Can be fully tested by creating a new account, selecting a starter, and verifying the dashboard displays the chosen Pokemon with correct initial stats.

**Acceptance Scenarios**:

1. **Given** a user has never logged in before, **When** they complete authentication, **Then** they are presented with a starter selection screen showing only Pokemon with SR 1/2 or lower.
2. **Given** a user is on the starter selection screen, **When** they choose a Pokemon, **Then** that Pokemon becomes their active Pokemon and they are redirected to the dashboard.
3. **Given** a user has previously selected a starter, **When** they log in, **Then** they are taken directly to their dashboard without seeing starter selection.

---

### User Story 2 - User Initiates and Completes a Battle Encounter (Priority: P2)

A returning user navigates to the battle endpoint, selects a difficulty level, encounters a wild Pokemon, and completes combat through the round-based system until one side wins.

**Why this priority**: Battles are the core gameplay loop. Users need to encounter wild Pokemon to progress, level up, and attempt captures.

**Independent Test**: Can be fully tested by initiating a battle, completing 3-5 rounds, and verifying the winner is correctly determined based on total successes.

**Acceptance Scenarios**:

1. **Given** a user is on the dashboard, **When** they navigate to the battle endpoint and select "Normal" difficulty, **Then** they encounter a wild Pokemon at a level matching their active Pokemon.
2. **Given** a battle is in progress, **When** a round is resolved, **Then** the system calculates the winner based on level differential, SR differential, type advantages, and STAB bonuses.
3. **Given** either participant has accumulated three round wins, **When** the round concludes, **Then** the battle ends and the winner is declared.

---

### User Story 3 - User Attempts to Capture a Wild Pokemon (Priority: P3)

During a battle, after winning rounds, a user attempts to capture the wild Pokemon using the DC-based capture system.

**Why this priority**: Capture allows users to expand their Pokemon collection, which is essential for long-term gameplay and strategic variety.

**Independent Test**: Can be fully tested by winning rounds in battle, attempting capture, and verifying the DC calculation and success/failure logic.

**Acceptance Scenarios**:

1. **Given** a user has won at least one round in battle, **When** they attempt capture, **Then** the base DC of 15 is adjusted by level difference and SR difference.
2. **Given** a user has won two rounds, **When** they attempt capture, **Then** the DC is reduced by 6 (3 per round won).
3. **Given** a capture attempt fails, **When** the system processes the result, **Then** it counts as a round loss for the player and there is a chance the wild Pokemon flees.
4. **Given** a wild Pokemon flees or the player accumulates three failures/losses, **When** the battle state is evaluated, **Then** the wild Pokemon wins the encounter.

---

### User Story 4 - User Manages Pokemon at Pokecenter (Priority: P4)

A user with multiple captured Pokemon visits the Pokecenter page to swap their active Pokemon.

**Why this priority**: Pokemon management enables strategic choice and variety, but requires capture functionality to be meaningful.

**Independent Test**: Can be fully tested by having multiple Pokemon in collection, visiting Pokecenter, and swapping active Pokemon.

**Acceptance Scenarios**:

1. **Given** a user has multiple Pokemon in their collection, **When** they visit the Pokecenter page, **Then** they see all their Pokemon and can select one to make active.
2. **Given** a user is in an active battle, **When** they try to swap Pokemon, **Then** the system prevents swapping until the battle ends.
3. **Given** a user selects a different Pokemon as active, **When** the swap completes, **Then** the dashboard reflects the newly active Pokemon.

---

### User Story 5 - User Interacts via External API with Secret Key (Priority: P5)

A user retrieves their secret key from the dashboard and uses it to interact with gameplay endpoints programmatically.

**Why this priority**: API access enables automation and experimentation, which is the unique value proposition for MIT students, but requires core gameplay to exist first.

**Independent Test**: Can be fully tested by generating a secret key, making authenticated API requests, and verifying correct JSON responses.

**Acceptance Scenarios**:

1. **Given** a user is on their dashboard, **When** they request a secret key, **Then** a unique key is generated and displayed.
2. **Given** a user has a secret key, **When** they make an API request to any gameplay endpoint, **Then** the request is authenticated and returns structured JSON.
3. **Given** a user's key has been compromised, **When** they regenerate their key from the dashboard, **Then** the old key is invalidated and a new one is issued.
4. **Given** a request is made without a valid secret key, **When** the endpoint processes the request, **Then** it returns an authentication error.

---

### User Story 6 - User Configures Pokemon Moves (Priority: P6)

A user selects four moves from their active Pokemon's available moveset.

**Why this priority**: Move selection affects combat outcomes through STAB bonuses, adding strategic depth after core systems are in place.

**Independent Test**: Can be fully tested by viewing available moves, selecting four, and verifying they are used in subsequent battles.

**Acceptance Scenarios**:

1. **Given** a user views their active Pokemon, **When** they access move configuration, **Then** they see all moves available to that Pokemon's current evolutionary form.
2. **Given** a Pokemon has evolved, **When** the user views available moves, **Then** moves from both the current form and previous forms are available.
3. **Given** a user selects four moves, **When** they save the configuration, **Then** those moves are used in subsequent battles.

---

### Edge Cases

- What happens when a user tries to battle with no active Pokemon? (Should not be possible if starter selection is enforced)
- How does the system handle a tie in round calculations? (Apply tiebreaker rules or random resolution)
- What happens if a user's only Pokemon faints/loses? (They retain the Pokemon but may need to heal at Pokecenter)
- How does the system handle concurrent capture attempts by multiple users for the same wild encounter? (Each user has their own encounter instance)
- What happens when a user regenerates their API key mid-request? (Current request completes, subsequent requests require new key)

## Requirements *(mandatory)*

### Functional Requirements

#### Authentication and User Management

- **FR-001**: System MUST authenticate all users via Supabase Auth before accessing any functionality.
- **FR-002**: System MUST generate a unique secret key for each user upon first dashboard access.
- **FR-003**: Users MUST be able to regenerate their secret key from the dashboard at any time.
- **FR-004**: System MUST invalidate the previous secret key immediately when a new one is generated.
- **FR-005**: All API endpoints MUST require a valid user secret key for authentication.

#### Starter Selection

- **FR-006**: First-time users MUST be presented with a starter selection screen before accessing the dashboard.
- **FR-007**: System MUST only display Pokemon with Strength Rating (SR) of 1/2 or lower as starter options.
- **FR-008**: Multiple users MAY select the same starter Pokemon (no global uniqueness constraint).
- **FR-009**: Starter selection is permanent and cannot be changed after initial selection.

#### Dashboard

- **FR-010**: Dashboard MUST display the user's currently active Pokemon with its stats.
- **FR-011**: Dashboard MUST display the user's current money balance.
- **FR-012**: Dashboard MUST display the user's item inventory.
- **FR-013**: Dashboard MUST display overall gameplay statistics.
- **FR-014**: Dashboard MUST provide navigation to battle, Pokecenter, and other gameplay areas.
- **FR-015**: Dashboard MUST display and allow management of the user's secret key.

#### Pokemon Management

- **FR-016**: Users MUST have exactly one active Pokemon at any time.
- **FR-017**: Users MAY own multiple Pokemon in their collection.
- **FR-018**: Users MUST be able to swap their active Pokemon at the Pokecenter.
- **FR-019**: System MUST prevent Pokemon swapping during an active battle.
- **FR-020**: All Pokemon MUST use a condensed leveling system (levels 1-10).
- **FR-021**: Pokemon with one evolution stage MUST evolve at level 5.
- **FR-022**: Pokemon with two evolution stages MUST evolve at levels 3 and 6.

#### Moves System

- **FR-023**: Each Pokemon MUST have access to all moves available to its current evolutionary form.
- **FR-024**: Evolved Pokemon MUST retain access to moves from previous evolutionary forms.
- **FR-025**: Users MUST be able to select exactly four moves for their active Pokemon's moveset.
- **FR-026**: Moves are descriptive only and do not have individual damage values.

#### Battle System

- **FR-027**: System MUST provide a battle endpoint where users encounter wild Pokemon.
- **FR-028**: Battle difficulty MUST determine wild Pokemon level relative to player's active Pokemon:
  - Easy: Wild Pokemon level is below player's Pokemon
  - Normal: Wild Pokemon level matches player's Pokemon
  - Difficult: Wild Pokemon level is above player's Pokemon
- **FR-029**: Combat MUST be resolved in rounds, with each round determining a single winner.
- **FR-030**: Round winner MUST be calculated based on: level differential, SR differential, type advantages, and STAB bonuses.
- **FR-031**: The first participant to reach three round wins MUST win the combat.
- **FR-032**: Combat narration via LLM is OPTIONAL and does not affect mechanical outcomes.

#### Capture System

- **FR-033**: Base Difficulty Class (DC) to capture a Pokemon MUST be 15.
- **FR-034**: DC MUST be adjusted by level difference (added if target is higher level, subtracted if lower).
- **FR-035**: DC MUST be adjusted by adding the SR difference between target and player Pokemon.
- **FR-036**: Each round won by the player MUST reduce the capture DC by 3.
- **FR-037**: Failed capture attempts MUST count as a round loss for the player.
- **FR-038**: Failed capture attempts MUST have a chance to cause the wild Pokemon to flee.
- **FR-039**: If the wild Pokemon flees, it MUST count as a win for the wild Pokemon.
- **FR-040**: If either side reaches three total successes (round wins + capture failures for the wild side), the combat ends.

#### External API

- **FR-041**: All gameplay endpoints MUST be implemented as serverless functions.
- **FR-042**: All API responses MUST return structured JSON data.
- **FR-043**: API documentation MUST be provided in an industry-standard format.
- **FR-044**: API MUST support automation use cases for MIT students.

### Key Entities

- **User**: Authenticated player with profile, secret key, money, items, and Pokemon collection. Has exactly one active Pokemon.
- **Pokemon (Owned)**: User's captured Pokemon with species, level (1-10), SR, current evolutionary form, selected moves (4), and ownership status (active or stored).
- **Pokemon (Wild)**: Encounter instance with species, level, SR, and type. Generated based on difficulty selection.
- **Move**: Named attack/ability with type. Available moves determined by Pokemon species and evolutionary form.
- **Battle**: Combat session between user's active Pokemon and a wild Pokemon. Tracks round wins for each side and capture attempts.
- **Secret Key**: User-specific authentication token for API access. Can be regenerated.
- **Item**: Consumable or persistent resource owned by user. Types and effects to be defined.
- **Pokecenter**: Location/page where users swap active Pokemon and potentially heal/manage their collection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: New users can complete starter selection and reach their dashboard in under 2 minutes.
- **SC-002**: Users can complete a full battle encounter (3-5 rounds) in under 5 minutes.
- **SC-003**: Users can successfully capture a wild Pokemon within 3 battle encounters on Easy difficulty.
- **SC-004**: API requests with valid secret keys return responses in under 2 seconds.
- **SC-005**: 95% of users successfully complete their first battle within 3 attempts.
- **SC-006**: Users can regenerate their secret key and use it for API access within 30 seconds.
- **SC-007**: System supports at least 100 concurrent users without performance degradation.
- **SC-008**: All API endpoints have documentation accessible to users.
- **SC-009**: Pokemon swapping at Pokecenter completes in under 3 seconds.
- **SC-010**: Battle round calculations are deterministic and reproducible given the same inputs.

## Assumptions

- Pokemon master data (species, types, base SR, available moves, evolution chains) will continue to be loaded from local JSON files bundled with the application.
- The existing Supabase Auth integration will be extended to support the new secret key functionality.
- Money and items are placeholders for future economy features; initial implementation may use default values.
- Wild Pokemon encounters are instanced per-user (no shared world state for encounters).
- The LLM narration, when enabled, will use a third-party API (configuration to be determined during planning).
- Level differences and SR differences are always calculated as absolute values rounded up.
- STAB (Same-Type Attack Bonus) applies when the move type matches the Pokemon's type.

## Constitution Changes Required

This feature requires the following amendments to the project constitution:

1. **Principle I (Unique Ownership)**: Remove unique constraint on `pokemon_id`. Allow users to own multiple Pokemon with exactly one active at a time.
2. **Principle V (API Simplicity)**: Expand to cover all gameplay endpoints. All endpoints require secret key authentication (no public unauthenticated access).
3. **Database Schema**: Expand beyond `profiles` and `starters` to include:
   - User secret keys
   - Pokemon collection (with level, moves, active status)
   - Battle history (optional)
   - Items inventory
   - Money balance
4. **Technology Stack**: Add optional LLM provider dependency for combat narration.
5. **New Principles Needed**:
   - Round-based combat resolution rules
   - Capture DC calculation rules
   - Pokemon leveling and evolution rules
