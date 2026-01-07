'use client';

import Image from 'next/image';
import type { TrainerWithStarter } from '@/lib/types';

interface TrainerListProps {
  trainers: TrainerWithStarter[];
}

export function TrainerList({ trainers }: TrainerListProps) {
  if (trainers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No trainers have registered yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trainer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trainer ID
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Starter Pokemon
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {trainers.map((trainer) => (
            <tr key={trainer.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-medium text-gray-900">{trainer.name}</span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono text-gray-600">
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
                    <span className="text-gray-700">{trainer.starter.name}</span>
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
                  <span className="text-gray-400 italic">Not selected</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    trainer.role === 'admin'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {trainer.role}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(trainer.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
