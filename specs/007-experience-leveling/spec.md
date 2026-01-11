# Feature Specification: Experience and Leveling System

**Feature Branch**: `007-experience-leveling`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Create a plan to implement a simple experience and leveling system. Pokemon that are defeated in combat grant experience equal to the level difference between the players pokemon and themselves to a minimum of 1. The experience required to level is your current level times two plus 10 experience to create a curve. We need to fix the move system to allow for all moves available for a pokemon in the move selector regardless of level."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Gaining Experience from Battle (Priority: P1)

After winning a battle against a wild Pokemon, the player's active Pokemon gains experience points based on the level difference. This creates a sense of progression and rewards players for successful combat encounters.

**Why this priority**: Experience gain is the core mechanic that drives the entire leveling system. Without this, there is no progression to implement.

**Independent Test**: Can be fully tested by completing a battle and verifying the player Pokemon's experience value increases. Delivers immediate value by creating measurable progress after each victory.

**Acceptance Scenarios**:

1. **Given** a player with a level 5 Pokemon defeats a level 8 wild Pokemon, **When** the battle ends in victory, **Then** the player Pokemon gains 3 experience points (8 - 5 = 3).
2. **Given** a player with a level 7 Pokemon defeats a level 4 wild Pokemon, **When** the battle ends in victory, **Then** the player Pokemon gains 1 experience point (minimum, since 4 - 7 = -3).
3. **Given** a player with a level 5 Pokemon defeats a level 5 wild Pokemon, **When** the battle ends in victory, **Then** the player Pokemon gains 1 experience point (minimum, since 5 - 5 = 0).
4. **Given** a player loses a battle (wild Pokemon wins), **When** the battle ends, **Then** no experience is gained.

---

### User Story 2 - Leveling Up (Priority: P1)

When a Pokemon accumulates enough experience points, it automatically levels up. The experience curve is calculated as: required XP = (current level * 2) + 10.

**Why this priority**: Leveling up is the reward for accumulated experience and directly tied to the experience gain system. Both are essential for a functional progression system.

**Independent Test**: Can be tested by accumulating experience until the threshold is reached and verifying the level increases. Delivers value by showing tangible power growth.

**Acceptance Scenarios**:

1. **Given** a level 1 Pokemon with 11 experience points (requirement: 1*2+10 = 12), **When** 1 more experience is gained, **Then** the Pokemon levels up to level 2 and experience resets appropriately.
2. **Given** a level 5 Pokemon (requirement: 5*2+10 = 20 XP), **When** the Pokemon accumulates 20 experience points, **Then** the Pokemon levels up to level 6.
3. **Given** a level 10 Pokemon (max level), **When** experience is gained, **Then** experience is still tracked but no level up occurs.
4. **Given** a Pokemon gains enough experience to level up multiple times at once, **When** the experience is applied, **Then** all applicable level ups occur in sequence.

---

### User Story 3 - Viewing Experience Progress (Priority: P2)

Players can see their Pokemon's current experience points and how many more are needed to reach the next level. This provides visibility into progression.

**Why this priority**: While not essential for the mechanic to function, progress visibility significantly improves user experience and motivation.

**Independent Test**: Can be tested by viewing Pokemon details and confirming experience values display correctly. Delivers value by making progression transparent to users.

**Acceptance Scenarios**:

1. **Given** a player views their Pokemon's details, **When** the Pokemon has experience points, **Then** current XP and XP needed for next level are displayed.
2. **Given** a level 10 Pokemon (max level), **When** viewing details, **Then** experience is shown as "MAX" or equivalent indicator.

---

### User Story 4 - All Moves Available in Move Selector (Priority: P2)

When selecting moves for a Pokemon, players can choose from ALL moves that Pokemon can learn, regardless of the Pokemon's current level. This removes the level-based move restriction.

**Why this priority**: This is a separate fix to an existing limitation. It improves player experience but is independent of the XP system.

**Independent Test**: Can be tested by opening the move selector for any Pokemon and verifying all learnable moves are shown regardless of level. Delivers value by giving players full control over their Pokemon's moveset.

**Acceptance Scenarios**:

1. **Given** a level 1 Pokemon that can learn moves at levels 1, 2, 6, 10, 14, and 18, **When** the player opens the move selector, **Then** ALL moves from all level tiers are available for selection.
2. **Given** an evolved Pokemon, **When** the player opens the move selector, **Then** moves inherited from pre-evolutions are also available.
3. **Given** any Pokemon at any level, **When** selecting moves, **Then** the player can choose any 4 moves from the complete available pool.

---

### Edge Cases

- What happens when a Pokemon gains massive amounts of XP (enough for multiple level-ups)?
  - All level-ups should process sequentially until XP is depleted or max level is reached.
- How does system handle level 10 (max level) Pokemon gaining XP?
  - XP can be tracked but has no effect; level remains at 10.
- What happens if a Pokemon levels up mid-battle?
  - Level up is applied after battle completion, not during active combat.
- What if experience calculation results in a negative number?
  - Minimum experience gain is always 1 for any victory.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST calculate experience gained as: `max(1, wildPokemonLevel - playerPokemonLevel)` when player wins a battle.
- **FR-002**: System MUST calculate experience required to level up as: `(currentLevel * 2) + 10`.
- **FR-003**: System MUST automatically level up a Pokemon when accumulated experience meets or exceeds the requirement.
- **FR-004**: System MUST reset or carry over excess experience after leveling up.
- **FR-005**: System MUST NOT allow Pokemon to exceed level 10 (existing max level constraint).
- **FR-006**: System MUST persist experience points and level changes to the database.
- **FR-007**: System MUST display current experience and experience needed for next level in Pokemon details.
- **FR-008**: System MUST show ALL available moves for a Pokemon in the move selector, regardless of current level.
- **FR-009**: System MUST allow players to select any 4 moves from the complete available move pool.
- **FR-010**: System MUST only grant experience upon battle victory (player_wins = 3).
- **FR-011**: System MUST support multiple level-ups if experience gained exceeds multiple thresholds.

### Key Entities

- **Experience**: Numeric value representing accumulated progress toward next level. Stored per owned Pokemon.
- **Level**: Current power level of a Pokemon (1-10). Determines stat bonuses in battle calculations.
- **Experience Threshold**: Calculated value for level-up requirement. Formula: (level * 2) + 10.
- **Available Moves**: Complete set of moves a Pokemon can learn, independent of current level.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players receive experience points after every victorious battle encounter.
- **SC-002**: Pokemon level up correctly when experience thresholds are met.
- **SC-003**: Experience progress is visible to players in Pokemon details view.
- **SC-004**: Move selector displays all available moves regardless of Pokemon level.
- **SC-005**: Level progression follows the defined curve: Level 1->2 requires 12 XP, Level 5->6 requires 20 XP, Level 9->10 requires 28 XP.
- **SC-006**: No experience is granted for lost battles or fled encounters.

## Assumptions

- Experience is granted at battle end, not during battle rounds.
- Excess experience after leveling carries over to the next level (not lost).
- The existing level cap of 10 remains unchanged.
- Experience values are integers (no fractional XP).
- The level-based move restriction was an intentional limitation that is now being removed by design decision.
