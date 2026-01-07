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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Trainer Info</h2>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-gray-500">Name</label>
          <p className="text-lg font-semibold text-gray-800">{trainer.name}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Trainer ID</label>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-700 flex-1 truncate">
              {trainer.id}
            </code>
            <button
              onClick={handleCopyId}
              className="btn-secondary px-3 py-1 text-sm flex items-center gap-1"
              title="Copy Trainer ID"
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500">Role</label>
          <p className="text-gray-700 capitalize">{trainer.role}</p>
        </div>

        <div>
          <label className="text-sm text-gray-500">Member Since</label>
          <p className="text-gray-700">
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
