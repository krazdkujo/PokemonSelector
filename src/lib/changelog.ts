/**
 * Changelog types and utilities
 * Following Keep a Changelog conventions for categorization
 */

export type ChangeCategory =
  | 'Added'
  | 'Changed'
  | 'Fixed'
  | 'Removed'
  | 'Deprecated'
  | 'Security';

export interface ChangeEntry {
  category: ChangeCategory;
  description: string;
}

export interface Version {
  version: string;
  date: string;
  changes: ChangeEntry[];
}

export interface Changelog {
  versions: Version[];
}

export interface ChangelogFilters {
  searchQuery?: string;
  categories?: ChangeCategory[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ChangelogResponse {
  versions: Version[];
  pagination: Pagination;
}

/**
 * All available change categories
 */
export const CHANGE_CATEGORIES: ChangeCategory[] = [
  'Added',
  'Changed',
  'Fixed',
  'Removed',
  'Deprecated',
  'Security',
];

/**
 * Category display colors for styling
 */
export const CATEGORY_COLORS: Record<ChangeCategory, string> = {
  Added: 'text-green-600 dark:text-green-400',
  Changed: 'text-blue-600 dark:text-blue-400',
  Fixed: 'text-yellow-600 dark:text-yellow-400',
  Removed: 'text-red-600 dark:text-red-400',
  Deprecated: 'text-orange-600 dark:text-orange-400',
  Security: 'text-purple-600 dark:text-purple-400',
};

/**
 * Category background colors for badges
 */
export const CATEGORY_BG_COLORS: Record<ChangeCategory, string> = {
  Added: 'bg-green-100 dark:bg-green-900/30',
  Changed: 'bg-blue-100 dark:bg-blue-900/30',
  Fixed: 'bg-yellow-100 dark:bg-yellow-900/30',
  Removed: 'bg-red-100 dark:bg-red-900/30',
  Deprecated: 'bg-orange-100 dark:bg-orange-900/30',
  Security: 'bg-purple-100 dark:bg-purple-900/30',
};

/**
 * Validates a semantic version string (MAJOR.MINOR.PATCH)
 */
export function isValidSemver(version: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(version);
}

/**
 * Parses a semantic version string into components
 */
export function parseSemver(version: string): { major: number; minor: number; patch: number } | null {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) return null;
  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
  };
}

/**
 * Formats a version string for display with visual emphasis
 */
export function formatVersion(version: string): string {
  return `v${version}`;
}

/**
 * Formats a date string for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Compares two semantic versions
 * Returns: negative if a < b, positive if a > b, 0 if equal
 */
export function compareSemver(a: string, b: string): number {
  const parsedA = parseSemver(a);
  const parsedB = parseSemver(b);

  if (!parsedA || !parsedB) return 0;

  if (parsedA.major !== parsedB.major) return parsedB.major - parsedA.major;
  if (parsedA.minor !== parsedB.minor) return parsedB.minor - parsedA.minor;
  return parsedB.patch - parsedA.patch;
}
