'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { PostBattleSummary } from '@/lib/types';

interface PostBattleScreenProps {
  summary: PostBattleSummary;
  onNewBattle: () => void;
}

export function PostBattleScreen({ summary, onNewBattle }: PostBattleScreenProps) {
  const { outcome, wild_pokemon, experience, score } = summary;

  // Determine victory/defeat state
  const isVictory = outcome === 'victory' || outcome === 'capture';
  const isCapture = outcome === 'capture';
  const isFled = outcome === 'fled';

  // Calculate XP progress percentage
  const xpThreshold = experience.new_experience + (experience.new_level > experience.previous_level ? 0 : getXpToNext(experience.new_level));
  const xpProgressPercent = xpThreshold > 0 ? (experience.new_experience / xpThreshold) * 100 : 0;

  // Check for level up
  const didLevelUp = experience.levels_gained > 0;
  const reachedMaxLevel = experience.new_level >= 10;

  // Helper to get XP threshold for a level
  function getXpToNext(level: number): number {
    return (level * 2) + 10;
  }

  return (
    <div className="card p-8">
      {/* Battle Outcome Header */}
      <div className="text-center mb-8">
        <div className={`text-4xl font-mono font-bold uppercase mb-2 ${
          isVictory ? 'text-[var(--accent-success)]' : isFled ? 'text-[var(--accent-warning)]' : 'text-[var(--accent-error)]'
        }`}>
          {outcome === 'victory' && 'Victory'}
          {outcome === 'capture' && 'Captured'}
          {outcome === 'defeat' && 'Defeat'}
          {outcome === 'fled' && 'Fled'}
        </div>

        <p className={`text-sm ${
          isVictory ? 'text-[var(--accent-success)]' : isFled ? 'text-[var(--accent-warning)]' : 'text-[var(--accent-error)]'
        }`}>
          {outcome === 'victory' && 'Wild Pokemon defeated'}
          {outcome === 'capture' && `${wild_pokemon.name} captured`}
          {outcome === 'defeat' && 'The wild Pokemon won'}
          {outcome === 'fled' && 'The wild Pokemon escaped'}
        </p>
      </div>

      {/* Wild Pokemon Display */}
      <div className="flex justify-center mb-6">
        <div className="text-center">
          {wild_pokemon.sprite_url && (
            <div className="relative w-24 h-24 mx-auto mb-2">
              <Image
                src={wild_pokemon.sprite_url}
                alt={wild_pokemon.name}
                fill
                className={`object-contain ${isCapture ? 'opacity-50' : ''}`}
                sizes="96px"
              />
              {isCapture && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-4xl font-mono text-[var(--accent-success)]">+</div>
                </div>
              )}
            </div>
          )}
          <div className="font-medium text-[var(--fg-0)]">{wild_pokemon.name}</div>
          <div className="text-xs font-mono text-[var(--fg-200)]">LVL {wild_pokemon.level}</div>
        </div>
      </div>

      {/* Battle Score */}
      <div className="text-center mb-6">
        <div className="text-xs font-mono uppercase text-[var(--fg-300)]">Final Score</div>
        <div className="text-2xl font-mono font-bold">
          <span className="text-[var(--accent-success)]">{score.player_wins}</span>
          <span className="text-[var(--fg-300)]"> - </span>
          <span className="text-[var(--accent-error)]">{score.wild_wins}</span>
        </div>
      </div>

      {/* Level Up Banner */}
      {didLevelUp && (
        <div className={`mb-6 p-4 text-center border ${
          reachedMaxLevel ? 'bg-[var(--bg-200)] border-[var(--accent-primary)]' : 'bg-[var(--bg-200)] border-[var(--accent-warning)]'
        }`} style={{ borderRadius: '4px' }}>
          <div className={`text-xl font-mono font-bold uppercase ${
            reachedMaxLevel ? 'text-[var(--accent-primary)]' : 'text-[var(--accent-warning)]'
          }`}>
            {reachedMaxLevel ? 'MAX LEVEL' : 'LEVEL UP'}
          </div>
          <div className="text-lg font-mono text-[var(--fg-0)]">
            {experience.previous_level} {'>'} {experience.new_level}
          </div>
          {experience.levels_gained > 1 && (
            <div className="text-xs font-mono text-[var(--fg-200)] mt-1">
              +{experience.levels_gained} levels
            </div>
          )}
        </div>
      )}

      {/* XP Display Section */}
      <div className="bg-[var(--bg-200)] p-4 mb-6" style={{ borderRadius: '4px' }}>
        <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--fg-200)] mb-3 text-center">Experience</h3>

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-xs font-mono text-[var(--fg-300)]">PREV</div>
            <div className="text-lg font-mono font-bold text-[var(--fg-100)]">{experience.previous_experience}</div>
          </div>
          <div>
            <div className="text-xs font-mono text-[var(--fg-300)]">GAIN</div>
            <div className={`text-lg font-mono font-bold ${experience.xp_awarded > 0 ? 'text-[var(--accent-success)]' : 'text-[var(--fg-300)]'}`}>
              +{experience.xp_awarded}
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-[var(--fg-300)]">TOTAL</div>
            <div className="text-lg font-mono font-bold text-[var(--accent-primary)]">{experience.new_experience}</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {!reachedMaxLevel && (
          <div>
            <div className="flex justify-between text-xs font-mono text-[var(--fg-300)] mb-1">
              <span>LVL {experience.new_level}</span>
              <span>{experience.new_experience}/{getXpToNext(experience.new_level)}</span>
            </div>
            <div className="w-full h-2 bg-[var(--bg-300)] overflow-hidden" style={{ borderRadius: '2px' }}>
              <div
                className="h-full bg-[var(--accent-primary)] transition-all duration-500"
                style={{ width: `${Math.min(100, xpProgressPercent)}%`, borderRadius: '2px' }}
              />
            </div>
          </div>
        )}

        {reachedMaxLevel && (
          <div className="text-center text-[var(--accent-primary)] font-mono text-sm uppercase">
            Max Level
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-3">
        <Link
          href="/dashboard"
          className="btn-primary px-6 py-2"
        >
          Dashboard
        </Link>
        <button
          onClick={onNewBattle}
          className="btn-secondary px-6 py-2"
        >
          New Battle
        </button>
      </div>
    </div>
  );
}
