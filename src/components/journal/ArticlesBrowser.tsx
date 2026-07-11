'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { ArticleCard } from '@/components/journal/ArticleCard';

type ArticleAuthor = {
  id: string;
  firstName: string;
  lastName: string;
};

type ArticleIssue = {
  id: string;
  number: number;
  volume: { number: number; year: number };
  publishedAt: string | null;
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
  issue: ArticleIssue;
  metrics: ArticleMetric | null;
};

type SortOption = 'latest' | 'views' | 'downloads';
type FilterOption = 'all' | 'current';

interface ArticlesBrowserProps {
  articles: ArticleListItem[];
  currentIssueId: string | null;
}

function parseKeywords(keywords: string): string[] {
  if (!keywords) return [];
  try {
    const parsed = JSON.parse(keywords);
    if (Array.isArray(parsed)) return parsed.map((k) => String(k));
  } catch {
    // Fall through to comma-split below.
  }
  return keywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);
}

function getTimestamp(article: ArticleListItem): number {
  const date = article.publishedAt ?? article.issue.publishedAt;
  return date ? new Date(date).getTime() : 0;
}

export function ArticlesBrowser({ articles, currentIssueId }: ArticlesBrowserProps) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortOption>('latest');
  const [filter, setFilter] = useState<FilterOption>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = articles;

    if (filter === 'current' && currentIssueId) {
      list = list.filter((article) => article.issue.id === currentIssueId);
    }

    if (q) {
      list = list.filter((article) => {
        if (article.title.toLowerCase().includes(q)) return true;
        if (article.shortTitle && article.shortTitle.toLowerCase().includes(q)) return true;
        const keywords = parseKeywords(article.keywords);
        if (keywords.some((k) => k.toLowerCase().includes(q))) return true;
        const authorName = `${article.authors.map((a) => `${a.firstName} ${a.lastName}`).join(' ')}`.toLowerCase();
        if (authorName.includes(q)) return true;
        return false;
      });
    }

    const sorted = [...list];
    if (sort === 'views') {
      sorted.sort(
        (a, b) => (b.metrics?.views ?? 0) - (a.metrics?.views ?? 0) || getTimestamp(b) - getTimestamp(a)
      );
    } else if (sort === 'downloads') {
      sorted.sort(
        (a, b) =>
          (b.metrics?.downloads ?? 0) - (a.metrics?.downloads ?? 0) || getTimestamp(b) - getTimestamp(a)
      );
    } else {
      sorted.sort((a, b) => getTimestamp(b) - getTimestamp(a));
    }

    return sorted;
  }, [articles, query, sort, filter, currentIssueId]);

  const hasNoResults = filtered.length === 0;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by title, author, or keyword..."
            aria-label="Search articles"
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 shadow-sm transition-colors focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="articles-sort"
            className="text-sm font-medium text-slate-600 dark:text-slate-400"
          >
            Sort by
          </label>
          <select
            id="articles-sort"
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-500/20 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-100"
          >
            <option value="latest">Latest</option>
            <option value="views">Most Viewed</option>
            <option value="downloads">Most Downloaded</option>
          </select>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <FilterPill
          label="All"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <FilterPill
          label="Current Issue"
          active={filter === 'current'}
          onClick={() => setFilter('current')}
          disabled={!currentIssueId}
        />
      </div>

      {hasNoResults ? (
        <div className="rounded-xl border border-slate-200 bg-white py-16 text-center dark:border-navy-800 dark:bg-navy-900">
          <svg
            className="mx-auto mb-4 h-16 w-16 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="mb-2 text-xl font-semibold text-navy-900 dark:text-white">
            No matching articles
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            {query
              ? 'Try a different search term or clear the filters.'
              : 'No published articles match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                issue: {
                  number: article.issue.number,
                  volume: article.issue.volume,
                  publishedAt: article.issue.publishedAt
                    ? new Date(article.issue.publishedAt)
                    : null,
                },
              }}
            />
          ))}
        </div>
      )}
    </>
  );
}

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}

function FilterPill({ label, active, onClick, disabled = false }: FilterPillProps) {
  const base =
    'inline-flex items-center rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-navy-950';
  const activeClasses =
    'bg-navy-900 text-white hover:bg-navy-800 dark:bg-gold-500 dark:text-navy-950 dark:hover:bg-gold-400';
  const inactiveClasses =
    'border border-slate-200 bg-white text-slate-700 hover:border-navy-300 hover:text-navy-900 dark:border-navy-700 dark:bg-navy-900 dark:text-slate-300 dark:hover:border-gold-500 dark:hover:text-gold-400';
  const disabledClasses = 'cursor-not-allowed opacity-50';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`${base} ${active ? activeClasses : inactiveClasses} ${disabled ? disabledClasses : ''}`.trim()}
    >
      {label}
    </button>
  );
}
