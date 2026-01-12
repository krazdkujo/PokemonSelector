# Feature Specification: Pokemon Evolution System

**Feature Branch**: `012-pokemon-evolution`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "Add in a leveling system. Pokemon should trigger a level when they reach the required level and be asked if they'd like to level up at combat end during level up or in the pokecenter by pressing level up. When they level up they have what moves they know at that time and all the new moves available for the new evolutionary level and the pokemon evolves."

## Clarifications

### Session 2026-01-11

- Q: What are the evolution level thresholds? -> A: Pokemon with one evolution (2-stage) evolve at level 5. Pokemon with two evolutions (3-stage) evolve at levels 3 and 6. Pokecenter evolution is available at any time once the level threshold is reached.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Evolve Pokemon After Battle Victory (Priority: P1)

As a trainer, after winning a battle where my Pokemon levels up to an evolution threshold, I want to be prompted to evolve my Pokemon so I can choose whether to evolve immediately or defer the decision.

**Why this priority**: This is the core evolution trigger - the natural moment when trainers expect evolution to occur, matching the classic Pokemon game experience.

**Independent Test**: Win a battle with a Pokemon at level 2 (one level below evolution threshold of 3 for 3-stage Pokemon), gain enough XP to reach level 3, and verify the evolution prompt appears after the battle victory screen.

**Acceptance Scenarios**:

1. **Given** my Bulbasaur (3-stage) is level 2 with experience close to level 3, **When** I win a battle and gain enough XP to reach level 3, **Then** I see a prompt asking if I want to evolve Bulbasaur into Ivysaur.
2. **Given** my Pikachu (2-stage) is level 4 with experience close to level 5, **When** I win a battle and gain enough XP to reach level 5, **Then** I see a prompt asking if I want to evolve Pikachu into Raichu.
3. **Given** my Pokemon levels up but is not at an evolution threshold, **When** the battle ends, **Then** no evolution prompt appears and I see the normal victory screen.
4. **Given** my Pokemon is already at its final evolution stage (e.g., Venusaur), **When** I level up, **Then** no evolution prompt appears.
5. **Given** I am prompted to evolve, **When** I choose "Yes", **Then** my Pokemon transforms into its evolved form, retains its current moves, gains access to new moves from the evolved form, and continues at the same level.
6. **Given** I am prompted to evolve, **When** I choose "No" or "Later", **Then** my Pokemon remains in its current form and the evolution opportunity is saved for later.

---

### User Story 2 - Evolve Pokemon from Pokecenter (Priority: P2)

As a trainer, I want to evolve eligible Pokemon from the Pokecenter at any time once they have reached the evolution level, so I can evolve on my own schedule.

**Why this priority**: Provides flexibility for trainers to evolve when ready, whether they deferred after battle or simply prefer to manage evolutions from the Pokecenter.

**Independent Test**: Have a Pokemon that reached evolution level, visit the Pokecenter, and verify an "Evolve" button appears for that Pokemon.

**Acceptance Scenarios**:

1. **Given** my Charmander reached level 3 (first evolution threshold for 3-stage), **When** I view it in the Pokecenter, **Then** I see an "Evolve" button next to it.
2. **Given** my Voltorb reached level 5 (evolution threshold for 2-stage), **When** I view it in the Pokecenter, **Then** I see an "Evolve" button next to it.
3. **Given** I click "Evolve" on an eligible Pokemon, **When** the evolution completes, **Then** the Pokemon transforms, retains moves, and gains access to new evolution moves.
4. **Given** my Pokemon has not reached the evolution level, **When** I view it in the Pokecenter, **Then** no "Evolve" button is shown.
5. **Given** my Pokemon is at its final evolution stage, **When** I view it in the Pokecenter, **Then** no "Evolve" button is shown.

---

### User Story 3 - View Evolution Requirements (Priority: P3)

As a trainer, I want to see what level my Pokemon needs to reach for evolution so I can plan my training strategy.

**Why this priority**: Quality of life improvement that helps trainers understand progression, but not essential for core evolution functionality.

**Independent Test**: View a Pokemon's details and verify the evolution requirement is displayed.

**Acceptance Scenarios**:

