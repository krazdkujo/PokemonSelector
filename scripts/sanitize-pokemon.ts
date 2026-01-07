/**
 * Pokemon Data Sanitization Script
 *
 * Transforms pokemon/pokemon.json to contain only the first 151 Pokemon
 * with minimal fields: name, number, and sprites (non-shiny only).
 */

import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// TypeScript Interfaces (T003)
interface Sprites {
  main: string;    // Official artwork URL
  sprite: string;  // Small sprite URL
}

interface Pokemon {
  name: string;    // Display name
  number: number;  // Pokedex number (1-151)
  sprites: Sprites;
}

// Source Pokemon structure (from original file)
// Note: The source file uses "media" not "sprites" for image URLs
interface SourceMedia {
  main?: string;
  sprite?: string;
  mainShiny?: string;
  spriteShiny?: string;
}

interface SourcePokemon {
  id: string;        // Lowercase identifier (e.g., "bulbasaur")
  name: string;
  number: number;
  media?: SourceMedia;  // Images are under "media" in source
  [key: string]: unknown; // Allow other fields we'll ignore
}

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// File paths
const INPUT_FILE = join(projectRoot, 'pokemon', 'pokemon.json');
const OUTPUT_FILE = join(projectRoot, 'pokemon', 'pokemon-sanitized.json');

// T004: Read source file
function readSourceFile(): SourcePokemon[] {
  console.log(`Reading source file: ${INPUT_FILE}`);
  const content = readFileSync(INPUT_FILE, 'utf-8');
  return JSON.parse(content) as SourcePokemon[];
}

// T005: Filter to Gen 1 only (numbers 1-151), keeping only first occurrence of each number
// This excludes regional variants (Alolan, Galarian, Paldean) which share the same number
function filterGen1(pokemon: SourcePokemon[]): SourcePokemon[] {
  const seen = new Set<number>();
  return pokemon.filter(p => {
    if (p.number >= 1 && p.number <= 151 && !seen.has(p.number)) {
      seen.add(p.number);
      return true;
    }
    return false;
  });
}

// T006 & T007: Transform to minimal structure (exclude shiny variants)
// Note: Source uses "media" field, output uses "sprites" field
function transformPokemon(source: SourcePokemon): Pokemon {
  const sprites: Sprites = {
    main: source.media?.main || '',
    sprite: source.media?.sprite || ''
  };

  return {
    name: source.name,
    number: source.number,
    sprites
  };
}

// T008: Sort by Pokemon number ascending
function sortByNumber(pokemon: Pokemon[]): Pokemon[] {
  return [...pokemon].sort((a, b) => a.number - b.number);
}

// T011 & T012: Validate image URLs
function validatePokemon(pokemon: Pokemon[]): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  for (const p of pokemon) {
    if (!p.sprites.main) {
      warnings.push(`Warning: ${p.name} (#${p.number}) missing main artwork URL`);
    }
    if (!p.sprites.sprite) {
      warnings.push(`Warning: ${p.name} (#${p.number}) missing sprite URL`);
    }
  }

  return {
    valid: warnings.length === 0,
    warnings
  };
}

// T009: Write output file
function writeOutputFile(pokemon: Pokemon[]): void {
  const content = JSON.stringify(pokemon, null, 2);
  writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`Output written to: ${OUTPUT_FILE}`);
}

// T010: Report statistics
function reportStats(inputFile: string, outputFile: string, count: number): void {
  const inputSize = statSync(inputFile).size;
  const outputSize = statSync(outputFile).size;
  const reduction = ((1 - outputSize / inputSize) * 100).toFixed(1);

  console.log('\n=== Sanitization Complete ===');
  console.log(`Pokemon count: ${count}`);
  console.log(`Input size:    ${(inputSize / 1024).toFixed(1)} KB`);
  console.log(`Output size:   ${(outputSize / 1024).toFixed(1)} KB`);
  console.log(`Size reduction: ${reduction}%`);
}

// Main execution
function main(): void {
  try {
    // Read source data
    const sourceData = readSourceFile();
    console.log(`Source file contains ${sourceData.length} Pokemon`);

    // Filter to Gen 1
    const gen1Data = filterGen1(sourceData);
    console.log(`Filtered to ${gen1Data.length} Gen 1 Pokemon`);

    // Transform to minimal structure
    const transformed = gen1Data.map(transformPokemon);

    // Sort by number
    const sorted = sortByNumber(transformed);

    // Validate
    const validation = validatePokemon(sorted);
    if (validation.warnings.length > 0) {
      console.log('\nValidation warnings:');
      validation.warnings.forEach(w => console.log(`  ${w}`));
    }

    // Write output
    writeOutputFile(sorted);

    // Report stats
    reportStats(INPUT_FILE, OUTPUT_FILE, sorted.length);

    // Final validation
    if (sorted.length !== 151) {
      console.error(`\nERROR: Expected 151 Pokemon, got ${sorted.length}`);
      process.exit(1);
    }

    console.log('\nFirst Pokemon:', sorted[0].name, `#${sorted[0].number}`);
    console.log('Last Pokemon:', sorted[150].name, `#${sorted[150].number}`);
  } catch (error) {
    console.error('Error during sanitization:', error);
    process.exit(1);
  }
}

main();
