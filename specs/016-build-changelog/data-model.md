# Data Model: Build Changelog with Version Tracking

**Feature**: 016-build-changelog
**Date**: 2026-01-14

## Overview

Data model for the changelog feature. All data is stored as a static JSON file bundled with the application.

---

## Entities

### Version

Represents a specific build/release of the application.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| version | string | Yes | Semantic version number (MAJOR.MINOR.PATCH) |
| date | string | Yes | Release date in ISO 8601 format (YYYY-MM-DD) |
| changes | ChangeEntry[] | Yes | Array of changes in this version |

**Validation Rules**:
- `version`: Must match pattern `^\d+\.\d+\.\d+$`
- `date`: Must be valid ISO 8601 date
- `changes`: Must contain at least one entry (empty versions not allowed per spec)

**Constraints**:
- Version numbers must be unique across all entries
- Versions should be stored in descending order (newest first)

---

### ChangeEntry

Represents a single change within a version.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| category | ChangeCategory | Yes | Type of change |
| description | string | Yes | Human-readable description of the change |

**Validation Rules**:
- `category`: Must be one of the defined ChangeCategory values
- `description`: Non-empty string, max 500 characters

---

### ChangeCategory (Enum)

Categories for classifying changes, following Keep a Changelog conventions.

| Value | Description |
|-------|-------------|
| Added | New features |
| Changed | Changes in existing functionality |
| Fixed | Bug fixes |
| Removed | Removed features |
| Deprecated | Soon-to-be removed features |
| Security | Security-related changes |

---

## Data File Structure

### Location
`src/data/changelog.json`

### Schema
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["versions"],
  "properties": {
    "versions": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["version", "date", "changes"],
        "properties": {
          "version": {
            "type": "string",
            "pattern": "^\\d+\\.\\d+\\.\\d+$"
          },
          "date": {
            "type": "string",
            "format": "date"
          },
          "changes": {
            "type": "array",
            "minItems": 1,
            "items": {
              "type": "object",
              "required": ["category", "description"],
              "properties": {
                "category": {
                  "type": "string",
                  "enum": ["Added", "Changed", "Fixed", "Removed", "Deprecated", "Security"]
                },
                "description": {
                  "type": "string",
                  "minLength": 1,
                  "maxLength": 500
                }
              }
            }
          }
        }
      }
    }
  }
}
```

### Example Data
```json
{
  "versions": [
    {
      "version": "1.2.0",
      "date": "2026-01-14",
      "changes": [
        { "category": "Added", "description": "Changelog page to track version history" },
        { "category": "Added", "description": "Search and filter functionality for changelog" }
      ]
    },
    {
      "version": "1.1.1",
      "date": "2026-01-14",
      "changes": [
        { "category": "Fixed", "description": "PIN verification redirect on login" }
      ]
    },
    {
      "version": "1.1.0",
      "date": "2026-01-11",
      "changes": [
        { "category": "Added", "description": "Eevee multi-evolution support" },
        { "category": "Changed", "description": "API improvements for trainer lookup" }
      ]
    }
  ]
}
```

---

## TypeScript Types

```typescript
// src/lib/changelog.ts

export type ChangeCategory =
  | 'Added'
  | 'Changed'
  | 'Fixed'
  | 'Removed'
  | 'Deprecated'
  | 'Security';

export interface ChangeEntry {
  category: ChangeCategory;
  description: string;
}

export interface Version {
  version: string;
  date: string;
  changes: ChangeEntry[];
}

export interface Changelog {
  versions: Version[];
}

export interface ChangelogFilters {
  searchQuery?: string;
  categories?: ChangeCategory[];
}
```

---

## Relationships

```
Changelog (1) ──contains──> (N) Version
Version (1) ──contains──> (N) ChangeEntry
ChangeEntry (1) ──has──> (1) ChangeCategory
```

---

## State Transitions

Not applicable - changelog data is immutable at runtime. Updates occur only via code deployments.

---

## Indexing / Query Patterns

Since data is loaded client-side, these are implemented as array operations:

1. **Get all versions**: Direct array access
2. **Get versions by page**: Array slice with offset/limit
3. **Search by version number**: Filter with string includes/startsWith
4. **Filter by category**: Filter versions where any change matches category
5. **Combined search + filter**: Chain filter operations
