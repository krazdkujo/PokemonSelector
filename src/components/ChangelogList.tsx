'use client';

import type { Version, Pagination } from '@/lib/changelog';
import { ChangelogEntry } from './ChangelogEntry';

interface ChangelogListProps {
  versions: Version[];
  pagination: Pagination | null;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  isFiltered?: boolean;
}

export function ChangelogList({
  versions,
  pagination,
  onPageChange,
  isLoading,
  isFiltered = false,
}: ChangelogListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="w-4 h-4 bg-[var(--fg-0)] animate-pulse mx-auto"></div>
          <p className="mt-4 text-[var(--fg-200)] text-sm font-mono">Loading changelog...</p>
        </div>
      </div>
    );
  }

  // Empty state - no versions at all
  if (versions.length === 0 && !isFiltered) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--fg-200)] text-lg">No releases have been documented yet.</p>
        <p className="text-[var(--fg-300)] text-sm mt-2">
          Check back later for version history.
        </p>
      </div>
    );
  }

  // Empty state - no matching versions from filter/search
  if (versions.length === 0 && isFiltered) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[var(--fg-200)] text-lg">No matching versions found.</p>
        <p className="text-[var(--fg-300)] text-sm mt-2">
          Try adjusting your search or filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-4">
        {versions.map((version) => (
          <ChangelogEntry key={version.version} version={version} />
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <nav className="flex justify-center items-center gap-4 mt-8" aria-label="Changelog pagination">
          <button
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            Previous
          </button>

          <span className="text-sm text-[var(--fg-200)] font-mono">
            Page {pagination.page} of {pagination.totalPages}
          </span>

          <button
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
            className="btn-secondary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            Next
          </button>
        </nav>
      )}

      {/* Results summary */}
      {pagination && (
        <p className="text-center text-xs text-[var(--fg-300)] font-mono mt-4">
          Showing {versions.length} of {pagination.total} version{pagination.total !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
