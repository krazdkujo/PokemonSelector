# Data Model: Pokecenter API Sorting and Documentation Update

**Date**: 2026-01-11
**Feature**: 011-pokecenter-api-sorting

## Overview

This feature requires **no schema changes**. The existing `pokemon_owned` table already has the `captured_at` column used for sorting.

## Existing Entity: pokemon_owned

The table structure remains unchanged:

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | Foreign key to trainers |
| pokemon_id | integer | Pokemon species ID |
| level | integer | Current level |
| experience | integer | Current experience points |
| is_starter | boolean | Whether this is the trainer's starter |
| is_active | boolean | Whether this is the active Pokemon |
| captured_at | timestamp | When the Pokemon was captured/obtained |
| selected_moves | text[] | Array of selected move IDs |

## Query Change

**Before**:
```sql
SELECT * FROM pokemon_owned
WHERE user_id = $1
ORDER BY captured_at ASC
```

**After**:
```sql
SELECT * FROM pokemon_owned
WHERE user_id = $1
ORDER BY captured_at DESC
```

## Impact Assessment

- No database migrations required
- No index changes needed (existing index on `captured_at` supports both directions)
- No API response structure changes
- Backward compatible (field names unchanged)
