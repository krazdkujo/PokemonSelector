# SQL Migrations

This folder contains all database migrations for the Pokemon Starter Selector.

## Usage

```bash
# Run all pending migrations
npm run db:migrate

# Check migration status
npm run db:status

# Reset database and re-run all migrations (WARNING: destroys all data)
npm run db:reset
```

## Setup

1. Get your database connection string from Supabase:
   - Go to **Project Settings** > **Database** > **Connection string**
   - Select **URI** tab
   - Copy the connection string (use "Session pooler" mode)

2. Add it to `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres.xxxxx:[YOUR-PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres
   ```

3. Run migrations:
   ```bash
   npm run db:migrate
   ```

## Creating New Migrations

1. Create a new SQL file in this folder with the naming convention:
   ```
   NNN_description.sql
   ```
   Examples:
   - `001_initial_schema.sql`
   - `002_add_user_preferences.sql`
   - `003_create_battle_history.sql`

2. Files are executed in alphabetical order, so use zero-padded numbers.

3. Run `npm run db:migrate` to apply the new migration.

## Migration Tracking

Executed migrations are tracked in the `_migrations` table. Each migration runs only once.
