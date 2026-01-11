# Feature Specification: Combat System Refinement

**Feature Branch**: `008-combat-refinement`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Combat system refinement You should only be able to capture a pokemon if you haven't caught it already, if you have caught it in the past you can only knock it out. Post battle screen should show xp gained, and a levelup screen if relevant. DC should show before the roll so you know what you're trying to hit."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Show DC Before Roll (Priority: P1)

As a trainer in battle, I want to see the Difficulty Class (DC) I need to hit before my attack roll is revealed, so I can understand what I'm trying to achieve and feel the tension of the roll.

**Why this priority**: This is the most immediate UX improvement that affects every single battle round. Players need to understand the mechanics and feel engaged with each roll.

**Independent Test**: Start any battle, select a move, and verify the DC is displayed before the roll result is shown.

**Acceptance Scenarios**:

1. **Given** an active battle, **When** the player selects a move, **Then** the DC required to hit is displayed before revealing the roll result
2. **Given** an active battle with type advantages, **When** the player selects a super-effective move, **Then** the DC shown reflects the adjusted difficulty (lower DC for advantageous matchups)
3. **Given** the DC and roll are displayed, **When** viewing the round result, **Then** the player can clearly see both values and understand if they succeeded or failed

---

### User Story 2 - Post-Battle XP Display (Priority: P1)

As a trainer completing a battle, I want to see a summary screen showing the XP gained by my Pokemon, so I can track my progress and feel rewarded for my efforts.

**Why this priority**: Immediate feedback on progression is essential for player engagement. This ties directly into the existing XP system.

**Independent Test**: Win or lose a battle and verify the post-battle screen displays XP gained.

**Acceptance Scenarios**:

1. **Given** a battle that ends in victory, **When** the post-battle screen appears, **Then** it displays the XP awarded to the player's Pokemon
2. **Given** a battle that ends in defeat, **When** the post-battle screen appears, **Then** it displays the consolation XP (1 XP) awarded
3. **Given** a battle that ends in capture, **When** the post-battle screen appears, **Then** it displays the capture success and any XP gained
4. **Given** the post-battle screen, **When** XP is displayed, **Then** it shows previous XP, XP gained, and new total XP

---

### User Story 3 - Level-Up Notification (Priority: P2)

As a trainer whose Pokemon levels up after a battle, I want to see a celebratory level-up notification, so I can appreciate my Pokemon's growth and understand the progression.

**Why this priority**: Enhances the reward feeling but depends on XP display being implemented first.

**Independent Test**: Win enough battles to accumulate XP for a level-up and verify the level-up screen appears.

**Acceptance Scenarios**:

1. **Given** a battle victory that results in a level-up, **When** the post-battle screen appears, **Then** a level-up notification is prominently displayed
2. **Given** a level-up occurs, **When** viewing the notification, **Then** it shows the previous level and new level
3. **Given** multiple level-ups occur (from large XP gain), **When** viewing the notification, **Then** it shows all levels gained (e.g., "Level 3 -> Level 5!")
4. **Given** no level-up occurs, **When** the post-battle screen appears, **Then** no level-up notification is shown (only XP progress)

---

### User Story 4 - Capture Restriction for Owned Pokemon (Priority: P2)

As a trainer who has already caught a specific Pokemon species, I want the game to prevent me from attempting to capture duplicates, so I'm encouraged to catch new species and build a diverse collection.

**Why this priority**: Adds strategic depth and prevents collection bloat. Ties into the existing capture and collection systems.

**Independent Test**: Encounter a Pokemon species you already own and verify capture is disabled.

**Acceptance Scenarios**:

1. **Given** a battle with a wild Pokemon species the player already owns, **When** viewing battle options, **Then** the capture option is disabled or hidden
2. **Given** a battle with a wild Pokemon species the player already owns, **When** hovering over/viewing the disabled capture option, **Then** a message explains "Already caught - can only knock out"
3. **Given** a battle with a wild Pokemon species the player does NOT own, **When** viewing battle options, **Then** the capture option is available as normal
4. **Given** the player defeats a Pokemon they already own, **When** the battle ends, **Then** it ends as a knockout victory (not capture)

---

### Edge Cases

- What happens when a player's first Pokemon of a species faints/is released, then they encounter that species again? (They should be able to capture it again - ownership check is based on current collection)
- How does the DC display handle very high or very low DCs (e.g., DC 1 or DC 20)?
- What happens if a Pokemon levels up to max level (10)? (Show "MAX LEVEL" instead of level-up animation)
- What if the player has multiple Pokemon of the same species from different sources (starter, capture)? (Still counts as owned - no duplicate captures allowed)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display the DC (Difficulty Class) for a move before revealing the roll result
- **FR-002**: System MUST show DC in a clear, prominent position during battle round resolution
- **FR-003**: System MUST display a post-battle summary screen after every battle conclusion
- **FR-004**: Post-battle screen MUST show XP gained (including 0 XP for fled/captured without XP scenarios)
- **FR-005**: Post-battle screen MUST show previous XP, XP gained, and new XP total
- **FR-006**: System MUST display a level-up notification when a Pokemon gains one or more levels
- **FR-007**: Level-up notification MUST show previous level and new level
- **FR-008**: Level-up notification MUST handle multi-level gains (display range, e.g., "3 -> 5")
- **FR-009**: System MUST check if player already owns the wild Pokemon's species before allowing capture
- **FR-010**: System MUST disable/hide capture option when battling an already-owned species
- **FR-011**: System MUST display explanatory message when capture is unavailable due to ownership
- **FR-012**: System MUST allow capture for species not currently in player's collection

### Key Entities

- **Battle Round Result**: Contains DC, roll value, success/failure, move used - now with explicit DC display timing
- **Post-Battle Summary**: New concept - aggregates battle outcome, XP changes, level changes for display
- **Pokemon Collection**: Player's owned Pokemon - used to check species ownership for capture eligibility
- **Level-Up Event**: Triggered when XP threshold is crossed - includes previous level, new level, levels gained

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Players can see the DC before the roll in 100% of battle rounds
- **SC-002**: Post-battle screen displays XP information within 1 second of battle conclusion
- **SC-003**: Level-up notification is displayed for 100% of level-up events
- **SC-004**: Capture option is correctly disabled for 100% of battles against already-owned species
- **SC-005**: Players understand why capture is disabled (via tooltip/message) when battling owned species

## Assumptions

- The existing XP and leveling system (from 007-experience-leveling) is implemented and working
- Pokemon ownership is tracked by species ID (pokemon_id), not individual Pokemon instance
- The battle UI already shows roll results - this feature adds DC display before the roll reveal
- The current post-battle screen is minimal - this enhances it with progression information
- Max level is 10, and level-up notifications handle this edge case appropriately
