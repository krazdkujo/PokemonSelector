-- Migration: 001_initial_schema
-- Description: Initial database schema for Pokemon Starter Selector
-- Created: 2026-01-07

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- WARNING: DO NOT ADD DROP TABLE STATEMENTS TO MIGRATIONS
-- This migration should only create tables if they don't exist
-- Use ALTER TABLE for schema changes, never DROP + CREATE
-- ============================================================

-- Trainers table (only create if not exists - NEVER drop existing data)
CREATE TABLE IF NOT EXISTS trainers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(20) NOT NULL CHECK (char_length(trim(name)) >= 1),
  role VARCHAR(10) NOT NULL DEFAULT 'trainer' CHECK (role IN ('trainer', 'admin')),
  starter_pokemon_id INTEGER UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for admin queries (only if not exists)
CREATE INDEX IF NOT EXISTS idx_trainers_role ON trainers(role);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-updating updated_at
DROP TRIGGER IF EXISTS trainers_updated_at ON trainers;
CREATE TRIGGER trainers_updated_at
  BEFORE UPDATE ON trainers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- Allow all operations (no auth for classroom use)
DROP POLICY IF EXISTS "Allow all operations" ON trainers;
CREATE POLICY "Allow all operations" ON trainers
  FOR ALL
  USING (true)
  WITH CHECK (true);
