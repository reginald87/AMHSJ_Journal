'use client';

import { useMemo, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, ChevronDown, X, Filter, BookOpen } from 'lucide-react';
import { ArticleCard } from '@/components/journal/ArticleCard';

export type ArticleAuthor = {
  id: string;
  firstName: string;
  lastName: string;
};

type ArticleMetric = {
  views: number;
  downloads: number;
};

export type ArticleListItem = {
  id: string;
  slug: string;
  title: string;
  articleType: string | null;
  shortTitle: string | null;
  keywords: string;
  publishedAt: string | null;
  authors: ArticleAuthor[];
  volumeId: string;
  volume: { number: number; year: number };
  metrics: ArticleMetric | null;
};

export type VolumeTree = {
  id: string;
  number: number;
  year: number;
  title: string | null;
  articleCount: number;
};

export type AuthorFilter = {
  id: string;
  firstName: string;
  lastName: string;
};

type SortOption = 'latest' | 'views' | 'downloads';

interface ArticlesBrowserProps {
  articles: ArticleListItem[];
  volumeTree: VolumeTree[];
  uniqueAuthors: AuthorFilter[];
  articleTypes: string[];
}

function parseKeywords(keywords: string): string[] {
  if (!keywords) return [];
  try {
    const parsed = JSON.parse(keywords);
    if (Array.isArray(parsed)) return parsed.map((k) => String(k));
  } catch { /* fall through */ }
  return keywords.split(',').map((k) => k.trim()).filter(Boolean);
}

function getTimestamp(article: ArticleListItem): number {
  const date = article.publishedAt;
  return date ? new Date(date).getTime() : 0;
}

