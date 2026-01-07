'use client';

interface TypeFilterProps {
  types: string[];
  selectedType: string | null;
  onTypeSelect: (type: string | null) => void;
}

const TYPE_COLORS: Record<string, string> = {
  Normal: 'bg-gray-400 hover:bg-gray-500',
  Fire: 'bg-orange-500 hover:bg-orange-600',
  Water: 'bg-blue-500 hover:bg-blue-600',
  Electric: 'bg-yellow-400 hover:bg-yellow-500',
  Grass: 'bg-green-500 hover:bg-green-600',
  Ice: 'bg-cyan-300 hover:bg-cyan-400',
  Fighting: 'bg-red-700 hover:bg-red-800',
  Poison: 'bg-purple-500 hover:bg-purple-600',
  Ground: 'bg-amber-600 hover:bg-amber-700',
  Flying: 'bg-indigo-300 hover:bg-indigo-400',
  Psychic: 'bg-pink-500 hover:bg-pink-600',
  Bug: 'bg-lime-500 hover:bg-lime-600',
  Rock: 'bg-amber-700 hover:bg-amber-800',
  Ghost: 'bg-purple-700 hover:bg-purple-800',
  Dragon: 'bg-indigo-600 hover:bg-indigo-700',
  Dark: 'bg-gray-700 hover:bg-gray-800',
  Steel: 'bg-gray-400 hover:bg-gray-500',
  Fairy: 'bg-pink-300 hover:bg-pink-400',
};

export function TypeFilter({ types, selectedType, onTypeSelect }: TypeFilterProps) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Filter by Type</h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onTypeSelect(null)}
          className={`
            px-4 py-2 rounded-full font-medium text-sm transition-colors
            ${selectedType === null
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }
          `}
        >
          All Types
        </button>

        {types.map((type) => (
          <button
            key={type}
            onClick={() => onTypeSelect(type)}
            className={`
              px-4 py-2 rounded-full font-medium text-sm text-white transition-colors
              ${selectedType === type
                ? 'ring-2 ring-offset-2 ring-gray-800'
                : ''
              }
              ${TYPE_COLORS[type] || 'bg-gray-500 hover:bg-gray-600'}
            `}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
}
