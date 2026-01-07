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
  starter_pokemon_uuid: string | null;
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
    uuid: string;
    number: number;
    name: string;
    types: string[];
  } | null;
}
