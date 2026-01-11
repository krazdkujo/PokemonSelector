// Gen 1 Type Effectiveness Chart
// Based on Pokemon Red/Blue/Yellow type matchups

export interface TypeData {
  strongAgainst: string[];
  weakAgainst: string[];
  immuneTo: string[];
}

export const TYPE_CHART: Record<string, TypeData> = {
  normal: {
    strongAgainst: [],
    weakAgainst: ['rock', 'steel'],
    immuneTo: ['ghost'],
  },
  fire: {
    strongAgainst: ['grass', 'ice', 'bug', 'steel'],
    weakAgainst: ['fire', 'water', 'rock', 'dragon'],
    immuneTo: [],
  },
  water: {
    strongAgainst: ['fire', 'ground', 'rock'],
    weakAgainst: ['water', 'grass', 'dragon'],
    immuneTo: [],
  },
  electric: {
    strongAgainst: ['water', 'flying'],
    weakAgainst: ['electric', 'grass', 'dragon'],
    immuneTo: ['ground'],
  },
  grass: {
    strongAgainst: ['water', 'ground', 'rock'],
    weakAgainst: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
    immuneTo: [],
  },
  ice: {
    strongAgainst: ['grass', 'ground', 'flying', 'dragon'],
    weakAgainst: ['fire', 'water', 'ice', 'steel'],
    immuneTo: [],
  },
  fighting: {
    strongAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'],
    weakAgainst: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
    immuneTo: ['ghost'],
  },
  poison: {
    strongAgainst: ['grass', 'fairy'],
    weakAgainst: ['poison', 'ground', 'rock', 'ghost'],
    immuneTo: ['steel'],
  },
  ground: {
    strongAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'],
    weakAgainst: ['grass', 'bug'],
    immuneTo: ['flying'],
  },
  flying: {
    strongAgainst: ['grass', 'fighting', 'bug'],
    weakAgainst: ['electric', 'rock', 'steel'],
    immuneTo: [],
  },
  psychic: {
    strongAgainst: ['fighting', 'poison'],
    weakAgainst: ['psychic', 'steel'],
    immuneTo: ['dark'],
  },
  bug: {
    strongAgainst: ['grass', 'psychic', 'dark'],
    weakAgainst: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
    immuneTo: [],
  },
  rock: {
    strongAgainst: ['fire', 'ice', 'flying', 'bug'],
    weakAgainst: ['fighting', 'ground', 'steel'],
    immuneTo: [],
  },
  ghost: {
    strongAgainst: ['psychic', 'ghost'],
    weakAgainst: ['dark'],
    immuneTo: ['normal'],
  },
  dragon: {
    strongAgainst: ['dragon'],
    weakAgainst: ['steel'],
    immuneTo: ['fairy'],
  },
  dark: {
    strongAgainst: ['psychic', 'ghost'],
    weakAgainst: ['fighting', 'dark', 'fairy'],
    immuneTo: [],
  },
  steel: {
    strongAgainst: ['ice', 'rock', 'fairy'],
    weakAgainst: ['fire', 'water', 'electric', 'steel'],
    immuneTo: [],
  },
  fairy: {
    strongAgainst: ['fighting', 'dragon', 'dark'],
    weakAgainst: ['fire', 'poison', 'steel'],
    immuneTo: [],
  },
};

/**
 * Calculate type effectiveness multiplier for an attack
 * @param attackType The type of the attacking move
 * @param defenderTypes The types of the defending Pokemon
 * @returns Effectiveness multiplier (0, 0.25, 0.5, 1, 2, or 4)
 */
export function getTypeEffectiveness(
  attackType: string,
  defenderTypes: string[]
): number {
  const normalizedAttackType = attackType.toLowerCase();
  const typeData = TYPE_CHART[normalizedAttackType];

  if (!typeData) {
    return 1.0; // Unknown type, neutral effectiveness
  }

  let effectiveness = 1.0;

  for (const defType of defenderTypes) {
    const normalizedDefType = defType.toLowerCase();

    if (typeData.immuneTo.includes(normalizedDefType)) {
      return 0; // Immunity takes precedence
    }

    if (typeData.strongAgainst.includes(normalizedDefType)) {
      effectiveness *= 2.0;
    } else if (typeData.weakAgainst.includes(normalizedDefType)) {
      effectiveness *= 0.5;
    }
  }

  return effectiveness;
}

/**
 * Get a human-readable effectiveness description
 * @param effectiveness The effectiveness multiplier
 * @returns 'super_effective', 'neutral', or 'not_very_effective'
 */
export function getEffectivenessLabel(
  effectiveness: number
): 'super_effective' | 'neutral' | 'not_very_effective' {
  if (effectiveness >= 2) {
    return 'super_effective';
  } else if (effectiveness < 1) {
    return 'not_very_effective';
  }
  return 'neutral';
}

/**
 * Check if a move has STAB (Same Type Attack Bonus)
 * @param moveType The type of the move
 * @param pokemonTypes The types of the attacking Pokemon
 * @returns true if the move gets STAB
 */
export function hasStabBonus(moveType: string, pokemonTypes: string[]): boolean {
  const normalizedMoveType = moveType.toLowerCase();
  return pokemonTypes.some(type => type.toLowerCase() === normalizedMoveType);
}

/**
 * STAB multiplier constant (1.5x in main games, using 1.25 for balance)
 */
export const STAB_MULTIPLIER = 1.25;
