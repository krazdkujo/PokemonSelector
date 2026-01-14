'use client';

import { useState } from 'react';
import { TYPE_CHART } from '@/lib/type-chart';
import { TypeDetailCard } from './TypeDetailCard';

const TYPES = Object.keys(TYPE_CHART);

export function TypeSelector() {
  const [selectedType, setSelectedType] = useState<string>('');

  return (
    <div className="space-y-4">
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        className="input py-2 capitalize"
      >
        <option value="">Select a type...</option>
        {TYPES.map(type => (
          <option key={type} value={type} className="capitalize">
            {type}
          </option>
        ))}
      </select>

      {selectedType && <TypeDetailCard type={selectedType} />}
    </div>
  );
}
