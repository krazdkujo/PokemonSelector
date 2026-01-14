'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTrainerId } from '@/lib/session';
import type { SecretKeyMeta, SecretKeyResponse } from '@/lib/types';

// Recent API changes - update this when making breaking changes
const API_CHANGELOG_VERSION = '2025-01-14';
const API_CHANGELOG = [
  {
    date: '2025-01-14',
    version: '2.0.0',
    breaking: true,
    changes: [
      {
        type: 'breaking' as const,
        endpoint: 'POST /api/trainer',
        title: 'PIN Required for Login',
        description: 'Existing accounts with a PIN set now require the PIN to be included in the login request. New accounts can still be created without a PIN.',
        before: '{ "name": "Ash" }',
        after: '{ "name": "Ash", "pin": "1234" }',
      },
      {
        type: 'breaking' as const,
        endpoint: 'GET /api/trainers',
        title: 'Auth Method Changed',
        description: 'Removed requester_id query parameter. Now uses session cookie or X-API-Key header for authentication (admin role required).',
        before: 'GET /api/trainers?requester_id=uuid',
        after: 'GET /api/trainers with X-API-Key header',
      },
      {
        type: 'improved' as const,
        endpoint: 'POST /api/trainer',
        title: 'Account Lockout Protection',
        description: 'After 5 failed PIN attempts, accounts are locked for 15 minutes. Response includes lockout_remaining_seconds when locked.',
      },
      {
        type: 'improved' as const,
        endpoint: 'All Admin Endpoints',
        title: 'Consistent Auth',
        description: 'All admin endpoints now support both session cookie (trainer_id) and API key (X-User-ID header) authentication.',
      },
      {
        type: 'fixed' as const,
        endpoint: 'POST /api/capture',
        title: 'Level 10 Capture Bug',
        description: 'Fixed bug where capturing wild Pokemon in medium/hard zones with a level 10 Pokemon would fail due to wild Pokemon exceeding max level.',
      },
    ],
  },
];

interface EndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  summary: string;
  description: string;
  auth: boolean;
  requestBody?: {
    description: string;
    example: string;
  };
  response: {
    description: string;
    example: string;
  };
  curl: string;
}

