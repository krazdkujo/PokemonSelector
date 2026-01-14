'use client';

import type { Version, ChangeCategory } from '@/lib/changelog';
import { formatVersion, formatDate, CATEGORY_COLORS, CATEGORY_BG_COLORS } from '@/lib/changelog';

interface ChangelogEntryProps {
  version: Version;
}

export function ChangelogEntry({ version }: ChangelogEntryProps) {
  // Group changes by category for better readability
  const changesByCategory = version.changes.reduce((acc, change) => {
    if (!acc[change.category]) {
      acc[change.category] = [];
    }
    acc[change.category].push(change.description);
    return acc;
  }, {} as Record<ChangeCategory, string[]>);

  return (
    <article className="card p-6 mb-4">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-4 border-b border-[var(--border)]">
        <h3 className="text-xl font-bold text-[var(--fg-0)] font-mono">
          {formatVersion(version.version)}
        </h3>
        <time
          dateTime={version.date}
          className="text-sm text-[var(--fg-200)] font-mono"
        >
          {formatDate(version.date)}
        </time>
      </header>

      <div className="space-y-3">
        {Object.entries(changesByCategory).map(([category, descriptions]) => (
          <div key={category}>
            <span
              className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${CATEGORY_COLORS[category as ChangeCategory]} ${CATEGORY_BG_COLORS[category as ChangeCategory]}`}
            >
              {category}
            </span>
            <ul className="mt-2 space-y-1">
              {descriptions.map((description, index) => (
                <li
                  key={index}
                  className="text-sm text-[var(--fg-100)] pl-4 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-[var(--fg-300)] before:rounded-full"
                >
                  {description}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </article>
  );
}
