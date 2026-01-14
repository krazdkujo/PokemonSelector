'use client';

import Image from 'next/image';
import type { TrainerWithStats } from '@/lib/types';
import { AdminPinManager } from './AdminPinManager';

interface TrainerListProps {
  trainers: TrainerWithStats[];
  currentUserId?: string;
  onRoleChange?: (trainerId: string, newRole: 'trainer' | 'admin') => void;
  onPinActionComplete?: () => void;
}

export function TrainerList({ trainers, currentUserId, onRoleChange, onPinActionComplete }: TrainerListProps) {
  if (trainers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--fg-200)] text-sm font-mono">No trainers have registered yet.</p>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden" style={{ borderRadius: '6px' }}>
      <table className="w-full">
        <thead className="bg-[var(--bg-200)] border-b border-[var(--border)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              Trainer
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              ID
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              Starter
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              W/L
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              Captured
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              Total
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              Role
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              PIN
            </th>
            <th className="px-4 py-3 text-left text-xs font-mono font-medium text-[var(--fg-200)] uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="hover:bg-[var(--bg-200)]">
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="font-medium text-[var(--fg-0)]">{trainer.name}</span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <code className="text-xs bg-[var(--bg-200)] px-2 py-0.5 font-mono text-[var(--fg-200)]" style={{ borderRadius: '2px' }}>
                  {trainer.id.slice(0, 8)}
                </code>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {trainer.starter ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-6 h-6">
                      <Image
                        src={trainer.starter.sprites.sprite}
                        alt={trainer.starter.name}
                        fill
                        className="object-contain"
                        sizes="24px"
                      />
                    </div>
                    <span className="text-[var(--fg-100)] text-sm">{trainer.starter.name}</span>
                    <div className="flex gap-1">
                      {trainer.starter.types.map((type) => (
                        <span
                          key={type}
                          className={`type-badge type-${type.toLowerCase()}`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-[var(--fg-300)] text-sm font-mono">--</span>
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono">
                <span className="text-[var(--accent-success)]">
                  {trainer.stats?.battles_won ?? 0}
                </span>
                <span className="text-[var(--fg-300)]">/</span>
                <span className="text-[var(--accent-error)]">
                  {trainer.stats?.battles_lost ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-[var(--fg-100)]">
                {trainer.stats?.pokemon_captured ?? 0}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-[var(--fg-100)]">
                {trainer.stats?.pokemon_count ?? 0}
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-0.5 text-xs font-mono uppercase ${
                      trainer.role === 'admin'
                        ? 'bg-[var(--accent-primary)] text-white'
                        : 'bg-[var(--bg-300)] text-[var(--fg-100)]'
                    }`}
                    style={{ borderRadius: '2px' }}
                  >
                    {trainer.role}
                  </span>
                  {onRoleChange && trainer.id !== currentUserId && (
                    <button
                      onClick={() =>
                        onRoleChange(
                          trainer.id,
                          trainer.role === 'admin' ? 'trainer' : 'admin'
                        )
                      }
                      className="btn-ghost text-xs py-0.5 px-2"
                      title={
                        trainer.role === 'admin'
                          ? 'Demote to trainer'
                          : 'Promote to admin'
                      }
                    >
                      {trainer.role === 'admin' ? 'Demote' : 'Promote'}
                    </button>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                {trainer.id !== currentUserId && (
                  <AdminPinManager
                    trainerId={trainer.id}
                    trainerName={trainer.name}
                    onActionComplete={onPinActionComplete}
                  />
                )}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-[var(--fg-200)]">
                {new Date(trainer.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
