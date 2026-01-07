# Quickstart: Pokemon Nickname Feature

**Feature**: 004-pokemon-nickname
**Date**: 2026-01-07

## Prerequisites

- Node.js 18+ installed
- Supabase project configured
- Local development environment running (`npm run dev`)

## Implementation Order

### Step 1: Database Migration

Run the migration to add the nickname column:

```bash
npm run db:migrate
```

Or manually execute:

```sql
ALTER TABLE trainers
ADD COLUMN IF NOT EXISTS starter_pokemon_nickname VARCHAR(20);

ALTER TABLE trainers
ADD CONSTRAINT trainers_nickname_length
CHECK (char_length(trim(starter_pokemon_nickname)) >= 1 OR starter_pokemon_nickname IS NULL);
```

Verify with:
```bash
npm run db:status
```

### Step 2: Update Type Definitions

In `src/lib/types.ts`, add `starter_pokemon_nickname` to `Trainer` and `nickname` to `ExternalTrainerResponse.pokemon`.

### Step 3: Create Nickname API Endpoint

Create new file: `src/app/api/trainer/[id]/nickname/route.ts`

Key implementation points:
- Validate trainer exists and has a Pokemon
- Trim whitespace from nickname input
- Validate 1-20 character length (when not null/empty)
- Update `starter_pokemon_nickname` in database
- Return updated trainer with starter Pokemon

### Step 4: Update External API

Modify `src/app/api/external/trainer/route.ts`:
- Include `starter_pokemon_nickname` in database query
- Add `nickname` field to response's `pokemon` object

### Step 5: Update UI Components

1. Modify `src/components/StarterDisplay.tsx`:
   - Display nickname above species name when present
   - Format: "Nickname" or "Nickname (Species Name)"

2. Create `src/components/NicknameEditor.tsx`:
   - Text input with 20 character max
   - Save button to submit
   - Clear button to remove nickname

### Step 6: Update API Documentation

Modify `docs/API.md`:
- Add `nickname` field to response format
- Update examples to include nickname
- Add notes about nullable field

## Testing the Feature

### Manual Testing

1. **Set a nickname**:
```bash
curl -X PUT "http://localhost:3000/api/trainer/{trainer-id}/nickname" \
  -H "Content-Type: application/json" \
  -d '{"nickname": "Sparky"}'
```

2. **Clear a nickname**:
```bash
curl -X DELETE "http://localhost:3000/api/trainer/{trainer-id}/nickname"
```

3. **Verify external API**:
```bash
curl "http://localhost:3000/api/external/trainer" \
  -H "X-API-Key: YOUR_KEY" \
  -H "X-Trainer-Name: YourName"
```

### Validation Test Cases

| Input | Expected Result |
|-------|-----------------|
| `"Sparky"` | Saved as "Sparky" |
| `"  Sparky  "` | Saved as "Sparky" (trimmed) |
| `""` | Cleared (set to null) |
| `null` | Cleared (set to null) |
| `"   "` | Rejected or cleared (only whitespace) |
| `"A"` | Saved (minimum valid) |
| `"12345678901234567890"` | Saved (maximum valid - 20 chars) |
| `"123456789012345678901"` | Rejected (21 chars - too long) |

## Files Changed Summary

| File | Change Type |
|------|-------------|
| `sql/005_add_nickname.sql` | NEW |
| `src/lib/types.ts` | MODIFY |
| `src/app/api/trainer/[id]/nickname/route.ts` | NEW |
| `src/app/api/external/trainer/route.ts` | MODIFY |
| `src/components/StarterDisplay.tsx` | MODIFY |
| `src/components/NicknameEditor.tsx` | NEW |
| `docs/API.md` | MODIFY |

## Common Issues

### "Nickname must be between 1 and 20 characters"
- Ensure nickname is not just whitespace
- Check character count after trimming

### "You must select a Pokemon before setting a nickname"
- Complete the starter selection flow first
- Verify `starter_pokemon_id` is not null

### External API not showing nickname
- Verify migration has been applied
- Check that `starter_pokemon_nickname` is included in the database SELECT query
