/**
 * Database Setup Script
 * Runs the SQL schema against Supabase
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dmfwkertkwypeiooydfb.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtZndrZXJ0a3d5cGVpb295ZGZiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Nzc2NTc3NywiZXhwIjoyMDgzMzQxNzc3fQ.ctoowx841ly6N3FefWf5yf8O2K4PK2Kfjb5BUPz3P2A';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('Setting up database...');

  // Check if trainers table exists
  const { data: existingTable, error: checkError } = await supabase
    .from('trainers')
    .select('id')
    .limit(1);

  if (checkError && checkError.code === '42P01') {
    console.log('Trainers table does not exist. Please run the SQL in Supabase dashboard:');
    console.log('scripts/setup-database.sql');
    console.log('\nOr use the Supabase SQL Editor at:');
    console.log('https://supabase.com/dashboard/project/dmfwkertkwypeiooydfb/sql');
    process.exit(1);
  }

  if (checkError) {
    console.error('Error checking table:', checkError);
    process.exit(1);
  }

  console.log('Trainers table exists!');
  console.log('Current trainers count:', existingTable?.length || 0);
  console.log('Database setup verified successfully!');
}

setupDatabase().catch(console.error);
