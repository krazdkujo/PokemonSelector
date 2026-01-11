# Feature Specification: Combat Zone Selection with Difficulty Levels

**Feature Branch**: `006-combat-zones`
**Created**: 2026-01-11
**Status**: Draft
**Input**: User description: "On the combat screen - Select difficulty should be easy up to +2 SR and same or lower level, medium is up to +5 SR and +0 to +3 levels, hard is any SR and +4 to +6 levels. There should be five zones each with 3 difficulties that have pokemon. Bugs, grass, flying, in jungle, water, flying, normal in the ocean, fire, rock, ground in a volcano, electric, normal, steel in a power plant and the like."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Select a Combat Zone (Priority: P1)

A trainer navigates to the combat screen and sees eight distinct zones representing different environments. Each zone displays its name, theme, and the types of Pokemon that can be encountered there. The trainer selects a zone to explore based on their preferred Pokemon types to battle. The zones are designed to provide complete coverage of all 17 Pokemon types.

**Why this priority**: Zone selection is the foundation of the combat experience. Without zones, trainers cannot engage in battles. This establishes the core navigation and discovery mechanic.

**Independent Test**: Can be fully tested by navigating to the combat screen, viewing all eight zones with their descriptions, and selecting any zone to proceed to difficulty selection.

**Acceptance Scenarios**:

1. **Given** a trainer is on the combat screen, **When** they view the zone selection, **Then** they see eight distinct zones covering all Pokemon types
2. **Given** a trainer views a zone, **When** they inspect the zone details, **Then** they see the zone name, visual theme, and Pokemon types available (e.g., Jungle shows Bug, Grass, Poison)
3. **Given** a trainer is on the combat screen, **When** they select a zone, **Then** they proceed to the difficulty selection for that zone

---

### User Story 2 - Select Difficulty Level (Priority: P1)

After selecting a zone, a trainer sees three difficulty options: Easy, Medium, and Hard. Each difficulty displays clear information about the challenge level. The trainer selects a difficulty based on their confidence and desired challenge.

**Why this priority**: Difficulty selection directly enables combat encounters and is essential for the core gameplay loop. It must work together with zone selection for a complete experience.

**Independent Test**: Can be fully tested by selecting any zone and then choosing each of the three difficulty levels, verifying the encounter parameters match the expected ranges.

**Acceptance Scenarios**:

1. **Given** a trainer has selected a zone, **When** they view difficulty options, **Then** they see Easy, Medium, and Hard options with clear descriptions
2. **Given** a trainer views Easy difficulty, **When** they read the description, **Then** they understand opponents will be at most +2 Species Rating (SR) above their Pokemon and at the same level or lower
3. **Given** a trainer views Medium difficulty, **When** they read the description, **Then** they understand opponents will be at most +5 SR above their Pokemon and +0 to +3 levels higher
4. **Given** a trainer views Hard difficulty, **When** they read the description, **Then** they understand opponents can be any SR and +4 to +6 levels higher
5. **Given** a trainer selects a difficulty, **When** the encounter begins, **Then** they face a Pokemon matching the zone types and difficulty parameters

---

### User Story 3 - Encounter Zone-Specific Pokemon (Priority: P2)

When a trainer initiates combat after selecting a zone and difficulty, they encounter a wild Pokemon that matches the zone's type pool. The Pokemon's level and SR are calculated based on the difficulty selected and the trainer's active Pokemon.

**Why this priority**: This delivers the actual combat encounter, but depends on zone and difficulty selection being functional first.

**Independent Test**: Can be fully tested by completing zone and difficulty selection, then verifying the encountered Pokemon's type is from the zone's type pool and its level/SR fall within the difficulty parameters.

**Acceptance Scenarios**:

1. **Given** a trainer selects Jungle zone with Easy difficulty, **When** combat begins, **Then** the wild Pokemon is Bug, Grass, or Poison type
2. **Given** a trainer selects Ocean zone with Medium difficulty, **When** combat begins, **Then** the wild Pokemon is Water, Flying, or Normal type
3. **Given** a trainer selects Volcano zone with Hard difficulty, **When** combat begins, **Then** the wild Pokemon is Fire, Rock, or Ground type
4. **Given** a trainer selects Power Plant zone, **When** combat begins, **Then** the wild Pokemon is Electric, Steel, or Normal type
5. **Given** a trainer selects Haunted Tower zone, **When** combat begins, **Then** the wild Pokemon is Ghost, Psychic, or Poison type
6. **Given** a trainer selects Frozen Cave zone, **When** combat begins, **Then** the wild Pokemon is Ice, Rock, or Ground type
7. **Given** a trainer selects Dojo zone, **When** combat begins, **Then** the wild Pokemon is Fighting, Normal, or Flying type
8. **Given** a trainer selects Dragon Shrine zone, **When** combat begins, **Then** the wild Pokemon is Dragon, Fairy, or Psychic type
9. **Given** a trainer's active Pokemon is level 20 and they select Easy difficulty, **When** combat begins, **Then** the wild Pokemon is level 20 or lower

