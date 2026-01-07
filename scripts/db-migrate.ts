/**
 * Database Migration Runner
 *
 * Reads SQL files from the sql/ folder and executes them against Supabase.
 * Tracks which migrations have been run in a _migrations table.
 *
 * Usage:
 *   npx tsx scripts/db-migrate.ts           # Run all pending migrations
 *   npx tsx scripts/db-migrate.ts --reset   # Drop all tables and re-run all migrations
 *   npx tsx scripts/db-migrate.ts --status  # Show migration status
 */

import postgres from 'postgres';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Build DATABASE_URL from components or use directly if provided
let DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!dbPassword) {
    console.error('ERROR: SUPABASE_DB_PASSWORD not found in .env.local');
    console.error('');
    console.error('Add your database password to .env.local:');
    console.error('SUPABASE_DB_PASSWORD=your-password-here');
    console.error('');
    console.error('Find it in Supabase Dashboard > Project Settings > Database > Database password');
    process.exit(1);
  }

  if (!supabaseUrl) {
    console.error('ERROR: NEXT_PUBLIC_SUPABASE_URL not found in .env.local');
    process.exit(1);
  }

  // Extract project ref from Supabase URL (e.g., https://xxxxx.supabase.co -> xxxxx)
  const projectRef = supabaseUrl.replace('https://', '').replace('.supabase.co', '');

  // Use pooler connection (more reliable than direct connection)
  // Region can be overridden with SUPABASE_DB_REGION env var
  const region = process.env.SUPABASE_DB_REGION || 'us-west-2';
  DATABASE_URL = `postgresql://postgres.${projectRef}:${dbPassword}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
}

const sql = postgres(DATABASE_URL, {
  ssl: 'require',
  connection: {
    application_name: 'pokemon-selector-migrations',
  },
});

const SQL_DIR = path.join(process.cwd(), 'sql');

interface Migration {
  id: number;
  name: string;
  executed_at: Date;
}

async function ensureMigrationTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

async function getExecutedMigrations(): Promise<string[]> {
  const rows = await sql<Migration[]>`
    SELECT name FROM _migrations ORDER BY id
  `;
  return rows.map(r => r.name);
}

async function getMigrationFiles(): Promise<string[]> {
  if (!fs.existsSync(SQL_DIR)) {
    console.error(`ERROR: SQL directory not found: ${SQL_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(SQL_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files;
}

async function runMigration(filename: string): Promise<void> {
  const filepath = path.join(SQL_DIR, filename);
  const sqlContent = fs.readFileSync(filepath, 'utf-8');

  console.log(`  Running: ${filename}`);

  try {
    // Execute the SQL file
    await sql.unsafe(sqlContent);

    // Record the migration
    await sql`
      INSERT INTO _migrations (name) VALUES (${filename})
    `;

    console.log(`  ✓ Completed: ${filename}`);
  } catch (error) {
    console.error(`  ✗ Failed: ${filename}`);
    throw error;
  }
}

async function showStatus(): Promise<void> {
  await ensureMigrationTable();

  const executed = await getExecutedMigrations();
  const files = await getMigrationFiles();

  console.log('\nMigration Status:');
  console.log('─'.repeat(50));

  for (const file of files) {
    const status = executed.includes(file) ? '✓ executed' : '○ pending';
    console.log(`  ${status}  ${file}`);
  }

  const pending = files.filter(f => !executed.includes(f));
  console.log('─'.repeat(50));
  console.log(`Total: ${files.length} migrations, ${executed.length} executed, ${pending.length} pending\n`);
}

async function resetDatabase(): Promise<void> {
  console.log('\n⚠️  RESETTING DATABASE - All data will be lost!');
  console.log('─'.repeat(50));

  // Drop the migrations table to start fresh
  await sql`DROP TABLE IF EXISTS _migrations CASCADE`;

  // Get all user tables and drop them
  const tables = await sql<{ tablename: string }[]>`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename NOT LIKE 'pg_%'
  `;

  for (const { tablename } of tables) {
    console.log(`  Dropping table: ${tablename}`);
    await sql.unsafe(`DROP TABLE IF EXISTS "${tablename}" CASCADE`);
  }

  console.log('  ✓ Database reset complete\n');
}

async function migrate(reset = false): Promise<void> {
  console.log('\n🗄️  Pokemon Selector Database Migration');
  console.log('─'.repeat(50));

  if (reset) {
    await resetDatabase();
  }

  await ensureMigrationTable();

  const executed = await getExecutedMigrations();
  const files = await getMigrationFiles();
  const pending = files.filter(f => !executed.includes(f));

  if (pending.length === 0) {
    console.log('  No pending migrations.\n');
    return;
  }

  console.log(`  Found ${pending.length} pending migration(s):\n`);

  for (const file of pending) {
    await runMigration(file);
  }

  console.log('\n✓ All migrations completed successfully!\n');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  try {
    if (args.includes('--status')) {
      await showStatus();
    } else if (args.includes('--reset')) {
      await migrate(true);
    } else {
      await migrate(false);
    }
  } catch (error) {
    console.error('\nMigration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

main();
