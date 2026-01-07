# Feature Specification: Sanitize Pokemon Data

**Feature Branch**: `001-sanitize-pokemon-data`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "Sanitize the data in the pokemon/pokemon.json so that it only has the first 151 Pokemon. We only need the Pokemon name and number, as well as the image links."

## Clarifications

### Session 2026-01-07

- Q: Should shiny image variants be included? → A: No, exclude shiny variants (mainShiny, spriteShiny)
- Q: Which image source to use? → A: PokeAPI sprites (same source as poke5e uses)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer Loads Minimal Pokemon Data (Priority: P1)

As a developer working on the Pokemon Starter Selector app, I need the Pokemon data file to contain only the essential fields (name, number, and image links) for the first 151 Pokemon so that the application loads faster and uses less memory.

**Why this priority**: This is the core purpose of the feature - reducing the data file to only what's needed for the starter selection UI.

**Independent Test**: Can be verified by opening the sanitized JSON file and confirming it contains exactly 151 entries with only the required fields.

**Acceptance Scenarios**:

1. **Given** the original pokemon.json file with all Pokemon and many fields, **When** the sanitization is complete, **Then** the output file contains exactly 151 Pokemon entries (numbers 1-151).

2. **Given** each Pokemon entry in the original file, **When** sanitized, **Then** each entry contains only: name, number, and sprite/image URLs.

3. **Given** the sanitized file, **When** loaded by the application, **Then** all 151 Pokemon display correctly with their names and images.

---

### User Story 2 - Application Displays Pokemon Images (Priority: P2)

As a user browsing the Pokemon list, I need each Pokemon to display its official artwork and sprite images so I can visually identify and select my starter.

**Why this priority**: Images are essential for the user experience, but depend on the core data structure being correct first.

**Independent Test**: Can be verified by loading the sanitized data and confirming all image URLs are valid and accessible.

**Acceptance Scenarios**:

1. **Given** a sanitized Pokemon entry, **When** the image URLs are accessed, **Then** all image links return valid images.

2. **Given** the sprites object for each Pokemon, **When** examined, **Then** it contains exactly two URLs: `main` (official artwork) and `sprite` (small sprite), with no shiny variants.

---

### Edge Cases

- What happens when the source file is missing or corrupted? The sanitization process should fail gracefully with a clear error message.
- What happens if a Pokemon entry is missing image URLs? The entry should still be included with null/empty values for missing image fields.
- What happens if Pokemon are not numbered sequentially (gaps)? Only Pokemon with numbers 1-151 should be included, regardless of their position in the source file.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST read from the existing `pokemon/pokemon.json` file as the data source.
- **FR-002**: System MUST filter Pokemon to include only those with numbers 1 through 151 (Generation 1).
- **FR-003**: System MUST retain only the following fields for each Pokemon:
  - `name`: The display name of the Pokemon (e.g., "Bulbasaur")
  - `number`: The Pokedex number (1-151)
  - `sprites`: Object containing only non-shiny image URLs (`main`, `sprite`)
- **FR-004**: System MUST remove all other fields from each Pokemon entry (type, size, stats, abilities, moves, etc.).
- **FR-005**: System MUST output a valid JSON file that can be loaded by the application.
- **FR-006**: System MUST preserve the original ordering by Pokemon number (1 to 151).

### Key Entities

- **Pokemon (Sanitized)**: A streamlined representation containing only:
  - `name`: String - the Pokemon's display name
  - `number`: Integer - Pokedex number (1-151)
  - `sprites`: Object containing two image URLs:
    - `main`: Official artwork from PokeAPI (high-resolution)
    - `sprite`: Small sprite image from PokeAPI

### Assumptions

- The source `pokemon/pokemon.json` file contains all 151 Generation 1 Pokemon.
- Image URLs use PokeAPI sprites (confirmed as same source used by poke5e).
- The sanitized output will replace or coexist with the original file (implementation decision).
- The original `id` field (lowercase name like "bulbasaur") is not needed as `name` and `number` are sufficient identifiers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The sanitized data file contains exactly 151 Pokemon entries.
- **SC-002**: Each Pokemon entry contains exactly 3 fields: `name`, `number`, and `sprites`.
- **SC-003**: The sanitized file size is reduced by at least 80% compared to the original.
- **SC-004**: All 151 Pokemon can be displayed in the application with their names and images visible.
- **SC-005**: The sanitized file can be parsed and loaded in under 100 milliseconds on a typical device.