function formatArticleType(t: string): string {
  return t.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ArticlesBrowser({
  articles,
  volumeTree,
  uniqueAuthors,
  articleTypes,
}: ArticlesBrowserProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'latest');
  const [selectedVolume, setSelectedVolume] = useState<string | null>(searchParams.get('volume'));
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(searchParams.get('author'));
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get('types') ? searchParams.get('types')!.split(',') : []
  );
  const [showSidebar, setShowSidebar] = useState(false);

  const updateURL = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      const newSearch = params.toString();
      router.replace(`/articles${newSearch ? `?${newSearch}` : ''}`, { scroll: false });
    },
    [router, searchParams]
  );

  const handleSearchChange = (value: string) => {
    setQuery(value);
    updateURL({ q: value || null });
  };

  const handleSortChange = (value: SortOption) => {
    setSort(value);
    updateURL({ sort: value !== 'latest' ? value : null });
  };

  const handleVolumeSelect = (volId: string) => {
    if (selectedVolume === volId) {
      setSelectedVolume(null);
      updateURL({ volume: null });
    } else {
      setSelectedVolume(volId);
      updateURL({ volume: volId });
    }
  };

  const handleAuthorSelect = (authorName: string) => {
    const newVal = selectedAuthor === authorName ? null : authorName;
    setSelectedAuthor(newVal);
    updateURL({ author: newVal });
  };

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => {
      const next = prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type];
      updateURL({ types: next.length > 0 ? next.join(',') : null });
      return next;
    });
  };

  const clearAllFilters = () => {
    setQuery('');
    setSort('latest');
    setSelectedVolume(null);
    setSelectedAuthor(null);
    setSelectedTypes([]);
    router.replace('/articles', { scroll: false });
  };

  const hasActiveFilters = query || selectedVolume || selectedAuthor || selectedTypes.length > 0 || sort !== 'latest';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = articles;

    if (selectedVolume) {
      list = list.filter((a) => a.volumeId === selectedVolume);
    }

    if (selectedAuthor) {
      list = list.filter((a) =>
        a.authors.some(
          (au) => `${au.firstName} ${au.lastName}`.toLowerCase() === selectedAuthor.toLowerCase()
        )
      );
    }

    if (selectedTypes.length > 0) {
      list = list.filter((a) => a.articleType && selectedTypes.includes(a.articleType));
    }

    if (q) {
      list = list.filter((article) => {
        if (article.title.toLowerCase().includes(q)) return true;
        if (article.shortTitle && article.shortTitle.toLowerCase().includes(q)) return true;
        if (parseKeywords(article.keywords).some((k) => k.toLowerCase().includes(q))) return true;
        if (article.authors.some((a) => `${a.firstName} ${a.lastName}`.toLowerCase().includes(q))) return true;
        return false;
      });
    }

    const sorted = [...list];
    if (sort === 'views') {
      sorted.sort((a, b) => (b.metrics?.views ?? 0) - (a.metrics?.views ?? 0) || getTimestamp(b) - getTimestamp(a));
    } else if (sort === 'downloads') {
      sorted.sort((a, b) => (b.metrics?.downloads ?? 0) - (a.metrics?.downloads ?? 0) || getTimestamp(b) - getTimestamp(a));
    } else {
      sorted.sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }

    return sorted;
  }, [articles, query, sort, selectedVolume, selectedAuthor, selectedTypes, volumeTree]);

  const sidebarContent = (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-gold-500" />
        <h3 className="text-sm font-semibold text-navy-900 dark:text-white uppercase tracking-wide">
          Browse by Volume
        </h3>
      </div>

      {volumeTree.map((vol) => {
        const isSelected = selectedVolume === vol.id;

        return (
          <div key={vol.id}>
            <button
              type="button"
              onClick={() => handleVolumeSelect(vol.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-colors rounded-lg ${
                isSelected
                  ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950'
                  : 'text-navy-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-navy-700'
              }`}
            >
              <span className="flex items-center gap-2">
                Volume {vol.number} ({vol.year})
              </span>
              <span className={`text-xs px-1.5 py-0.5 rounded ${
                isSelected
                  ? 'bg-white/20 text-white dark:bg-navy-900/20 dark:text-navy-950'
                  : 'bg-slate-200 dark:bg-navy-700 text-slate-600 dark:text-slate-400'
              }`}>
                {vol.articleCount}
              </span>
            </button>
          </div>
        );
      })}

      {uniqueAuthors.length > 0 && (
        <>
          <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
            <h3 className="text-sm font-semibold text-navy-900 dark:text-white uppercase tracking-wide mb-3">
              Authors
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-0.5 pr-1">
              {uniqueAuthors.map((author) => {
                const name = `${author.firstName} ${author.lastName}`;
                const isActive = selectedAuthor?.toLowerCase() === name.toLowerCase();
                return (
                  <button
                    key={author.id}
                    type="button"
                    onClick={() => handleAuthorSelect(name)}
                    className={`w-full text-left px-2 py-1.5 text-sm rounded transition-colors ${
                      isActive
                        ? 'bg-gold-50 dark:bg-gold-500/10 text-navy-900 dark:text-gold-400 font-medium'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-navy-800/50'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {articleTypes.length > 0 && (
        <div className="pt-4 border-t border-slate-200 dark:border-navy-700">
          <h3 className="text-sm font-semibold text-navy-900 dark:text-white uppercase tracking-wide mb-3">
            Article Type
          </h3>
          <div className="space-y-1.5">
            {articleTypes.map((type) => {
              const isActive = selectedTypes.includes(type);
              return (
                <label
                  key={type}
                  className="flex items-center gap-2 px-2 py-1.5 text-sm rounded cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/50"
                >
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={() => handleTypeToggle(type)}
                    className="rounded border-slate-300 dark:border-navy-600 text-gold-500 focus:ring-gold-500"
                  />
                  <span className="text-slate-600 dark:text-slate-400">{formatArticleType(type)}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-24 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4 shadow-sm">
          {sidebarContent}
        </div>
      </aside>

      <div className="lg:hidden mb-4">
        <button
          type="button"
          onClick={() => setShowSidebar(!showSidebar)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900 text-sm font-medium text-navy-900 dark:text-white w-full justify-between"
        >
          <span className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-gold-500 text-navy-950 text-xs px-1.5 py-0.5 rounded-full font-bold">
                {(selectedVolume ? 1 : 0) + (selectedAuthor ? 1 : 0) + selectedTypes.length + (query ? 1 : 0)}
              </span>
            )}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showSidebar ? 'rotate-180' : ''}`} />
        </button>
        {showSidebar && (
          <div className="mt-2 rounded-xl border border-slate-200 dark:border-navy-800 bg-white dark:bg-navy-900 p-4 shadow-sm">
            {sidebarContent}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Search by title, author, or keyword..."
              aria-label="Search articles"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <label htmlFor="articles-sort" className="text-sm font-medium text-slate-600 dark:text-slate-400 whitespace-nowrap">
              Sort by
            </label>
            <select
              id="articles-sort"
              value={sort}
              onChange={(event) => handleSortChange(event.target.value as SortOption)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100"
            >
              <option value="latest">Latest</option>
              <option value="views">Most Viewed</option>
              <option value="downloads">Most Downloaded</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Active filters:</span>
            {selectedVolume && (
              <FilterChip
                label={`Volume ${volumeTree.find((v) => v.id === selectedVolume)?.number || ''}`}
                onRemove={() => { setSelectedVolume(null); updateURL({ volume: null }); }}
              />
            )}
            {selectedAuthor && (
              <FilterChip label={selectedAuthor} onRemove={() => { setSelectedAuthor(null); updateURL({ author: null }); }} />
            )}
            {selectedTypes.map((type) => (
              <FilterChip
                key={type}
                label={formatArticleType(type)}
                onRemove={() => handleTypeToggle(type)}
              />
            ))}
            {query && (
              <FilterChip label={`"${query}"`} onRemove={() => { setQuery(''); updateURL({ q: null }); }} />
            )}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 font-medium ml-1"
            >
              Clear all
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-navy-800 dark:bg-navy-900">
            <Search className="mx-auto mb-4 h-12 w-12 text-slate-400" />
            <h2 className="mb-2 text-xl font-semibold text-navy-900 dark:text-white">
              No matching articles
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters or search terms.'
                : 'No published articles available.'}
            </p>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400 text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" /> Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={{
                  id: article.id,
                  slug: article.slug,
                  title: article.title,
                  articleType: article.articleType,
                  shortTitle: article.shortTitle,
                  publishedAt: article.publishedAt ? new Date(article.publishedAt) : null,
                  authors: article.authors,
                  volume: {
                    number: article.volume.number,
                    year: article.volume.year,
                  },
                }}
              />
            ))}
          </div>
        )}

        {filtered.length > 0 && (
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            Showing {filtered.length} of {articles.length} articles
          </div>
        )}
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-navy-100 border border-navy-200 dark:border-navy-700">
      {label}
      <button type="button" onClick={onRemove} className="ml-0.5 hover:text-red-500 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
