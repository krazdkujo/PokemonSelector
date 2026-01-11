'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getTrainerId } from '@/lib/session';
import type { SecretKeyMeta, SecretKeyResponse } from '@/lib/types';

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
  Trainer: [
    {
      method: 'GET',
      path: '/api/external/trainer',
      summary: 'Get your trainer profile and statistics',
      description: 'Returns complete trainer information including name, role, statistics (battles won/lost, Pokemon captured), money, and items.',
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
  ],
  Pokemon: [
    {
      method: 'GET',
      path: '/api/pokecenter',
      summary: 'List all your owned Pokemon',
      description: 'Returns all Pokemon owned by the authenticated trainer with full details including level, types, moves, and stats.',
      auth: true,
      response: {
        description: 'Pokemon collection',
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
      "selected_moves": ["thunderbolt", "quick-attack"],
      "experience": 120,
      "experience_to_next": 80
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
  Battle: [
    {
      method: 'GET',
      path: '/api/zones',
      summary: 'List all combat zones (public)',
      description: 'Returns all available combat zones. This endpoint is public and does not require authentication.',
      auth: false,
      response: {
        description: 'List of combat zones',
        example: `[
  {
    "id": "viridian-forest",
    "name": "Viridian Forest",
    "description": "A dense forest with bug Pokemon",
    "min_level": 1,
    "max_level": 5,
    "pokemon_types": ["Bug", "Grass"]
  }
]`,
      },
      curl: 'curl https://domain.com/api/zones',
    },
    {
      method: 'GET',
      path: '/api/zones/[zoneId]/preview',
      summary: 'Preview wild Pokemon in a zone',
      description: 'Returns a preview of the wild Pokemon that can be encountered in the specified zone, including the difficulty rating.',
      auth: true,
      response: {
        description: 'Zone preview with wild Pokemon',
        example: `{
  "zone": {
    "id": "viridian-forest",
    "name": "Viridian Forest"
  },
  "wild_pokemon": {
    "name": "Caterpie",
    "level": 3,
    "types": ["Bug"],
    "sprite_url": "https://..."
  },
  "difficulty": "Easy"
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/zones/viridian-forest/preview',
    },
    {
      method: 'GET',
      path: '/api/battle',
      summary: 'Get current active battle status',
      description: 'Returns the current battle state if one is active, including your Pokemon HP, wild Pokemon HP, and battle log.',
      auth: true,
      response: {
        description: 'Active battle status',
        example: `{
  "battle_id": "uuid",
  "status": "active",
  "your_pokemon": {
    "name": "Pikachu",
    "current_hp": 80,
    "max_hp": 100
  },
  "wild_pokemon": {
    "name": "Rattata",
    "current_hp": 30,
    "max_hp": 50
  },
  "round": 3,
  "can_capture": true
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/battle',
    },
    {
      method: 'POST',
      path: '/api/battle',
      summary: 'Start a new battle in a zone',
      description: 'Initiates a new battle in the specified zone. Cannot start if a battle is already active.',
      auth: true,
      requestBody: {
        description: 'Zone ID to battle in',
        example: `{
  "zone_id": "viridian-forest"
}`,
      },
      response: {
        description: 'New battle details',
        example: `{
  "battle_id": "uuid",
  "wild_pokemon": {
    "name": "Pidgey",
    "level": 4,
    "types": ["Normal", "Flying"]
  },
  "your_pokemon": {
    "name": "Pikachu",
    "level": 5
  }
}`,
      },
      curl: `curl -X POST -H "X-API-Key: YOUR_KEY" -H "Content-Type: application/json" \\
  -d '{"zone_id": "viridian-forest"}' https://domain.com/api/battle`,
    },
    {
      method: 'POST',
      path: '/api/battle/round',
      summary: 'Execute a battle round with a move',
      description: 'Executes one round of battle using the specified move. Returns the result including damage dealt and received.',
      auth: true,
      requestBody: {
        description: 'Move ID to use',
        example: `{
  "move_id": "thunderbolt"
}`,
      },
      response: {
        description: 'Round result',
        example: `{
  "round": 4,
  "your_move": {
    "name": "Thunderbolt",
    "damage": 25
  },
  "enemy_move": {
    "name": "Tackle",
    "damage": 10
  },
  "your_pokemon": {
    "current_hp": 70,
    "max_hp": 100
  },
  "wild_pokemon": {
    "current_hp": 5,
    "max_hp": 50
  },
  "battle_status": "active",
  "can_capture": true
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
      summary: 'Check capture eligibility for current battle',
      description: 'Returns whether the wild Pokemon can be captured and the estimated success rate based on remaining HP.',
      auth: true,
      response: {
        description: 'Capture eligibility',
        example: `{
  "can_capture": true,
  "wild_pokemon": {
    "name": "Rattata",
    "current_hp": 10,
    "max_hp": 50
  },
  "capture_rate": 0.75,
  "message": "Wild Pokemon is weakened and ready for capture!"
}`,
      },
      curl: 'curl -H "X-API-Key: YOUR_KEY" https://domain.com/api/capture',
    },
    {
      method: 'POST',
      path: '/api/capture',
      summary: 'Attempt to capture the wild Pokemon',
      description: 'Attempts to capture the wild Pokemon in the current battle. Success depends on the Pokemon remaining HP and rarity.',
      auth: true,
      response: {
        description: 'Capture result',
        example: `{
  "success": true,
  "pokemon": {
    "id": "uuid",
    "name": "Rattata",
    "level": 4,
    "types": ["Normal"]
  },
  "message": "Congratulations! You caught Rattata!"
}`,
      },
      curl: 'curl -X POST -H "X-API-Key: YOUR_KEY" https://domain.com/api/capture',
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

  useEffect(() => {
    const trainerId = getTrainerId();
    if (!trainerId) {
      router.replace('/');
      return;
    }
    fetchKeyMeta();
  }, [router]);

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
      case 'GET': return 'bg-green-100 text-green-800';
      case 'POST': return 'bg-blue-100 text-blue-800';
      case 'PUT': return 'bg-purple-100 text-purple-800';
      case 'PATCH': return 'bg-yellow-100 text-yellow-800';
      case 'DELETE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading API documentation...</p>
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
            <h1 className="text-3xl font-bold text-gray-800">API Documentation</h1>
            <p className="text-gray-600">Access the Pokemon API programmatically</p>
          </div>
          <Link href="/dashboard" className="btn-secondary">
            Back to Dashboard
          </Link>
        </div>

        {/* API Secret Key Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Secret Key</h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-3 text-sm">
              {error}
            </div>
          )}

          {newKey && (
            <div className="bg-yellow-50 border border-yellow-400 rounded p-3 mb-4">
              <p className="text-yellow-800 text-sm font-medium mb-2">
                Your new secret key (save this - it won&apos;t be shown again):
              </p>
              <div className="flex items-center gap-2">
                <code className="bg-yellow-100 px-2 py-1 rounded text-sm break-all flex-1">
                  {newKey}
                </code>
                <button
                  onClick={() => copyToClipboard(newKey)}
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 whitespace-nowrap"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {keyMeta?.has_key ? (
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Status:</span> Active
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Created:</span> {formatDate(keyMeta.created_at)}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Last Used:</span> {formatDate(keyMeta.last_used_at)}
              </div>
              <button
                onClick={generateKey}
                disabled={generating}
                className="mt-2 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
              >
                {generating ? 'Generating...' : 'Regenerate Key'}
              </button>
              <p className="text-xs text-gray-500 mt-1">
                Warning: Regenerating will invalidate your current key.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-gray-600 text-sm mb-3">
                Generate a secret key to access the API programmatically.
              </p>
              <button
                onClick={generateKey}
                disabled={generating}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {generating ? 'Generating...' : 'Generate Secret Key'}
              </button>
            </div>
          )}
        </div>

        {/* Authentication Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Authentication</h2>
          <p className="text-gray-600 mb-4">
            Use your API key with the <code className="bg-gray-100 px-1 rounded">X-API-Key</code> header to authenticate requests.
          </p>
          <div className="bg-gray-800 rounded p-4 overflow-x-auto">
            <code className="text-sm text-green-400 whitespace-pre">
{`curl -H "X-API-Key: YOUR_SECRET_KEY" \\
  https://your-domain.com/api/external/trainer`}
            </code>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Endpoints</h2>
          <p className="text-sm text-gray-500 mb-4">Click any endpoint to view detailed documentation</p>

          <div className="space-y-3">
            {Object.entries(ENDPOINTS).map(([category, endpoints], idx) => (
              <div key={category} className={idx < Object.keys(ENDPOINTS).length - 1 ? 'border-b pb-3' : ''}>
                <h3 className="font-medium text-gray-700 mb-2">{category}</h3>
                <div className="space-y-2">
                  {endpoints.map((endpoint) => (
                    <button
                      key={`${endpoint.method}-${endpoint.path}`}
                      onClick={() => setSelectedEndpoint(endpoint)}
                      className="w-full text-left bg-gray-50 hover:bg-gray-100 rounded p-3 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 text-xs font-mono rounded ${getMethodColor(endpoint.method)}`}>
                          {endpoint.method}
                        </span>
                        <span className="font-mono text-sm">{endpoint.path}</span>
                        {!endpoint.auth && (
                          <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded">public</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-sm mt-1">{endpoint.summary}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Documentation Links */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Full Documentation</h2>
          <div className="flex gap-4">
            <a
              href="/docs/API.md"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              API Documentation
            </a>
            <a
              href="/docs/openapi.yaml"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              OpenAPI Specification
            </a>
          </div>
        </div>
      </div>

      {/* Endpoint Detail Modal */}
      {selectedEndpoint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`px-2 py-1 text-sm font-mono rounded ${getMethodColor(selectedEndpoint.method)}`}>
                  {selectedEndpoint.method}
                </span>
                <span className="font-mono text-lg">{selectedEndpoint.path}</span>
              </div>
              <button
                onClick={() => setSelectedEndpoint(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                x
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Description */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                <p className="text-gray-600">{selectedEndpoint.description}</p>
              </div>

              {/* Authentication */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Authentication</h3>
                <p className="text-gray-600">
                  {selectedEndpoint.auth ? (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                      Required - Include X-API-Key header
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                      Not required - Public endpoint
                    </span>
                  )}
                </p>
              </div>

              {/* Request Body */}
              {selectedEndpoint.requestBody && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Request Body</h3>
                  <p className="text-gray-600 text-sm mb-2">{selectedEndpoint.requestBody.description}</p>
                  <div className="bg-gray-800 rounded p-4 overflow-x-auto">
                    <pre className="text-sm text-green-400">{selectedEndpoint.requestBody.example}</pre>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Response</h3>
                <p className="text-gray-600 text-sm mb-2">{selectedEndpoint.response.description}</p>
                <div className="bg-gray-800 rounded p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400">{selectedEndpoint.response.example}</pre>
                </div>
              </div>

              {/* cURL Example */}
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">cURL Example</h3>
                <div className="bg-gray-800 rounded p-4 overflow-x-auto">
                  <pre className="text-sm text-green-400 whitespace-pre-wrap">{selectedEndpoint.curl}</pre>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4">
              <button
                onClick={() => setSelectedEndpoint(null)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
