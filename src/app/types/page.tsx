import Link from 'next/link';
import { TypeEffectivenessGrid } from '@/components/TypeEffectivenessGrid';
import { TypeSelector } from '@/components/TypeSelector';

export default function TypesPage() {
  return (
    <div className="min-h-screen">
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)] hover:text-[var(--fg-100)]"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-[var(--fg-0)] mt-4 mb-2">
          Type Effectiveness
        </h1>
        <p className="text-[var(--fg-200)]">
          Reference chart showing Pokemon type matchups for battle strategy.
        </p>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-bold mb-4">Look Up Type</h2>
        <TypeSelector />
      </section>

      <section>
        <h2 className="text-xl font-bold mb-4">Full Type Chart</h2>
        <TypeEffectivenessGrid />
      </section>
    </div>
  );
}
