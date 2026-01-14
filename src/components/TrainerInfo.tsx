'use client';

import { useState } from 'react';
import type { Trainer } from '@/lib/types';

interface TrainerInfoProps {
  trainer: Trainer;
}

export function TrainerInfo({ trainer }: TrainerInfoProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(trainer.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="card p-6">
      <h2 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-4">Trainer Info</h2>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)]">Name</label>
          <p className="text-lg font-semibold text-[var(--fg-0)]">{trainer.name}</p>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)]">Trainer ID</label>
          <div className="flex items-center gap-2 mt-1">
            <code className="text-xs bg-[var(--bg-200)] px-2 py-1 font-mono text-[var(--fg-100)] flex-1 truncate" style={{ borderRadius: '4px' }}>
              {trainer.id}
            </code>
            <button
              onClick={handleCopyId}
              className="btn-ghost text-xs flex items-center gap-1"
              title="Copy Trainer ID"
            >
              {copied ? (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)]">Role</label>
          <p className="text-[var(--fg-100)] font-mono uppercase text-sm">{trainer.role}</p>
        </div>

        <div>
          <label className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)]">Member Since</label>
          <p className="text-[var(--fg-100)] font-mono text-sm">
            {new Date(trainer.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