1. **Given** I have a Squirtle (Stage 1 of 3), **When** I view its details, **Then** I see "Evolves at level 3" indicator.
2. **Given** I have a Wartortle (Stage 2 of 3), **When** I view its details, **Then** I see "Evolves at level 6" indicator.
3. **Given** I have a Pikachu (Stage 1 of 2), **When** I view its details, **Then** I see "Evolves at level 5" indicator.
4. **Given** I have a Blastoise (Stage 3 of 3), **When** I view its details, **Then** I see "Final evolution" or no evolution indicator.

---

### Edge Cases

- What happens when a Pokemon gains multiple levels at once and passes the evolution threshold? The evolution prompt appears once at battle end.
- What happens if a Pokemon can evolve but is currently in battle? Evolution only triggers after battle ends, never during.
- What happens to the Pokemon's moves after evolution? All currently selected moves are retained. New moves from the evolved form become available for selection.
- What happens if the trainer closes the evolution prompt without responding? Evolution is deferred (same as choosing "Later").
- What happens to a Pokemon's experience after evolution? Experience and level are preserved; evolution does not reset progress.
- What if a Pokemon skips evolution at level 3 and reaches level 6? They can evolve once at level 3+, and once more at level 6+ (each evolution is independent).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect when a Pokemon reaches an evolution-eligible level after gaining experience.
- **FR-002**: System MUST display an evolution prompt at battle end when a Pokemon becomes eligible to evolve.
- **FR-003**: System MUST allow trainers to accept or defer evolution when prompted.
- **FR-004**: System MUST track evolution eligibility status for Pokemon that have reached evolution threshold but not yet evolved.
- **FR-005**: System MUST display an "Evolve" action in the Pokecenter for Pokemon that have reached their evolution level threshold.
- **FR-006**: System MUST transform the Pokemon to its evolved form when evolution is accepted (update species, sprite, name).
- **FR-007**: System MUST preserve the Pokemon's level, experience, and currently selected moves after evolution.
- **FR-008**: System MUST make moves from the evolved Pokemon's moveset available after evolution.
- **FR-009**: System MUST NOT show evolution options for Pokemon at their final evolution stage.
- **FR-010**: System MUST use the following evolution level thresholds:
  - **2-stage Pokemon** (Stage 1 of 2): Evolve at level 5
  - **3-stage Pokemon** (Stage 1 of 3): First evolution at level 3
  - **3-stage Pokemon** (Stage 2 of 3): Second evolution at level 6

### Key Entities

- **Evolution Eligibility**: A flag indicating a Pokemon has reached evolution level but has not yet evolved. Becomes true when level threshold is reached.
- **Evolution Threshold**: The level at which a Pokemon becomes eligible to evolve:
  - 2-stage Pokemon: Level 5
  - 3-stage Pokemon: Level 3 (first), Level 6 (second)
- **Evolution Chain**: The relationship between Pokemon forms (e.g., Bulbasaur -> Ivysaur -> Venusaur).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Pokemon that reach evolution thresholds are correctly identified as evolution-eligible.
- **SC-002**: Trainers can complete evolution in under 10 seconds from prompt to transformed Pokemon.
- **SC-003**: All evolved Pokemon retain their previously selected moves after transformation.
- **SC-004**: Evolution option remains available in Pokecenter for any Pokemon that has reached its evolution level threshold.
- **SC-005**: No evolution prompts appear for final-stage Pokemon or Pokemon below evolution threshold.

## Assumptions

- Evolution thresholds are based on evolution chain length:
  - 2-stage Pokemon (e.g., Pikachu -> Raichu): Level 5
  - 3-stage Pokemon (e.g., Bulbasaur -> Ivysaur -> Venusaur): Level 3 and Level 6
- Pokemon with only one stage (no evolution chain) are never prompted for evolution.
- The existing move inheritance system already supports evolved Pokemon accessing their pre-evolution's moves, so evolution just needs to update the Pokemon's species ID.
- Evolution does not change the Pokemon's owned record ID, only its species-related attributes.
- The "pokemon-cleaned.json" data contains evolution stage information ("Stage X of Y") that can be used to determine evolution chains and thresholds.