const ENDPOINTS: Record<string, EndpointDoc[]> = {
  'Account': [
    {
      method: 'GET',
      path: '/api/trainer',
      summary: 'Get your trainer profile',
      description: 'Returns the authenticated trainer\'s basic profile information including ID, name, role, and creation date.',
      auth: true,
      response: {
        description: 'Trainer profile',
        example: `{
  "id": "uuid",
  "name": "Ash",
  "role": "trainer",
  "created_at": "2024-01-01T00:00:00Z"
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/trainer',
    },
    {
      method: 'POST',
      path: '/api/trainer',
      summary: 'Create or login as trainer',
      description: 'Creates a new trainer account or logs into existing one. New accounts: PIN optional. Existing accounts with PIN: PIN required (5 attempts, then 15 min lockout).',
      auth: false,
      requestBody: {
        description: 'Trainer name and PIN (if account has PIN set)',
        example: `{
  "name": "Ash",
  "pin": "1234"
}`,
      },
      response: {
        description: 'Trainer profile (201 for new, 200 for existing)',
        example: `{
  "id": "uuid",
  "name": "Ash",
  "role": "trainer",
  "created_at": "2024-01-01T00:00:00Z",
  "pin_not_set": true
}`,
      },
      curl: `curl -X POST -H "Content-Type: application/json" \\
  -d '{"name": "Ash", "pin": "1234"}' https://domain.com/api/trainer`,
    },
    {
      method: 'GET',
      path: '/api/external/trainer',
      summary: 'Get trainer profile with full statistics (External API)',
      description: 'Returns complete trainer information including name, role, statistics (battles won/lost, Pokemon captured), money, and items. For use with external API key authentication.',
      auth: true,
      response: {
        description: 'Trainer profile with stats',
        example: `{
  "id": "uuid",
  "name": "Ash",
  "role": "trainer",
  "stats": {
    "battles_won": 10,
    "battles_lost": 2,
    "pokemon_captured": 5,
    "money": 1500,
    "items": {}
  },
  "created_at": "2024-01-01T00:00:00Z"
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/external/trainer',
    },
    {
      method: 'GET',
      path: '/api/dashboard',
      summary: 'Get dashboard data with active Pokemon and stats',
      description: 'Returns dashboard information including the active Pokemon details, trainer stats, battle status, and Pokemon count.',
      auth: true,
      response: {
        description: 'Dashboard data',
        example: `{
  "trainer_name": "Ash",
  "active_pokemon": {
    "id": "uuid",
    "name": "Pikachu",
    "level": 5,
    "types": ["Electric"],
    "sprite_url": "https://..."
  },
  "stats": {
    "money": 1500,
    "battles_won": 10,
    "battles_lost": 2,
    "pokemon_captured": 5,
    "items": {}
  },
  "has_active_battle": false,
  "pokemon_count": 3
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/dashboard',
    },
    {
      method: 'PUT',
      path: '/api/trainer/[id]/nickname',
      summary: 'Set nickname for your starter Pokemon',
      description: 'Sets or updates a nickname for your starter Pokemon. Nickname must be 1-20 characters. Send null or empty string to clear.',
      auth: true,
      requestBody: {
        description: 'Nickname to set (null to clear)',
        example: `{
  "nickname": "Sparky"
}`,
      },
      response: {
        description: 'Updated trainer with starter details',
        example: `{
  "id": "uuid",
  "name": "Ash",
  "starter_pokemon_id": 25,
  "starter_pokemon_nickname": "Sparky",
  "starter": {
    "number": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "sr": 0.45
  }
}`,
      },
      curl: `curl -X PUT -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"nickname": "Sparky"}' https://domain.com/api/trainer/{id}/nickname`,
    },
    {
      method: 'DELETE',
      path: '/api/trainer/[id]/nickname',
      summary: 'Clear nickname for your starter Pokemon',
      description: 'Removes the nickname from your starter Pokemon.',
      auth: true,
      response: {
        description: 'Updated trainer with nickname cleared',
        example: `{
  "id": "uuid",
  "name": "Ash",
  "starter_pokemon_id": 25,
  "starter_pokemon_nickname": null,
  "starter": { ... }
}`,
      },
      curl: 'curl -X DELETE -H "X-API-Key: YOUR_KEY" https://domain.com/api/trainer/{id}/nickname',
    },
  ],
  'Starter': [
    {
      method: 'GET',
      path: '/api/starter',
      summary: 'List available starter Pokemon',
      description: 'Returns all Pokemon eligible as starters (SR <= 0.5). Use this to populate the starter selection screen.',
      auth: false,
      response: {
        description: 'List of starter-eligible Pokemon',
        example: `{
  "starters": [
    {
      "id": 25,
      "name": "Pikachu",
      "types": ["Electric"],
      "sr": 0.45,
      "sprite_url": "https://..."
    },
    {
      "id": 1,
      "name": "Bulbasaur",
      "types": ["Grass", "Poison"],
      "sr": 0.3,
      "sprite_url": "https://..."
    }
  ]
}`,
      },
      curl: 'curl https://domain.com/api/starter',
    },
    {
      method: 'POST',
      path: '/api/starter',
      summary: 'Select your starter Pokemon',
      description: 'Selects a starter Pokemon for your trainer. Can only be done once. Creates initial user_stats with 100 money.',
      auth: true,
      requestBody: {
        description: 'Pokemon ID (number) of the starter to select',
        example: `{
  "pokemon_id": 25
}`,
      },
      response: {
        description: 'Created starter Pokemon details',
        example: `{
  "pokemon": {
    "id": "uuid",
    "pokemon_id": 25,
    "name": "Pikachu",
    "types": ["Electric"],
    "level": 1,
    "sr": 0.45,
    "is_starter": true,
    "is_active": true,
    "sprite_url": "https://..."
  }
}`,
      },
      curl: `curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"pokemon_id": 25}' https://domain.com/api/starter`,
    },
  ],
  Pokemon: [
    {
      method: 'GET',
      path: '/api/pokecenter',
      summary: 'List all your owned Pokemon',
      description: 'Returns all Pokemon owned by the authenticated trainer with full details including level, types, moves, stats, and evolution eligibility.',
      auth: true,
      response: {
        description: 'Pokemon collection with evolution info',
        example: `{
  "pokemon": [
    {
      "id": "uuid",
      "pokemon_id": 25,
      "name": "Pikachu",
      "level": 5,
      "types": ["Electric"],
      "sr": 45,
      "is_active": true,
      "is_starter": true,
      "can_evolve": true,
      "selected_moves": ["thunderbolt", "quick-attack"],
      "experience": 12,
      "experience_to_next": 4,
      "evolution_info": {
        "canEvolve": true,
        "currentStage": 1,
        "totalStages": 2,
        "evolvesAtLevel": 5,
        "nextEvolutionId": 26,
        "nextEvolutionName": "Raichu"
      }
    }
  ],
  "active_pokemon_id": "uuid"
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/pokecenter',
    },
    {
      method: 'POST',
      path: '/api/pokecenter/swap',
      summary: 'Set a different Pokemon as active',
      description: 'Swaps the currently active Pokemon. Cannot swap during an active battle.',
      auth: true,
      requestBody: {
        description: 'Pokemon ID to set as active',
        example: `{
  "pokemon_id": "uuid-of-pokemon-to-activate"
}`,
      },
      response: {
        description: 'Updated active Pokemon',
        example: `{
  "active_pokemon": {
    "id": "uuid",
    "name": "Charizard",
    "level": 8,
    "types": ["Fire", "Flying"]
  }
}`,
      },
      curl: `curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"pokemon_id": "uuid"}' https://domain.com/api/pokecenter/swap`,
    },
    {
      method: 'GET',
      path: '/api/pokedex',
      summary: 'Browse all available Pokemon in the game',
      description: 'Returns a paginated list of all Pokemon available in the game with their base stats and information.',
      auth: true,
      response: {
        description: 'List of all Pokemon',
        example: `[
  {
    "id": 1,
    "name": "Bulbasaur",
    "types": ["Grass", "Poison"],
    "sr": 45,
    "sprite_url": "https://..."
  },
  ...
]`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/pokedex',
    },
    {
      method: 'GET',
      path: '/api/moves',
      summary: 'Get available moves for active Pokemon',
      description: 'Returns the moves available for the currently active Pokemon, including selected moves and all learnable moves.',
      auth: true,
      response: {
        description: 'Available moves',
        example: `{
  "selected_moves": ["thunderbolt", "quick-attack"],
  "available_moves": [
    {
      "id": "thunderbolt",
      "name": "Thunderbolt",
      "type": "Electric",
      "description": "A strong electric attack"
    }
  ]
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/moves',
    },
    {
      method: 'PUT',
      path: '/api/moves',
      summary: 'Update selected moves for active Pokemon',
      description: 'Updates the selected moves for the active Pokemon. Maximum 4 moves can be selected.',
      auth: true,
      requestBody: {
        description: 'Array of move IDs (max 4)',
        example: `{
  "moves": ["thunderbolt", "quick-attack", "iron-tail", "electro-ball"]
}`,
      },
      response: {
        description: 'Updated moves',
        example: `{
  "selected_moves": ["thunderbolt", "quick-attack", "iron-tail", "electro-ball"]
}`,
      },
      curl: `curl -X PUT -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"moves": ["thunderbolt", "quick-attack"]}' https://domain.com/api/moves`,
    },
  ],
  Evolution: [
    {
      method: 'POST',
      path: '/api/pokecenter/evolve',
      summary: 'Evolve a Pokemon to its next form',
      description: 'Evolves a Pokemon to its next evolution form. The Pokemon must have can_evolve: true. Evolution thresholds: 2-stage Pokemon evolve at level 5, 3-stage Pokemon evolve at levels 3 and 6. Evolution preserves level, experience, and selected moves.',
      auth: true,
      requestBody: {
        description: 'Pokemon ID (owned record UUID) to evolve',
        example: `{
  "pokemon_id": "uuid-of-pokemon-to-evolve"
}`,
      },
      response: {
        description: 'Evolution result with updated Pokemon',
        example: `{
  "success": true,
  "pokemon": {
    "id": "uuid",
    "pokemon_id": 26,
    "name": "Raichu",
    "level": 5,
    "types": ["Electric"],
    "can_evolve": false,
    "evolution_info": {
      "canEvolve": false,
      "currentStage": 2,
      "totalStages": 2,
      "evolvesAtLevel": null,
      "nextEvolutionId": null,
      "nextEvolutionName": null
    }
  },
  "evolved_from": {
    "pokemon_id": 25,
    "name": "Pikachu"
  },
  "evolved_to": {
    "pokemon_id": 26,
    "name": "Raichu"
  }
}`,
      },
      curl: `curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"pokemon_id": "uuid"}' https://domain.com/api/pokecenter/evolve`,
    },
  ],
  Battle: [
    {
      method: 'GET',
      path: '/api/zones',
      summary: 'List all combat zones (public)',
      description: 'Returns all 8 combat zones with their type associations. Each zone contains Pokemon of specific types.',
      auth: false,
      response: {
        description: 'List of combat zones',
        example: `{
  "zones": [
    {
      "id": "jungle",
      "name": "Jungle",
      "description": "Dense vegetation filled with bugs, plants, and venomous creatures",
      "types": ["bug", "grass", "poison"],
      "color": "green"
    },
    {
      "id": "ocean",
      "name": "Ocean",
      "description": "Coastal and aquatic environments with sea creatures",
      "types": ["water", "flying", "normal"],
      "color": "blue"
    }
  ]
}`,
      },
      curl: 'curl https://domain.com/api/zones',
    },
    {
      method: 'GET',
      path: '/api/zones/[zoneId]/preview',
      summary: 'Preview wild Pokemon available in a zone',
      description: 'Returns preview information for a zone including example Pokemon and counts for each difficulty level (easy, medium, hard). Results are personalized based on your active Pokemon\'s SR.',
      auth: true,
      response: {
        description: 'Zone preview with difficulty breakdowns',
        example: `{
  "zone": {
    "id": "jungle",
    "name": "Jungle",
    "types": ["bug", "grass", "poison"]
  },
  "difficulties": {
    "easy": {
      "description": "Pokemon at your level or lower, up to +2 SR above yours",
      "example_pokemon": ["Caterpie", "Weedle", "Oddish", "Bellsprout", "Paras"],
      "pokemon_count": 15,
      "all_pokemon": ["Caterpie", "Weedle", ...]
    },
    "medium": {
      "description": "Pokemon 0-3 levels higher, up to +5 SR above yours",
      "example_pokemon": ["Butterfree", "Beedrill", "Vileplume"],
      "pokemon_count": 25,
      "all_pokemon": [...]
    },
    "hard": {
      "description": "Pokemon 4-6 levels higher, any SR - maximum challenge!",
      "example_pokemon": ["Venusaur", "Victreebel"],
      "pokemon_count": 30,
      "all_pokemon": [...]
    }
  }
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/zones/jungle/preview',
    },
    {
      method: 'GET',
      path: '/api/battle',
      summary: 'Get current active battle status',
      description: 'Returns the current battle state if one is active, or null if no battle. Includes player Pokemon, wild Pokemon, round wins, and whether the wild Pokemon is already owned.',
      auth: true,
      response: {
        description: 'Active battle status (or null)',
        example: `{
  "id": "uuid",
  "user_id": "uuid",
  "status": "active",
  "zone_id": "jungle",
  "difficulty": "medium",
  "player_wins": 2,
  "wild_wins": 1,
  "capture_attempts": 0,
  "wild_pokemon": {
    "pokemon_id": 12,
    "name": "Butterfree",
    "level": 5,
    "sr": 0.8,
    "types": ["Bug", "Flying"],
    "current_hp": 100,
    "sprite_url": "https://..."
  },
  "wild_pokemon_owned": false,
  "player_pokemon": {
    "id": "uuid",
    "pokemon_id": 25,
    "name": "Pikachu",
    "level": 4,
    "types": ["Electric"],
    "sprite_url": "https://..."
  }
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/battle',
    },
    {
      method: 'POST',
      path: '/api/battle',
      summary: 'Start a new battle in a zone',
      description: 'Initiates a new battle in the specified zone at the chosen difficulty. Cannot start if a battle is already active. Wild Pokemon level and SR are determined by difficulty.',
      auth: true,
      requestBody: {
        description: 'Zone ID and difficulty level',
        example: `{
  "zone_id": "jungle",
  "difficulty": "medium"
}`,
      },
      response: {
        description: 'New battle details',
        example: `{
  "id": "uuid",
  "status": "active",
  "zone_id": "jungle",
  "difficulty": "medium",
  "wild_pokemon": {
    "pokemon_id": 12,
    "name": "Butterfree",
    "level": 5,
    "sr": 0.8,
    "types": ["Bug", "Flying"],
    "sprite_url": "https://..."
  },
  "player_pokemon": {
    "id": "uuid",
    "name": "Pikachu",
    "level": 4
  },
  "player_wins": 0,
  "wild_wins": 0
}`,
      },
      curl: `curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"zone_id": "jungle", "difficulty": "medium"}' https://domain.com/api/battle`,
    },
    {
      method: 'POST',
      path: '/api/battle/round',
      summary: 'Execute a battle round with a move',
      description: 'Executes one round using the specified move. Uses d20 roll vs DC based on level/SR/type matchups. First to 3 round wins takes the battle. On victory, awards XP and may trigger evolution eligibility.',
      auth: true,
      requestBody: {
        description: 'Move ID to use this round',
        example: `{
  "move_id": "thunderbolt"
}`,
      },
      response: {
        description: 'Round result with battle state',
        example: `{
  "round": {
    "round_number": 3,
    "player_move": "Thunderbolt",
    "move_type": "Electric",
    "winner": "player",
    "roll": 15,
    "dc": 8,
    "win_chance": 0.65,
    "effectiveness": "super_effective",
    "stab_bonus": true
  },
  "battle": {
    "id": "uuid",
    "status": "player_won",
    "player_wins": 3,
    "wild_wins": 1
  },
  "battle_ended": true,
  "experience_gained": {
    "xp_awarded": 3,
    "previous_level": 2,
    "new_level": 3,
    "previous_experience": 5,
    "new_experience": 0,
    "levels_gained": 1,
    "evolution_available": true,
    "evolution_details": {
      "from_name": "Bulbasaur",
      "from_id": 1,
      "to_name": "Ivysaur",
      "to_id": 2,
      "from_sprite": "https://...",
      "to_sprite": "https://..."
    }
  }
}`,
      },
      curl: `curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"move_id": "thunderbolt"}' https://domain.com/api/battle/round`,
    },
  ],
  Capture: [
    {
      method: 'GET',
      path: '/api/capture',
      summary: 'Check capture DC for current battle',
      description: 'Returns the current capture DC (Difficulty Class) and whether capture is allowed. Requires at least 1 round win. Cannot capture Pokemon species you already own.',
      auth: true,
      response: {
        description: 'Capture eligibility and DC',
        example: `{
  "dc": 12,
  "can_capture": true,
  "player_wins": 2,
  "wild_pokemon": "Butterfree",
  "already_owned": false,
  "ownership_message": null
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/capture',
    },
    {
      method: 'POST',
      path: '/api/capture',
      summary: 'Attempt to capture the wild Pokemon',
      description: 'Rolls d20 vs capture DC. Success captures the Pokemon. Failure gives wild Pokemon +1 round win (and 25% flee chance). Awards 1 XP on successful capture.',
      auth: true,
      response: {
        description: 'Capture attempt result',
        example: `{
  "result": {
    "success": true,
    "roll": 15,
    "dc": 12,
    "fled": false
  },
  "battle": {
    "id": "uuid",
    "status": "captured"
  },
  "captured_pokemon": {
    "id": "uuid",
    "pokemon_id": 12,
    "name": "Butterfree",
    "level": 5,
    "types": ["Bug", "Flying"],
    "sr": 0.8,
    "sprite_url": "https://..."
  },
  "experience_gained": {
    "xp_awarded": 1,
    "previous_level": 4,
    "new_level": 4,
    "levels_gained": 0,
    "evolution_available": false
  }
}`,
      },
      curl: 'curl -X POST -H "X-API-Key: YOUR_KEY" https://domain.com/api/capture',
    },
  ],
  'API Key': [
    {
      method: 'GET',
      path: '/api/secret-key',
      summary: 'Get API key metadata',
      description: 'Returns metadata about your API secret key including whether one exists, when it was created, and when last used. Does not return the key itself.',
      auth: true,
      response: {
        description: 'Key metadata',
        example: `{
  "has_key": true,
  "created_at": "2024-01-15T10:30:00Z",
  "last_used_at": "2024-01-16T14:22:00Z"
}`,
      },
      curl: 'curl -H "Cookie: trainer_id=YOUR_SESSION" https://domain.com/api/secret-key',
    },
    {
      method: 'POST',
      path: '/api/secret-key',
      summary: 'Generate or regenerate API key',
      description: 'Generates a new API secret key. The plaintext key is returned only once - save it immediately. Regenerating invalidates any previous key.',
      auth: true,
      response: {
        description: 'New key (save immediately!)',
        example: `{
  "key": "sk_live_abc123def456...",
  "created_at": "2024-01-16T15:00:00Z"
}`,
      },
      curl: 'curl -X POST -H "Cookie: trainer_id=YOUR_SESSION" https://domain.com/api/secret-key',
    },
  ],
  'PIN Security': [
    {
      method: 'GET',
      path: '/api/pin/status',
      summary: 'Check PIN status',
      description: 'Returns whether a PIN is set, if the account is locked, and if the PIN is temporary (requires change).',
      auth: true,
      response: {
        description: 'PIN status',
        example: `{
  "has_pin": true,
  "is_locked": false,
  "is_temporary": false
}`,
      },
      curl: 'curl -H "Cookie: trainer_id=YOUR_SESSION" https://domain.com/api/pin/status',
    },
    {
      method: 'POST',
      path: '/api/pin/create',
      summary: 'Create or update PIN',
      description: 'Sets a new 4-digit PIN. Both pin and confirm_pin must match.',
      auth: true,
      requestBody: {
        description: 'PIN and confirmation',
        example: `{
  "pin": "1234",
  "confirm_pin": "1234"
}`,
      },
      response: {
        description: 'Success confirmation',
        example: `{
  "success": true,
  "message": "PIN created successfully"
}`,
      },
      curl: `curl -X POST -H "Cookie: trainer_id=YOUR_SESSION" -H "Content-Type: application/json" \\
  -d '{"pin": "1234", "confirm_pin": "1234"}' https://domain.com/api/pin/create`,
    },
    {
      method: 'POST',
      path: '/api/pin/verify',
      summary: 'Verify PIN',
      description: 'Verifies the entered PIN. After 5 failed attempts, account is locked for 15 minutes.',
      auth: true,
      requestBody: {
        description: 'PIN to verify',
        example: `{
  "pin": "1234"
}`,
      },
      response: {
        description: 'Verification result',
        example: `{
  "valid": true,
  "must_change": false
}`,
      },
      curl: `curl -X POST -H "Cookie: trainer_id=YOUR_SESSION" -H "Content-Type: application/json" \\
  -d '{"pin": "1234"}' https://domain.com/api/pin/verify`,
    },
  ],
  'Types': [
    {
      method: 'GET',
      path: '/api/types',
      summary: 'List all Pokemon types',
      description: 'Returns a list of all 18 Pokemon types available in the game. Use this to populate type selection dropdowns or to discover valid type names for the type parameter.',
      auth: false,
      response: {
        description: 'List of type names',
        example: `{
  "types": [
    "normal",
    "fire",
    "water",
    "electric",
    "grass",
    "ice",
    "fighting",
    "poison",
    "ground",
    "flying",
    "psychic",
    "bug",
    "rock",
    "ghost",
    "dragon",
    "dark",
    "steel",
    "fairy"
  ]
}`,
      },
      curl: 'curl https://domain.com/api/types',
    },
    {
      method: 'GET',
      path: '/api/types?type={name}',
      summary: 'Get type effectiveness data',
      description: 'Returns detailed type effectiveness data for a specific type including what it is strong against (2x damage), weak against (0.5x damage), and immune to (0x damage). Type name is case-insensitive.',
      auth: false,
      requestBody: {
        description: 'Query parameter: type (string, case-insensitive)',
        example: `GET /api/types?type=fire`,
      },
      response: {
        description: 'Type effectiveness data',
        example: `{
  "type": "fire",
  "strongAgainst": ["grass", "ice", "bug", "steel"],
  "weakAgainst": ["fire", "water", "rock", "dragon"],
  "immuneTo": []
}`,
      },
      curl: 'curl https://domain.com/api/types?type=fire',
    },
  ],
  'Admin': [
    {
      method: 'GET',
      path: '/api/trainers',
      summary: 'List all trainers (Admin only)',
      description: 'Returns all trainers with their stats and Pokemon counts. Requires admin role.',
      auth: true,
      response: {
        description: 'List of trainers with stats',
        example: `[
  {
    "id": "uuid",
    "name": "Ash",
    "role": "trainer",
    "starter_pokemon_id": 25,
    "created_at": "2024-01-01T00:00:00Z",
    "starter": {
      "number": 25,
      "name": "Pikachu",
      "types": ["Electric"]
    },
    "stats": {
      "battles_won": 10,
      "battles_lost": 2,
      "pokemon_captured": 5,
      "pokemon_count": 6
    }
  }
]`,
      },
      curl: 'curl -H "X-API-Key: ADMIN_API_KEY" https://domain.com/api/trainers',
    },
    {
      method: 'PATCH',
      path: '/api/trainers/[id]/role',
      summary: 'Change trainer role (Admin only)',
      description: 'Changes a trainer\'s role between "trainer" and "admin". Cannot demote the last admin.',
      auth: true,
      requestBody: {
        description: 'New role',
        example: `{
  "role": "admin"
}`,
      },
      response: {
        description: 'Role change confirmation',
        example: `{
  "trainer_id": "uuid",
  "previous_role": "trainer",
  "new_role": "admin",
  "updated_at": "2024-01-16T15:30:00Z"
}`,
      },
      curl: `curl -X PATCH -H "Cookie: trainer_id=ADMIN_SESSION" -H "Content-Type: application/json" \\
  -d '{"role": "admin"}' https://domain.com/api/trainers/{id}/role`,
    },
    {
      method: 'POST',
      path: '/api/pin/admin/reset',
      summary: 'Reset user PIN (Admin only)',
      description: 'Clears a user\'s PIN, allowing them to set a new one.',
      auth: true,
      requestBody: {
        description: 'Target trainer ID',
        example: `{
  "trainer_id": "uuid"
}`,
      },
      response: {
        description: 'Reset confirmation',
        example: `{
  "success": true,
  "message": "PIN has been reset"
}`,
      },
      curl: `curl -X POST -H "Cookie: trainer_id=ADMIN_SESSION" -H "Content-Type: application/json" \\
  -d '{"trainer_id": "uuid"}' https://domain.com/api/pin/admin/reset`,
    },
    {
      method: 'POST',
      path: '/api/pin/admin/unlock',
      summary: 'Unlock locked account (Admin only)',
      description: 'Removes the lockout from an account that has too many failed PIN attempts.',
      auth: true,
      requestBody: {
        description: 'Target trainer ID',
        example: `{
  "trainer_id": "uuid"
}`,
      },
      response: {
        description: 'Unlock confirmation',
        example: `{
  "success": true,
  "message": "Account has been unlocked"
}`,
      },
      curl: `curl -X POST -H "Cookie: trainer_id=ADMIN_SESSION" -H "Content-Type: application/json" \\
  -d '{"trainer_id": "uuid"}' https://domain.com/api/pin/admin/unlock`,
    },
  ],
};

export default function ApiDocsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [keyMeta, setKeyMeta] = useState<SecretKeyMeta | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointDoc | null>(null);
  const [showChangelog, setShowChangelog] = useState(false);

  useEffect(() => {
    const trainerId = getTrainerId();
    if (!trainerId) {
      router.replace('/');
      return;
    }
    fetchKeyMeta();

    // Check if user has seen this version of changelog
    const seenVersion = localStorage.getItem('api_changelog_seen');
    if (seenVersion !== API_CHANGELOG_VERSION) {
      setShowChangelog(true);
    }
  }, [router]);

  function dismissChangelog() {
    localStorage.setItem('api_changelog_seen', API_CHANGELOG_VERSION);
    setShowChangelog(false);
  }

  function getChangeTypeStyles(type: string) {
    switch (type) {
      case 'breaking': return 'bg-[var(--accent-error)]/20 text-[var(--accent-error)] border-[var(--accent-error)]/30';
      case 'improved': return 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)] border-[var(--accent-primary)]/30';
      case 'fixed': return 'bg-[var(--accent-success)]/20 text-[var(--accent-success)] border-[var(--accent-success)]/30';
      default: return 'bg-[var(--bg-200)] text-[var(--fg-100)] border-[var(--border)]';
    }
  }

  async function fetchKeyMeta() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/secret-key');
      if (response.ok) {
        const data: SecretKeyMeta = await response.json();
        setKeyMeta(data);
      } else {
        setError('Failed to fetch key status');
      }
    } catch {
      setError('Failed to fetch key status');
    } finally {
      setIsLoading(false);
    }
  }

  async function generateKey() {
    try {
      setGenerating(true);
      setError(null);
      setNewKey(null);

      const response = await fetch('/api/secret-key', {
        method: 'POST',
      });

      if (response.ok) {
        const data: SecretKeyResponse = await response.json();
        setNewKey(data.key);
        setKeyMeta({
          has_key: true,
          created_at: data.created_at,
          last_used_at: null,
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to generate key');
      }
    } catch {
      setError('Failed to generate key');
    } finally {
      setGenerating(false);
    }
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError('Failed to copy to clipboard');
    }
  }

  function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleString();
  }

  function getMethodColor(method: string): string {
    switch (method) {
      case 'GET': return 'bg-[var(--accent-success)]/20 text-[var(--accent-success)]';
      case 'POST': return 'bg-[var(--accent-primary)]/20 text-[var(--accent-primary)]';
      case 'PUT': return 'bg-purple-500/20 text-purple-400';
      case 'PATCH': return 'bg-[var(--accent-warning)]/20 text-[var(--accent-warning)]';
      case 'DELETE': return 'bg-[var(--accent-error)]/20 text-[var(--accent-error)]';
      default: return 'bg-[var(--bg-200)] text-[var(--fg-100)]';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--fg-100)]">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[var(--fg-0)]">API Documentation</h1>
            <p className="text-[var(--fg-100)]">Access the Pokemon API programmatically</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowChangelog(true)}
              className="btn-secondary flex items-center gap-2"
            >
              <span className="w-2 h-2 bg-[var(--accent-warning)] rounded-full animate-pulse"></span>
              Recent Changes
            </button>
            <Link href="/dashboard" className="btn-secondary">
              Back to Dashboard
            </Link>
          </div>
        </div>

        {/* API Secret Key Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--fg-0)] mb-4">API Secret Key</h2>

          {error && (
            <div className="error-message mb-3 text-sm">
              {error}
            </div>
          )}

          {newKey && (
            <div className="bg-[var(--accent-warning)]/10 border border-[var(--accent-warning)]/30 rounded-lg p-3 mb-4">
              <p className="text-[var(--accent-warning)] text-sm font-medium mb-2">
                Your new secret key (save this - it won&apos;t be shown again):
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-[var(--bg-200)] px-2 py-1 rounded text-sm break-all flex-1 text-[var(--fg-0)] font-mono">
                  {newKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="btn-primary text-sm py-1"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {keyMeta?.has_key ? (
            <div className="space-y-2">
              <div className="text-sm text-[var(--fg-100)]">
                <span className="font-medium">Status:</span> <span className="text-[var(--accent-success)]">Active</span>
              </div>
              <div className="text-sm text-[var(--fg-100)]">
                <span className="font-medium">Created:</span> <span className="font-mono">{formatDate(keyMeta.created_at)}</span>
              </div>
              <div className="text-sm text-[var(--fg-100)]">
                <span className="font-medium">Last Used:</span> <span className="font-mono">{formatDate(keyMeta.last_used_at)}</span>
              </div>
              <button
                onClick={generateKey}
                disabled={generating}
                className="mt-2 btn bg-[var(--accent-warning)] text-white hover:bg-amber-600 px-4 py-2 rounded-md text-sm"
              >
                {generating ? 'Generating...' : 'Regenerate Key'}
              </button>
              <p className="text-xs text-[var(--fg-200)] mt-1">
                Warning: Regenerating will invalidate your current key.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-[var(--fg-100)] text-sm mb-3">
                Generate a secret key to access the API programmatically.
              </p>
              <button
                onClick={generateKey}
                disabled={generating}
                className="btn-primary"
              >
                {generating ? 'Generating...' : 'Generate Secret Key'}
              </button>
            </div>
          )}
        </div>

        {/* Authentication Section */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--fg-0)] mb-4">Authentication</h2>
          <p className="text-[var(--fg-100)] mb-4">
            Use your API key with the <code className="bg-[var(--bg-200)] px-1 rounded text-[var(--fg-0)] font-mono">X-API-Key</code> header to authenticate requests.
          </p>
          <div className="bg-[var(--bg-0)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto">
            <code className="text-sm text-[var(--accent-success)] whitespace-pre font-mono">
{`curl -H "X-API-Key: YOUR_SECRET_KEY" \\
  https://your-domain.com/api/external/trainer`}
            </code>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="card p-6 mb-6">
          <h2 className="text-xl font-semibold text-[var(--fg-0)] mb-4">API Endpoints</h2>
          <p className="text-sm text-[var(--fg-200)] mb-4">Click any endpoint to view detailed documentation</p>

          <div className="space-y-3">
            {Object.entries(ENDPOINTS).map(([category, endpoints], idx) => (
              <div key={category} className={idx < Object.keys(ENDPOINTS).length - 1 ? 'border-b border-[var(--border)] pb-3' : ''}>
                <h3 className="font-medium text-[var(--fg-100)] mb-2">{category}</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={`${endpoint.method}-${endpoint.path}`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className="w-full text-left bg-[var(--bg-200)] hover:bg-[var(--bg-300)] rounded-lg p-3 transition-colors cursor-pointer border border-transparent hover:border-[var(--border-hover)]"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-mono rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span className="font-mono text-sm text-[var(--fg-0)]">{endpoint.path}</span>
                        {!endpoint.auth && (
                          <span className="px-1.5 py-0.5 bg-[var(--bg-300)] text-[var(--fg-200)] text-xs rounded">public</span>
                        )}
                      </div>
                      <p className="text-[var(--fg-100)] text-sm mt-1">{endpoint.summary}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation Links */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-[var(--fg-0)] mb-4">Full Documentation</h2>
          <div className="flex gap-4">
            <a
              href="/docs/API.md"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              API Documentation
            </a>
            <a
              href="/docs/openapi.yaml"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              OpenAPI Specification
            </a>
          </div>
        </div>
      </div>

      {/* Endpoint Detail Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--bg-100)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-sm font-mono rounded ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-lg text-[var(--fg-0)]">{selectedEndpoint.path}</span>
              </div>
              <button
                onClick={() => setSelectedEndpoint(null)}
                className="text-[var(--fg-200)] hover:text-[var(--fg-0)] text-2xl leading-none"
              >
                x
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-[var(--fg-0)] mb-2">Description</h3>
                <p className="text-[var(--fg-100)]">{selectedEndpoint.description}</p>
              </div>

              {/* Authentication */}
              <div>
                <h3 className="font-semibold text-[var(--fg-0)] mb-2">Authentication</h3>
                <p className="text-[var(--fg-100)]">
                  {selectedEndpoint.auth ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[var(--accent-warning)] rounded-full"></span>
                      Required - Include X-API-Key header
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-[var(--accent-success)] rounded-full"></span>
                      Not required - Public endpoint
                    </span>
                  )}
                </p>
              </div>

              {/* Request Body */}
              {selectedEndpoint.requestBody && (
                <div>
                  <h3 className="font-semibold text-[var(--fg-0)] mb-2">Request Body</h3>
                  <p className="text-[var(--fg-100)] text-sm mb-2">{selectedEndpoint.requestBody.description}</p>
                  <div className="bg-[var(--bg-0)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm text-[var(--accent-success)] font-mono">{selectedEndpoint.requestBody.example}</pre>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <h3 className="font-semibold text-[var(--fg-0)] mb-2">Response</h3>
                <p className="text-[var(--fg-100)] text-sm mb-2">{selectedEndpoint.response.description}</p>
                <div className="bg-[var(--bg-0)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-[var(--accent-success)] font-mono">{selectedEndpoint.response.example}</pre>
                </div>
              </div>

              {/* cURL Example */}
              <div>
                <h3 className="font-semibold text-[var(--fg-0)] mb-2">cURL Example</h3>
                <div className="bg-[var(--bg-0)] border border-[var(--border)] rounded-lg p-4 overflow-x-auto">
                  <pre className="text-sm text-[var(--accent-success)] whitespace-pre-wrap font-mono">{selectedEndpoint.curl}</pre>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-[var(--bg-200)] border-t border-[var(--border)] px-6 py-4">
              <button
                onClick={() => setSelectedEndpoint(null)}
                className="w-full btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Changes Modal */}
      {showChangelog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-[var(--accent-warning)]">
            <div className="sticky top-0 bg-[var(--bg-100)] border-b border-[var(--border)] px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">!</span>
                <div>
                  <h2 className="text-xl font-bold text-[var(--fg-0)]">API Changes</h2>
                  <p className="text-sm text-[var(--fg-200)]">Important updates that may affect your integration</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {API_CHANGELOG.map((release) => (
                <div key={release.version}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-lg font-semibold text-[var(--fg-0)]">v{release.version}</span>
                    <span className="text-sm text-[var(--fg-200)]">{release.date}</span>
                    {release.breaking && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-[var(--accent-error)]/20 text-[var(--accent-error)] rounded-full border border-[var(--accent-error)]/30">
                        Breaking Changes
                      </span>
                    )}
                  </div>

                  <div className="space-y-4">
                    {release.changes.map((change, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg border p-4 ${getChangeTypeStyles(change.type)}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded uppercase ${
                            change.type === 'breaking' ? 'bg-[var(--accent-error)] text-white' :
                            change.type === 'improved' ? 'bg-[var(--accent-primary)] text-white' :
                            'bg-[var(--accent-success)] text-white'
                          }`}>
                            {change.type}
                          </span>
                          <div className="flex-1">
                            <div className="font-medium text-[var(--fg-0)]">{change.title}</div>
                            <div className="text-sm font-mono text-[var(--fg-200)] mt-0.5">{change.endpoint}</div>
                            <p className="text-sm text-[var(--fg-100)] mt-2">{change.description}</p>

                            {change.before && change.after && (
                              <div className="mt-3 space-y-2">
                                <div>
                                  <span className="text-xs font-medium text-[var(--accent-error)]">Before:</span>
                                  <code className="block mt-1 text-xs bg-[var(--bg-0)] p-2 rounded font-mono text-[var(--fg-100)]">
                                    {change.before}
                                  </code>
                                </div>
                                <div>
                                  <span className="text-xs font-medium text-[var(--accent-success)]">After:</span>
                                  <code className="block mt-1 text-xs bg-[var(--bg-0)] p-2 rounded font-mono text-[var(--fg-100)]">
                                    {change.after}
                                  </code>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-[var(--bg-200)] border-t border-[var(--border)] px-6 py-4">
              <button
                onClick={dismissChangelog}
                className="w-full btn-primary"
              >
                I Understand - Continue to API Docs
              </button>
              <p className="text-xs text-[var(--fg-300)] text-center mt-2">
                This notice won&apos;t appear again until the next API update
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
