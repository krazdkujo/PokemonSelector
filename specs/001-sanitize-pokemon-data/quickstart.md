# Quickstart: Sanitize Pokemon Data

**Feature**: 001-sanitize-pokemon-data

## Prerequisites

- Node.js 18+ installed
- Repository cloned with `pokemon/pokemon.json` present

## Run the Sanitization Script

```bash
# From repository root
npx tsx scripts/sanitize-pokemon.ts
```

Or if using npm scripts (after implementation):

```bash
npm run sanitize-pokemon
```

## Verify Output

1. Check that `pokemon/pokemon-sanitized.json` was created
2. Verify file contains exactly 151 entries:

```bash
# Count entries (should output 151)
node -e "console.log(require('./pokemon/pokemon-sanitized.json').length)"
```

3. Verify first and last entries:

```bash
# Should show Bulbasaur (1) and Mew (151)
node -e "const d=require('./pokemon/pokemon-sanitized.json'); console.log(d[0].name, d[0].number); console.log(d[150].name, d[150].number)"
```

4. Verify file size reduction:

```bash
# Original should be ~3MB, sanitized should be ~50KB
ls -lh pokemon/pokemon*.json
```

## Expected Output Structure

Each Pokemon entry should have exactly 3 fields:

```json
{
  "name": "Bulbasaur",
  "number": 1,
  "sprites": {
    "main": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png",
    "sprite": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png"
  }
}
```

## Troubleshooting

**Script not found**: Ensure you're in the repository root directory.

**Original file missing**: Check that `pokemon/pokemon.json` exists.

**Permission denied**: Ensure write permissions on the `pokemon/` directory.

**Invalid JSON output**: Re-run the script; if issue persists, check source file integrity.
