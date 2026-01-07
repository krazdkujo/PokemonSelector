# Quickstart: Starter Pokemon Selection Flow

**Date**: 2026-01-07
**Branch**: `001-starter-pokemon-flow`

## Prerequisites

- Node.js 18+ installed
- Supabase account with project created
- Git repository cloned

## Environment Setup

### 1. Install Dependencies

```bash
npm install next@14 react react-dom @supabase/supabase-js @supabase/ssr
npm install -D typescript @types/react @types/node
```

### 2. Configure Environment Variables

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Set Up Supabase Database

Run the following SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trainers table
CREATE TABLE trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(20) NOT NULL CHECK (char_length(trim(name)) >= 1),
  role VARCHAR(10) NOT NULL DEFAULT 'trainer' CHECK (role IN ('trainer', 'admin')),
  starter_pokemon_id INTEGER UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries
CREATE INDEX idx_trainers_role ON trainers(role);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth for classroom use)
CREATE POLICY "Allow all operations" ON trainers
  FOR ALL
  USING (true)
  WITH CHECK (true);
```

### 4. Update Pokemon Data

Add types to Pokemon data by running the enhanced sanitize script:

```bash
npm run sanitize-pokemon
```

This will update `src/data/pokemon.json` with type information.

## Project Structure

After setup, your project should look like:

```
├── src/
│   ├── app/
│   │   ├── page.tsx              # Login screen
│   │   ├── select/page.tsx       # Pokemon selection
│   │   ├── dashboard/page.tsx    # Trainer dashboard
│   │   ├── admin/page.tsx        # Admin view
│   │   ├── api/
│   │   │   ├── trainer/route.ts  # POST /api/trainer
│   │   │   ├── trainer/[id]/route.ts
│   │   │   └── trainers/route.ts # GET /api/trainers (admin)
│   │   └── layout.tsx
│   ├── components/
│   │   ├── PokemonCard.tsx
│   │   ├── PokemonGrid.tsx
│   │   ├── TypeFilter.tsx
│   │   └── ConfirmationModal.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   ├── pokemon.ts
│   │   └── types.ts
│   └── data/
│       └── pokemon.json
├── .env.local
├── next.config.js
├── package.json
└── tsconfig.json
```

## Running the Application

### Development

```bash
npm run dev
```

Open http://localhost:3000

### Production Build

```bash
npm run build
npm start
```

## Key Flows

### User Registration Flow

1. Navigate to `/` (login page)
2. Enter trainer name (1-20 characters)
3. Click "Start Journey"
4. Trainer record created in Supabase
5. Trainer ID stored in localStorage
6. Redirect to `/select`

### Pokemon Selection Flow

1. View all Pokemon on `/select`
2. Use type filter to narrow down options
3. Click a Pokemon to select
4. Confirm selection in modal
5. Starter saved to database
6. Redirect to `/dashboard`

### Dashboard

1. View trainer ID and name on `/dashboard`
2. See selected starter Pokemon details
3. Copy trainer ID for API usage
4. Logout to clear session

### Admin View

1. Set trainer role to 'admin' in Supabase dashboard
2. Navigate to `/admin`
3. View all trainers and their selections

## API Usage

### Get Trainer by ID

```bash
curl http://localhost:3000/api/trainer/{trainer-id}
```

Response:
```json
{
  "id": "uuid",
  "name": "Ash",
  "role": "trainer",
  "starter_pokemon_id": 25,
  "starter": {
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "sprites": { ... }
  }
}
```

## Troubleshooting

### "Invalid name" error
- Ensure name is 1-20 characters
- Name must contain at least one non-whitespace character

### "Pokemon already claimed" error
- Each Pokemon can only be selected by one trainer
- Choose a different Pokemon

### Can't access admin page
- Verify trainer has role='admin' in database
- Check localStorage has valid trainerId

## Next Steps

After basic setup:
1. Run `/speckit.tasks` to generate implementation tasks
2. Implement each task in order
3. Test flows end-to-end
4. Deploy to Vercel
