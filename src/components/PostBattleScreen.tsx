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
    <div className="bg-white rounded-lg shadow-lg p-8">
      {/* Battle Outcome Header */}
      <div className="text-center mb-8">
        <div className={`text-5xl font-bold mb-2 ${
          isVictory ? 'text-green-500' : isFled ? 'text-yellow-500' : 'text-red-500'
        }`}>
          {outcome === 'victory' && 'Victory!'}
          {outcome === 'capture' && 'Captured!'}
          {outcome === 'defeat' && 'Defeat'}
          {outcome === 'fled' && 'Fled!'}
        </div>

        <p className={`text-lg ${
          isVictory ? 'text-green-700' : isFled ? 'text-yellow-700' : 'text-red-700'
        }`}>
          {outcome === 'victory' && 'You defeated the wild Pokemon!'}
          {outcome === 'capture' && `You captured ${wild_pokemon.name}!`}
          {outcome === 'defeat' && 'The wild Pokemon won...'}
          {outcome === 'fled' && 'The wild Pokemon escaped!'}
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
                  <div className="text-4xl">+</div>
                </div>
              )}
            </div>
          )}
          <div className="font-medium text-gray-800">{wild_pokemon.name}</div>
          <div className="text-sm text-gray-500">Level {wild_pokemon.level}</div>
        </div>
      </div>

      {/* Battle Score */}
      <div className="text-center mb-6">
        <div className="text-sm text-gray-500">Final Score</div>
        <div className="text-xl font-bold text-gray-800">
          <span className="text-green-600">{score.player_wins}</span>
          {' - '}
          <span className="text-red-600">{score.wild_wins}</span>
        </div>
      </div>

      {/* Level Up Banner */}
      {didLevelUp && (
        <div className={`mb-6 p-4 rounded-lg text-center ${
          reachedMaxLevel ? 'bg-purple-100 border-2 border-purple-300' : 'bg-yellow-100 border-2 border-yellow-300'
        }`}>
          <div className={`text-2xl font-bold ${
            reachedMaxLevel ? 'text-purple-700' : 'text-yellow-700'
          }`}>
            {reachedMaxLevel ? 'MAX LEVEL REACHED!' : 'LEVEL UP!'}
          </div>
          <div className={`text-lg ${
            reachedMaxLevel ? 'text-purple-600' : 'text-yellow-600'
          }`}>
            Level {experience.previous_level} {'->'} Level {experience.new_level}!
          </div>
          {experience.levels_gained > 1 && (
            <div className="text-sm text-gray-600 mt-1">
              (+{experience.levels_gained} levels)
            </div>
          )}
        </div>
      )}

      {/* XP Display Section */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium text-gray-800 mb-3 text-center">Experience Gained</h3>

        <div className="grid grid-cols-3 gap-4 text-center mb-4">
          <div>
            <div className="text-sm text-gray-500">Previous</div>
            <div className="text-lg font-bold text-gray-700">{experience.previous_experience} XP</div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Gained</div>
            <div className={`text-lg font-bold ${experience.xp_awarded > 0 ? 'text-green-600' : 'text-gray-400'}`}>
              +{experience.xp_awarded} XP
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500">Total</div>
            <div className="text-lg font-bold text-blue-600">{experience.new_experience} XP</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {!reachedMaxLevel && (
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Level {experience.new_level}</span>
              <span>{experience.new_experience} / {getXpToNext(experience.new_level)} XP</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, xpProgressPercent)}%` }}
              />
            </div>
          </div>
        )}

        {reachedMaxLevel && (
          <div className="text-center text-purple-600 font-medium">
            Maximum Level Achieved
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Return to Dashboard
        </Link>
        <button
          onClick={onNewBattle}
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          New Battle
        </button>
      </div>
    </div>
  );
}
