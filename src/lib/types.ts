// Pokemon types from local JSON data
export interface Pokemon {
  number: number;
  name: string;
  types: string[];
  sprites: {
    main: string;
    sprite: string;
  };
}

// Trainer types from Supabase
export interface Trainer {
  id: string;
  name: string;
  role: 'trainer' | 'admin';
  starter_pokemon_id: number | null;
  created_at: string;
  updated_at: string;
}

// Combined type for dashboard display
export interface TrainerWithStarter extends Trainer {
  starter: Pokemon | null;
}

// API response types
export interface ApiError {
  error: string;
  message: string;
}

export interface CreateTrainerRequest {
  name: string;
}

export interface SelectStarterRequest {
  pokemon_id: number;
}

// Session state
export interface SessionState {
  trainerId: string | null;
}

// External API response type
export interface ExternalTrainerResponse {
  trainer_id: string;
  trainer_name: string;
  pokemon: {
    number: number;
    name: string;
    types: string[];
  } | null;
}

// User secret key for API authentication
export interface UserSecret {
  id: string;
  user_id: string;
  key_hash: string;
  created_at: string;
  last_used_at: string | null;
}

// Pokemon owned by a user
export interface PokemonOwned {
  id: string;
  user_id: string;
  pokemon_id: number;
  level: number;
  selected_moves: string[];
  is_active: boolean;
  is_starter: boolean;
  captured_at: string;
}

// Wild Pokemon encountered in battle
export interface WildPokemon {
  pokemon_id: number;
  name: string;
  level: number;
  sr: number;
  types: string[];
  current_hp: number;
  sprite_url: string;
}

// Battle difficulty levels
export type BattleDifficulty = 'easy' | 'normal' | 'difficult';

// Battle status values
export type BattleStatus = 'active' | 'player_won' | 'wild_won' | 'captured' | 'fled';

// Battle encounter
export interface Battle {
  id: string;
  user_id: string;
  player_pokemon_id: string;
  wild_pokemon: WildPokemon;
  difficulty: BattleDifficulty;
  player_wins: number;
  wild_wins: number;
  capture_attempts: number;
  status: BattleStatus;
  seed: string;
  created_at: string;
  ended_at: string | null;
}

// Individual battle round result
export interface BattleRound {
  id: string;
  battle_id: string;
  round_number: number;
  player_move: string;
  winner: 'player' | 'wild';
  roll: number;
  base_chance: number;
  type_bonus: number;
  stab_bonus: number;
  created_at: string;
}

// User statistics and economy
export interface UserStats {
  id: string;
  user_id: string;
  money: number;
  items: Record<string, number>;
  battles_won: number;
  battles_lost: number;
  pokemon_captured: number;
  created_at: string;
  updated_at: string;
}

// Extended trainer with all related data
export interface TrainerWithData extends Trainer {
  active_pokemon: PokemonOwned | null;
  pokemon_collection: PokemonOwned[];
  stats: UserStats | null;
}

// Type effectiveness result
export type TypeEffectiveness = 'super_effective' | 'neutral' | 'not_very_effective';

// Round result from battle API
export interface RoundResult {
  round_number: number;
  player_move: string;
  winner: 'player' | 'wild';
  roll: number;
  dc: number;
  base_chance: number;
  type_effectiveness: TypeEffectiveness;
  had_stab: boolean;
}

// Capture attempt result
export interface CaptureResult {
  success: boolean;
  roll: number;
  dc: number;
  fled: boolean;
}

// Dashboard aggregated data
export interface Dashboard {
  trainer_name: string;
  active_pokemon: PokemonOwnedWithDetails | null;
  pokemon_count: number;
  stats: UserStats;
  has_active_battle: boolean;
}

// Pokemon owned with enriched details from JSON
export interface PokemonOwnedWithDetails extends PokemonOwned {
  name: string;
  types: string[];
  sr: number;
  sprite_url: string;
}

// Move data from moves-cleaned.json
export interface Move {
  id: string;
  name: string;
  type: string;
  description?: string;
}

// Secret key metadata (returned from GET /secret-key)
export interface SecretKeyMeta {
  has_key: boolean;
  created_at: string | null;
  last_used_at: string | null;
}

// Secret key response (returned from POST /secret-key)
export interface SecretKeyResponse {
  key: string;
  created_at: string;
}

// ============================================
// Zone-based Battle Types (006-combat-zones)
// ============================================

// Zone configuration for combat encounters
export interface Zone {
  id: string;
  name: string;
  description: string;
  types: string[];
  color: string;
}

// Zone difficulty levels (different from legacy BattleDifficulty)
export type ZoneDifficulty = 'easy' | 'medium' | 'hard';

// Difficulty constraints for zone encounters
export interface DifficultyConstraints {
  maxSrOffset: number;      // Max SR above player (Infinity for 'hard')
  minLevelOffset: number;   // Min level offset from player
  maxLevelOffset: number;   // Max level offset from player
}

// Zone battle request
export interface StartZoneBattleRequest {
  zone_id: string;
  difficulty: ZoneDifficulty;
}

// Extended Battle type with zone support
export interface ZoneBattle extends Battle {
  zone: string | null;
}

// Valid zone IDs
export type ZoneId =
  | 'jungle'
  | 'ocean'
  | 'volcano'
  | 'power-plant'
  | 'haunted-tower'
  | 'frozen-cave'
  | 'dojo'
  | 'dragon-shrine';

// Zone preview response
export interface ZoneDifficultyPreview {
  description: string;
  example_pokemon: string[];
  pokemon_count: number;
}

export interface ZonePreviewResponse {
  zone: Pick<Zone, 'id' | 'name' | 'types'>;
  difficulties: {
    easy: ZoneDifficultyPreview;
    medium: ZoneDifficultyPreview;
    hard: ZoneDifficultyPreview;
  };
}
