'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTrainerId, clearTrainerId } from '@/lib/session';
import type { Dashboard } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      const trainerId = getTrainerId();

      if (!trainerId) {
        router.replace('/');
        return;
      }

      try {
        const response = await fetch('/api/dashboard');

        if (response.status === 401) {
          // Not authenticated, redirect to login
          clearTrainerId();
          router.replace('/');
          return;
        }

        if (response.status === 404) {
          // Trainer not found, clear session and redirect
          clearTrainerId();
          router.replace('/');
          return;
        }

        if (!response.ok) {
          setError('Failed to load dashboard data');
          setIsLoading(false);
          return;
        }

        const data: Dashboard = await response.json();

        // If trainer doesn't have an active Pokemon, redirect to selection
        if (!data.active_pokemon) {
          router.replace('/select');
          return;
        }

        setDashboard(data);
        setIsLoading(false);
      } catch {
        setError('An unexpected error occurred');
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [router]);

  const handleLogout = () => {
    clearTrainerId();
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={handleLogout} className="btn-primary">
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  if (!dashboard || !dashboard.active_pokemon) {
    return null;
  }

  const { active_pokemon, stats, has_active_battle, pokemon_count, trainer_name } = dashboard;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {trainer_name}!
          </h1>
          <button
            onClick={handleLogout}
            className="btn-secondary"
          >
            Logout
          </button>
        </div>

        {/* Active Battle Banner */}
        {has_active_battle && (
          <div className="bg-red-100 border border-red-400 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-red-800">Battle in Progress!</h3>
                <p className="text-red-700 text-sm">You have an active battle waiting.</p>
              </div>
              <Link
                href="/battle"
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Continue Battle
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Active Pokemon Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Active Pokemon</h2>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24">
                <Image
                  src={active_pokemon.sprite_url}
                  alt={active_pokemon.name}
                  fill
                  className="object-contain"
                  sizes="96px"
                />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-800">{active_pokemon.name}</h3>
                <p className="text-gray-600">Level {active_pokemon.level}</p>
                <div className="flex gap-1 mt-1">
                  {active_pokemon.types.map((type) => (
                    <span
                      key={type}
                      className={`type-badge type-${type.toLowerCase()}`}
                    >
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">SR: {active_pokemon.sr}</p>
              </div>
            </div>
            {active_pokemon.is_starter && (
              <div className="mt-3 text-sm text-blue-600 font-medium">
                Your Starter Pokemon
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Trainer Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Money</span>
                <span className="font-semibold text-yellow-600">${stats.money}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pokemon Owned</span>
                <span className="font-semibold">{pokemon_count}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Battles Won</span>
                <span className="font-semibold text-green-600">{stats.battles_won}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Battles Lost</span>
                <span className="font-semibold text-red-600">{stats.battles_lost}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pokemon Captured</span>
                <span className="font-semibold text-blue-600">{stats.pokemon_captured}</span>
              </div>
            </div>

            {/* Items Section */}
            {Object.keys(stats.items).length > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <h3 className="font-medium text-gray-800 mb-2">Items</h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.items).map(([item, count]) => (
                    <span key={item} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {item}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Link
            href="/battle"
            className="bg-red-600 hover:bg-red-700 text-white rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-1">Battle</div>
            <div className="text-sm opacity-75">Find Wild Pokemon</div>
          </Link>

          <Link
            href="/pokedex"
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-1">Pokedex</div>
            <div className="text-sm opacity-75">View All Pokemon</div>
          </Link>

          <Link
            href="/pokecenter"
            className="bg-pink-600 hover:bg-pink-700 text-white rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-1">Pokecenter</div>
            <div className="text-sm opacity-75">Manage Pokemon</div>
          </Link>

          <Link
            href="/admin"
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-1">Admin</div>
            <div className="text-sm opacity-75">View Trainers</div>
          </Link>

          <Link
            href="/api-docs"
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg p-4 text-center transition"
          >
            <div className="text-2xl mb-1">API Docs</div>
            <div className="text-sm opacity-75">Documentation</div>
          </Link>
        </div>

      </div>
    </div>
  );
}
