# Research: Starter Pokemon Selection Flow

**Date**: 2026-01-07
**Branch**: `001-starter-pokemon-flow`

## Research Tasks

### 1. Pokemon Type Data Source

**Question**: Current `pokemon/pokemon.json` lacks `types` field. How to add type data for filtering?

**Decision**: Extend the existing sanitize script to include Pokemon types from PokeAPI data.

**Rationale**:
- The project already has a sanitize script (`scripts/sanitize-pokemon.ts`) that processes Pokemon data
- PokeAPI provides comprehensive type data for all Pokemon
- Types are static data that can be bundled with the app (aligns with Constitution Principle IV)

**Alternatives Considered**:
1. **Fetch types at runtime from PokeAPI** - Rejected: adds external dependency, latency, and rate limiting concerns
2. **Hardcode types manually** - Rejected: error-prone for 151 Pokemon
3. **Use a different Pokemon data source** - Rejected: unnecessary when we can extend existing data

**Implementation**: Update `scripts/sanitize-pokemon.ts` to:
- Fetch type data from PokeAPI for each Pokemon
- Add `types: string[]` field to each Pokemon record
- Output updated `pokemon.json` with types included

---

### 2. Supabase Client Patterns for Next.js 14+

**Question**: Best practices for Supabase client setup with Next.js App Router?

**Decision**: Use `@supabase/ssr` package with separate client/server utilities.

**Rationale**:
- `@supabase/ssr` is the official package for server-side rendering with Supabase
- Separation of client/server code prevents accidental exposure of server-side logic
- Works seamlessly with Next.js App Router's server components and route handlers

**Pattern**:
```typescript
// lib/supabase/client.ts - Browser client
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// lib/supabase/server.ts - Server client
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { /* cookie handlers */ } }
  )
}
```

---

### 3. Session Management Without Auth

**Question**: How to track user session without Supabase Auth?

**Decision**: Use localStorage with trainer ID after creation, validated against database.

**Rationale**:
- No auth means no Supabase session tokens
- Trainer ID is the unique identifier (displayed on dashboard, used for API)
- localStorage persists across page refreshes within same browser
- Server validates trainer ID exists in database before allowing actions

**Flow**:
1. User enters name → Server creates trainer record → Returns trainer ID
2. Client stores trainer ID in localStorage
3. Subsequent requests include trainer ID for validation
4. Dashboard/selection screens check localStorage for existing session
5. Logout clears localStorage

**Security Note**: This is acceptable for classroom use case. Trainer IDs are UUIDs, making guessing impractical.

---

### 4. Admin Access Pattern

**Question**: How does admin view work without authentication?

**Decision**: Admin page queries all trainers; role check happens at query level.

**Rationale**:
- Admin role is set manually in database
- Page can check if current trainer (from localStorage) has admin role
- If not admin, redirect to dashboard or show unauthorized message

**Pattern**:
```typescript
// In admin page
const trainerId = localStorage.getItem('trainerId')
const { data: trainer } = await supabase
  .from('trainers')
  .select('role')
  .eq('id', trainerId)
  .single()

if (trainer?.role !== 'admin') {
  redirect('/dashboard')
}
```

---

### 5. State Management for Pokemon Selection

**Question**: How to manage Pokemon selection state and navigation flow?

**Decision**: Use React state + URL-based routing with server-side validation.

**Rationale**:
- Next.js App Router handles routing
- Server components can check trainer state on page load
- Client components handle interactive filtering
- Confirmation modal is client-side state

**Navigation Guards**:
- `/` (login): If trainer ID in localStorage and has starter → redirect to `/dashboard`
- `/select`: If no trainer ID → redirect to `/`. If has starter → redirect to `/dashboard`
- `/dashboard`: If no trainer ID → redirect to `/`. If no starter → redirect to `/select`

---

### 6. Real-time Filtering Performance

**Question**: How to achieve <500ms filtering for 151 Pokemon?

**Decision**: Client-side filtering with pre-loaded data.

**Rationale**:
- 151 Pokemon is small enough to load entirely on client
- No network round-trip needed for filtering
- Simple array filter operation
- Type filter state managed with React useState

**Implementation**:
```typescript
const [selectedType, setSelectedType] = useState<string | null>(null)

const filteredPokemon = useMemo(() => {
  if (!selectedType) return allPokemon
  return allPokemon.filter(p => p.types.includes(selectedType))
}, [allPokemon, selectedType])
```

---

## Dependencies Resolved

| Dependency | Version | Purpose |
|------------|---------|---------|
| next | 14.x | App Router, API routes, SSR |
| react | 18.x | UI components |
| @supabase/supabase-js | 2.x | Supabase client |
| @supabase/ssr | latest | SSR helpers for Next.js |
| typescript | 5.x | Type safety |

## Open Questions Resolved

All NEEDS CLARIFICATION items from Technical Context have been addressed:
- ✅ Pokemon type data source identified
- ✅ Supabase client patterns established
- ✅ Session management approach defined
- ✅ Admin access pattern determined
- ✅ State management strategy selected
- ✅ Filtering performance approach confirmed
