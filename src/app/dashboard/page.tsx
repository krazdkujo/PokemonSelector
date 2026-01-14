'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getTrainerId, clearTrainerId } from '@/lib/session';
import { usePinGuard } from '@/lib/usePinGuard';
import type { Dashboard } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const { isChecking: isPinChecking, isAuthorized: isPinAuthorized } = usePinGuard();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Wait for PIN check to complete before loading dashboard
    if (isPinChecking || !isPinAuthorized) {
      return;
    }

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
  }, [router, isPinChecking, isPinAuthorized]);

  const handleLogout = () => {
    clearTrainerId();
    router.push('/');
  };

  // Show loading while PIN check is in progress
  if (isPinChecking || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
          <p className="mt-4 text-[var(--fg-100)]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render content until PIN is authorized
  if (!isPinAuthorized) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--accent-error)] mb-4">{error}</p>
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
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b border-[var(--border)] pb-6">
          <div>
            <p className="text-xs font-mono text-[var(--fg-300)] uppercase tracking-widest mb-1">Dashboard</p>
            <h1 className="text-2xl font-semibold text-[var(--fg-0)]">
              {trainer_name}
            </h1>
          </div>
          <button
            onClick={handleLogout}
            className="btn-ghost text-xs"
          >
            Sign Out
          </button>
        </div>

        {/* Active Battle Banner */}
        {has_active_battle && (
          <div className="border border-[var(--accent-error)] bg-[var(--accent-error)]/5 p-4 mb-6" style={{borderRadius: '4px'}}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-[var(--accent-error)] animate-pulse"></div>
                <div>
                  <p className="font-mono text-sm text-[var(--fg-0)]">Battle in progress</p>
                  <p className="text-xs text-[var(--fg-200)]">Active encounter waiting</p>
                </div>
              </div>
              <Link href="/battle" className="btn-primary text-xs px-3 py-1.5">
                Resume
              </Link>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Active Pokemon Card */}
          <div className="card p-5">
            <p className="text-xs font-mono text-[var(--fg-300)] uppercase tracking-wider mb-4">Active Pokemon</p>
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 bg-[var(--bg-200)]" style={{borderRadius: '4px'}}>
                <Image
                  src={active_pokemon.sprite_url}
                  alt={active_pokemon.name}
                  fill
                  className="object-contain"
                  sizes="80px"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-baseline gap-2">
                  <h3 className="font-semibold text-[var(--fg-0)]">{active_pokemon.name}</h3>
                  <span className="text-xs font-mono text-[var(--fg-300)]">LV{active_pokemon.level}</span>
                </div>
                <div className="flex gap-1 mt-2">
                  {active_pokemon.types.map((type) => (
                    <span key={type} className={`type-badge type-${type.toLowerCase()}`}>
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-xs font-mono text-[var(--fg-300)] mt-2">SR {active_pokemon.sr}</p>
              </div>
            </div>
            {active_pokemon.is_starter && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-mono text-[var(--fg-200)]">STARTER</p>
              </div>
            )}
          </div>

          {/* Stats Card */}
          <div className="card p-5">
            <p className="text-xs font-mono text-[var(--fg-300)] uppercase tracking-wider mb-4">Statistics</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-mono text-[var(--accent-warning)]">${stats.money}</p>
                <p className="text-xs text-[var(--fg-300)]">Money</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-[var(--fg-0)]">{pokemon_count}</p>
                <p className="text-xs text-[var(--fg-300)]">Pokemon</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-[var(--accent-success)]">{stats.battles_won}</p>
                <p className="text-xs text-[var(--fg-300)]">Wins</p>
              </div>
              <div>
                <p className="text-2xl font-mono text-[var(--accent-error)]">{stats.battles_lost}</p>
                <p className="text-xs text-[var(--fg-300)]">Losses</p>
              </div>
            </div>

            {/* Items Section */}
            {Object.keys(stats.items).length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)]">
                <p className="text-xs font-mono text-[var(--fg-300)] mb-2">ITEMS</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stats.items).map(([item, count]) => (
                    <span key={item} className="text-xs font-mono text-[var(--fg-100)] bg-[var(--bg-200)] px-2 py-1" style={{borderRadius: '2px'}}>
                      {item} x{count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation - Minimal list style */}
        <div className="border-t border-[var(--border)] pt-6">
          <p className="text-xs font-mono text-[var(--fg-300)] uppercase tracking-wider mb-4">Navigation</p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Link href="/battle" className="card-interactive px-4 py-3 group">
              <p className="font-medium text-sm text-[var(--fg-0)] group-hover:text-white">Battle</p>
              <p className="text-xs text-[var(--fg-300)]">Wild encounters</p>
            </Link>
            <Link href="/pokedex" className="card-interactive px-4 py-3 group">
              <p className="font-medium text-sm text-[var(--fg-0)] group-hover:text-white">Pokedex</p>
              <p className="text-xs text-[var(--fg-300)]">All Pokemon</p>
            </Link>
            <Link href="/pokecenter" className="card-interactive px-4 py-3 group">
              <p className="font-medium text-sm text-[var(--fg-0)] group-hover:text-white">Pokecenter</p>
              <p className="text-xs text-[var(--fg-300)]">Manage team</p>
            </Link>
            <Link href="/admin" className="card-interactive px-4 py-3 group">
              <p className="font-medium text-sm text-[var(--fg-0)] group-hover:text-white">Admin</p>
              <p className="text-xs text-[var(--fg-300)]">Trainers</p>
            </Link>
            <Link href="/api-docs" className="card-interactive px-4 py-3 group">
              <p className="font-medium text-sm text-[var(--fg-0)] group-hover:text-white">API</p>
              <p className="text-xs text-[var(--fg-300)]">Documentation</p>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
