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
        <p className="text-gray-500 dark:text-gray-400 text-lg">No trainers have registered yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg dark:shadow-gray-900/50 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trainer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Trainer ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Starter Pokemon
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Battles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Captured
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Collection
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              PIN Management
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium text-gray-900 dark:text-gray-100">{trainer.name}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded font-mono text-gray-600 dark:text-gray-400">
                  {trainer.id.slice(0, 8)}...
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {trainer.starter ? (
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={trainer.starter.sprites.sprite}
                        alt={trainer.starter.name}
                        fill
                        className="object-contain"
                        sizes="32px"
                      />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{trainer.starter.name}</span>
                    <div className="flex gap-1">
                      {trainer.starter.types.map((type) => (
                        <span
                          key={type}
                          className={`type-badge type-${type.toLowerCase()} text-xs`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">Not selected</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span className="text-green-600 dark:text-green-400 font-medium">
                  {trainer.stats?.battles_won ?? 0}W
                </span>
                <span className="text-gray-400 mx-1">/</span>
                <span className="text-red-600 dark:text-red-400 font-medium">
                  {trainer.stats?.battles_lost ?? 0}L
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {trainer.stats?.pokemon_captured ?? 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                {trainer.stats?.pokemon_count ?? 0}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      trainer.role === 'admin'
                        ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300'
                        : 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300'
                    }`}
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
                      className={`text-xs px-2 py-1 rounded transition-colors ${
                        trainer.role === 'admin'
                          ? 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/70'
                          : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/70'
                      }`}
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
              <td className="px-6 py-4 whitespace-nowrap">
                {trainer.id !== currentUserId && (
                  <AdminPinManager
                    trainerId={trainer.id}
                    trainerName={trainer.name}
                    onActionComplete={onPinActionComplete}
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {new Date(trainer.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
