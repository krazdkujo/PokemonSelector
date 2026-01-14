'use client';

import type { ChangeCategory } from '@/lib/changelog';
import { CHANGE_CATEGORIES, CATEGORY_COLORS, CATEGORY_BG_COLORS } from '@/lib/changelog';

interface ChangelogFilterProps {
  search: string;
  onSearchChange: (search: string) => void;
  categories: ChangeCategory[];
  onCategoriesChange: (categories: ChangeCategory[]) => void;
}

export function ChangelogFilter({
  search,
  onSearchChange,
  categories,
  onCategoriesChange,
}: ChangelogFilterProps) {
  const toggleCategory = (category: ChangeCategory) => {
    if (categories.includes(category)) {
      onCategoriesChange(categories.filter(c => c !== category));
    } else {
      onCategoriesChange([...categories, category]);
    }
  };

  const clearFilters = () => {
    onSearchChange('');
    onCategoriesChange([]);
  };

  const hasFilters = search.length > 0 || categories.length > 0;

  return (
    <div className="card p-4 mb-6">
      {/* Search Input */}
      <div className="mb-4">
        <label
          htmlFor="version-search"
          className="block text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-2"
        >
          Search by Version
        </label>
        <input
          id="version-search"
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g., 1.0, 0.9"
          className="input py-2 w-full max-w-xs"
          autoComplete="off"
        />
      </div>

      {/* Category Filter */}
      <div>
        <span className="block text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-2">
          Filter by Category
        </span>
        <div className="flex flex-wrap gap-2">
          {CHANGE_CATEGORIES.map((category) => {
            const isSelected = categories.includes(category);
            return (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                  isSelected
                    ? `${CATEGORY_COLORS[category]} ${CATEGORY_BG_COLORS[category]} ring-2 ring-current`
                    : 'text-[var(--fg-200)] bg-[var(--bg-100)] hover:bg-[var(--bg-200)]'
                }`}
                aria-pressed={isSelected}
              >
                {category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Clear Filters */}
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="mt-4 text-sm text-[var(--fg-300)] hover:text-[var(--fg-100)] transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
