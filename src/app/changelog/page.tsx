'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ChangelogList } from '@/components/ChangelogList';
import { ChangelogFilter } from '@/components/ChangelogFilter';
import type { Version, ChangeCategory, Pagination } from '@/lib/changelog';

export default function ChangelogPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ChangeCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchChangelog = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (debouncedSearch) params.set('search', debouncedSearch);
      categories.forEach(c => params.append('category', c));

      const res = await fetch(`/api/changelog?${params}`);
      if (!res.ok) throw new Error('Failed to fetch changelog');

      const data = await res.json();
      setVersions(data.versions);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch changelog:', error);
      setVersions([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, categories]);

  // Fetch when filters change
  useEffect(() => {
    fetchChangelog(1);
  }, [fetchChangelog]);

  const handlePageChange = (page: number) => {
    fetchChangelog(page);
  };

  const isFiltered = debouncedSearch.length > 0 || categories.length > 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="text-xs font-mono uppercase tracking-wider text-[var(--fg-300)] hover:text-[var(--fg-100)] transition-colors"
        >
          &larr; Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-[var(--fg-0)] mt-4 mb-2">
          Changelog
        </h1>
        <p className="text-[var(--fg-200)]">
          Track all updates, improvements, and fixes to Pokemon Selector.
        </p>
      </div>

      {/* Filter Section */}
      <ChangelogFilter
        search={search}
        onSearchChange={setSearch}
        categories={categories}
        onCategoriesChange={setCategories}
      />

      {/* Version List */}
      <ChangelogList
        versions={versions}
        pagination={pagination}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        isFiltered={isFiltered}
      />
    </div>
  );
}
