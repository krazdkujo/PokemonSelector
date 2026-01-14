# PokemonSelector Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-07

## Active Technologies
- TypeScript 5.x (strict mode) + `@supabase/supabase-js`, `@supabase/ssr`, React 18+ (001-starter-pokemon-flow)
- Supabase Postgres (001-starter-pokemon-flow)
- TypeScript 5.x (strict mode) + `@supabase/supabase-js`, `@supabase/ssr` (existing) (002-external-trainer-api)
- Supabase Postgres (existing `trainers` table) (002-external-trainer-api)
- Supabase Postgres (existing infrastructure) (005-expand-constitution)
- TypeScript 5.x (strict mode) + Next.js 14.2, React 18, @supabase/supabase-js, @supabase/ssr, seedrandom (006-combat-zones)
- Supabase Postgres (existing `battles` table with JSONB `wild_pokemon` field) (006-combat-zones)
- Supabase Postgres (existing `pokemon_owned` and `battles` tables) (007-experience-leveling)
- Supabase Postgres (existing `battles`, `pokemon_owned`, `battle_rounds` tables) (008-combat-refinement)
- TypeScript 5.x (strict mode) + Next.js 14.2, React 18, @supabase/supabase-js 2.89, @supabase/ssr 0.8, bcryptjs (009-admin-dashboard-api)
- Supabase Postgres (existing tables: trainers, pokemon_owned, user_stats, user_secrets, battles) (009-admin-dashboard-api)
- TypeScript 5.x (strict mode) + Next.js 14.2, @supabase/supabase-js 2.89, @supabase/ssr 0.8, bcryptjs (010-api-security-separation)
- TypeScript 5.x (strict mode) with Next.js 14.2 + `@supabase/supabase-js` 2.89, `@supabase/ssr` 0.8, Next.js App Router (011-pokecenter-api-sorting)
- Supabase Postgres (`pokemon_owned` table with `captured_at` column) (011-pokecenter-api-sorting)
- TypeScript 5.x (strict mode) with Next.js 14.2 + `@supabase/supabase-js` 2.89, `@supabase/ssr` 0.8, React 18 (012-pokemon-evolution)
- Supabase Postgres (`pokemon_owned` table, new `can_evolve` column) (012-pokemon-evolution)
- Supabase PostgreSQL (existing `trainers` table extended with PIN fields) (013-pin-auth)
- TypeScript 5.x (strict mode) with Next.js 14.2 + React 18, Tailwind CSS 3.4.1, @supabase/supabase-js 2.89, @supabase/ssr 0.8 (014-dark-mode)
- Browser localStorage for theme preference persistence (no database changes) (014-dark-mode)
- [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION] (015-vercel-ui-redesign)
- [if applicable, e.g., PostgreSQL, CoreData, files or N/A] (015-vercel-ui-redesign)
- Static JSON file bundled with application (read-only, versioned with app) (016-build-changelog)

- TypeScript 5.x (or Node.js script) + None (pure JSON transformation, native fs/JSON APIs) (001-sanitize-pokemon-data)

## Project Structure

```text
src/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (or Node.js script): Follow standard conventions

## Recent Changes
- 016-build-changelog: Added TypeScript 5.x (strict mode) with Next.js 14.2 + `@supabase/supabase-js` 2.89, `@supabase/ssr` 0.8, React 18
- 015-vercel-ui-redesign: Added [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION] + [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]
- 014-dark-mode: Added TypeScript 5.x (strict mode) with Next.js 14.2 + React 18, Tailwind CSS 3.4.1, @supabase/supabase-js 2.89, @supabase/ssr 0.8


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