---

### User Story 4 - View Zone Information Before Selection (Priority: P3)

A trainer can preview detailed information about each zone before committing to a selection, including example Pokemon they might encounter and difficulty recommendations based on their current team.

**Why this priority**: Enhances the user experience but is not essential for core functionality. The combat loop works without detailed previews.

**Independent Test**: Can be fully tested by hovering or clicking an info button on any zone and verifying detailed information is displayed without committing to selection.

**Acceptance Scenarios**:

1. **Given** a trainer is viewing zones, **When** they request more info about a zone, **Then** they see example Pokemon from that zone's type pool
2. **Given** a trainer has a team with high-level Pokemon, **When** they preview zone info, **Then** they see difficulty recommendations appropriate for their team

---

### Edge Cases

- What happens when the trainer has no Pokemon available for combat?
- How does the system handle if no Pokemon of the zone's types exist within the difficulty parameters?
- What happens if the trainer's only Pokemon is level 1 and they select Hard difficulty (resulting in level 5-7 opponents)?
- How does the system handle zones when the Pokemon data does not include enough variety for all type combinations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display eight distinct combat zones on the combat screen to cover all 17 Pokemon types
- **FR-002**: System MUST assign each zone a specific set of Pokemon types with complete type coverage:
  - **Jungle**: Bug, Grass, Poison (dense vegetation, venomous creatures)
  - **Ocean**: Water, Flying, Normal (coastal and aquatic environments)
  - **Volcano**: Fire, Rock, Ground (volcanic and mountainous terrain)
  - **Power Plant**: Electric, Steel, Normal (industrial facilities)
  - **Haunted Tower**: Ghost, Psychic, Poison (abandoned structures with supernatural presence)
  - **Frozen Cave**: Ice, Rock, Ground (frozen underground caverns)
  - **Dojo**: Fighting, Normal, Flying (martial arts training grounds)
  - **Dragon Shrine**: Dragon, Fairy, Psychic (ancient mystical location)
- **FR-003**: System MUST provide three difficulty levels for each zone: Easy, Medium, and Hard
- **FR-004**: System MUST calculate opponent Pokemon parameters based on difficulty:
  - Easy: Maximum +2 SR above trainer's Pokemon, same level or lower
  - Medium: Maximum +5 SR above trainer's Pokemon, +0 to +3 levels higher
  - Hard: Any SR, +4 to +6 levels higher
- **FR-005**: System MUST select encounter Pokemon only from types matching the selected zone
- **FR-006**: System MUST use the trainer's active/lead Pokemon as the reference for level and SR calculations
- **FR-007**: System MUST prevent combat initiation if the trainer has no available Pokemon
- **FR-008**: System MUST display clear descriptions of each difficulty level's parameters before selection
- **FR-009**: System MUST provide a fallback if no Pokemon match the zone/difficulty criteria (select closest available match)

### Key Entities

- **Zone**: Represents a combat environment with a name, visual theme, and list of Pokemon types that can be encountered
- **Difficulty**: Defines the SR range and level range for opponent Pokemon relative to the trainer's Pokemon
- **Encounter**: A generated combat instance combining zone type restrictions and difficulty parameters to select an appropriate wild Pokemon
- **Species Rating (SR)**: A numeric value representing a Pokemon's base power/rarity used for difficulty matching

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Trainers can navigate from the combat screen to an active battle encounter in under 30 seconds (3 selections: zone, difficulty, confirm)
- **SC-002**: 100% of generated encounters produce Pokemon matching the selected zone's type pool
- **SC-003**: 100% of Easy difficulty encounters produce Pokemon at or below the trainer's Pokemon level
- **SC-004**: 100% of Medium difficulty encounters produce Pokemon within +0 to +3 levels of the trainer's Pokemon
- **SC-005**: 100% of Hard difficulty encounters produce Pokemon within +4 to +6 levels of the trainer's Pokemon
- **SC-006**: All eight zones are accessible and functional with all three difficulty levels (24 total combinations)
- **SC-008**: Every Pokemon type is encounterable in at least one zone (complete type coverage)
- **SC-007**: System gracefully handles edge cases (no Pokemon available, no type matches) without errors or crashes

## Assumptions

- Species Rating (SR) is an existing attribute in the Pokemon data model
- The trainer's "active Pokemon" or "lead Pokemon" is clearly defined in the current system
- The existing Pokemon dataset includes sufficient variety across all required types for each zone
- Level cap and minimum level boundaries exist in the game system (encounters will not generate Pokemon below level 1 or above the game's level cap)
