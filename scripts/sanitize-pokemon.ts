/**
 * Pokemon Data Sanitization Script
 *
 * Transforms pokemon/pokemon.json to contain only the first 151 Pokemon
 * with fields: name, number, types, and sprites (non-shiny only).
 * Fetches type data from PokeAPI.
 */

import { readFileSync, writeFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// TypeScript Interfaces
interface Sprites {
  main: string;
  sprite: string;
}

interface Pokemon {
  number: number;
  name: string;
  types: string[];
  sprites: Sprites;
}

// Source Pokemon structure (from original file)
interface SourceMedia {
  main?: string;
  sprite?: string;
  mainShiny?: string;
  spriteShiny?: string;
}

interface SourcePokemon {
  id: string;
  name: string;
  number: number;
  media?: SourceMedia;
  [key: string]: unknown;
}

// PokeAPI response structure
interface PokeAPIType {
  type: {
    name: string;
  };
}

interface PokeAPIResponse {
  types: PokeAPIType[];
}

// Get directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// File paths
const INPUT_FILE = join(projectRoot, 'pokemon', 'pokemon.json');
const OUTPUT_FILE = join(projectRoot, 'src', 'data', 'pokemon.json');

// Fetch types from PokeAPI
async function fetchTypes(pokemonNumber: number): Promise<string[]> {
  try {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonNumber}`);
    if (!response.ok) {
      console.warn(`Failed to fetch types for Pokemon #${pokemonNumber}`);
      return [];
    }
    const data = await response.json() as PokeAPIResponse;
    return data.types.map(t => capitalize(t.type.name));
  } catch (error) {
    console.warn(`Error fetching types for Pokemon #${pokemonNumber}:`, error);
    return [];
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Read source file
function readSourceFile(): SourcePokemon[] {
  console.log(`Reading source file: ${INPUT_FILE}`);
  const content = readFileSync(INPUT_FILE, 'utf-8');
  return JSON.parse(content) as SourcePokemon[];
}

// Filter to Gen 1 only (numbers 1-151)
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

// Transform to minimal structure with types
async function transformPokemon(source: SourcePokemon): Promise<Pokemon> {
  const types = await fetchTypes(source.number);

  const sprites: Sprites = {
    main: source.media?.main || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${source.number}.png`,
    sprite: source.media?.sprite || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${source.number}.png`
  };

  return {
    number: source.number,
    name: source.name,
    types,
    sprites
  };
}

// Sort by Pokemon number ascending
function sortByNumber(pokemon: Pokemon[]): Pokemon[] {
  return [...pokemon].sort((a, b) => a.number - b.number);
}

// Write output file
function writeOutputFile(pokemon: Pokemon[]): void {
  const content = JSON.stringify(pokemon, null, 2);
  writeFileSync(OUTPUT_FILE, content, 'utf-8');
  console.log(`Output written to: ${OUTPUT_FILE}`);
}

// Report statistics
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
async function main(): Promise<void> {
  try {
    // Read source data
    const sourceData = readSourceFile();
    console.log(`Source file contains ${sourceData.length} Pokemon`);

    // Filter to Gen 1
    const gen1Data = filterGen1(sourceData);
    console.log(`Filtered to ${gen1Data.length} Gen 1 Pokemon`);

    // Transform with types (with rate limiting)
    console.log('Fetching types from PokeAPI...');
    const transformed: Pokemon[] = [];
    for (let i = 0; i < gen1Data.length; i++) {
      const pokemon = await transformPokemon(gen1Data[i]);
      transformed.push(pokemon);
      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1}/${gen1Data.length} Pokemon`);
      }
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Sort by number
    const sorted = sortByNumber(transformed);

    // Validate types
    const missingTypes = sorted.filter(p => p.types.length === 0);
    if (missingTypes.length > 0) {
      console.warn(`\nWarning: ${missingTypes.length} Pokemon missing types`);
      missingTypes.forEach(p => console.warn(`  - ${p.name} (#${p.number})`));
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

    console.log('\nSample output:');
    console.log('First:', sorted[0].name, `#${sorted[0].number}`, sorted[0].types);
    console.log('Last:', sorted[150].name, `#${sorted[150].number}`, sorted[150].types);
  } catch (error) {
    console.error('Error during sanitization:', error);
    process.exit(1);
  }
}

main();
