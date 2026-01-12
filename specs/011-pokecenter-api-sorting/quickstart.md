# Quickstart: Pokecenter API Sorting and Documentation Update

**Feature**: 011-pokecenter-api-sorting
**Estimated Changes**: 2-3 files

## Implementation Steps

### Step 1: Update Pokecenter API Sort Order

**File**: `src/app/api/pokecenter/route.ts`

Change line 37 from:
```typescript
.order('captured_at', { ascending: true });
```

To:
```typescript
.order('captured_at', { ascending: false });
```

### Step 2: Update API Documentation URLs

**Files to update**:
- `docs/API.md`
- `public/docs/API.md`
- `docs/openapi.yaml`
- `public/docs/openapi.yaml`
- `docs/api/openapi.yaml` (if different content)

**Find and replace**:
- Find: `your-app.vercel.app`
- Replace: `pokemon-selector-rctq.vercel.app`

Also remove/update any text that says "Replace with the actual deployment URL" or similar placeholder instructions.

### Step 3: Verify Changes

```bash
# Start dev server
npm run dev

# Test API (requires valid API key)
curl -H "X-API-Key: YOUR_KEY" http://localhost:3000/api/pokecenter
```

Verify:
1. Pokemon array is sorted newest-first
2. Documentation URLs point to production

## Files Changed

| File | Change Type | Description |
|------|-------------|-------------|
| `src/app/api/pokecenter/route.ts` | Modify | Change sort order to descending |
| `docs/API.md` | Modify | Update URLs |
| `public/docs/API.md` | Modify | Update URLs |
| `docs/openapi.yaml` | Modify | Update server URL |
| `public/docs/openapi.yaml` | Modify | Update server URL |

## Testing

1. Call `/api/pokecenter` and verify Pokemon order
2. Check documentation renders correctly
3. Copy a curl example from docs and run it against production
