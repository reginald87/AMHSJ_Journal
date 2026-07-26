import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { cn } from '@/lib/utils';
import { Volume, Article, ArticleAuthor } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Journal Archive',
  description: 'Browse all volumes and articles of Advances in Medicine and Health Sciences Journal',
};

export const dynamic = 'force-dynamic';

async function getVolumes() {
  const journal = await prisma.journal.findFirst({
    where: { shortName: 'AMHSJ' },
    include: {
      volumes: {
        orderBy: { number: 'desc' },
        include: {
          articles: {
            orderBy: { pageStart: 'asc' },
            include: {
              authors: {
                orderBy: { position: 'asc' },
              },
            },
            where: { isPublished: true },
          },
          _count: { select: { articles: true } },
        },
      },
    },
  });
  return journal?.volumes || [];
}

export default async function JournalArchivePage() {
  const volumes = await getVolumes();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4">Journal Archive</h1>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Browse all published volumes of Advances in Medicine and Health Sciences Journal.
          </p>
        </div>

        {volumes.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
            <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 00-2-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">No volumes published yet</h2>
            <p className="text-slate-600 dark:text-slate-400">Check back soon for our first volume!</p>
          </div>
        ) : (
          <div className="space-y-8">
            {volumes.map((volume) => (
              <VolumeCard key={volume.id} volume={volume} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

interface VolumeWithArticles extends Volume {
  articles: (Article & { authors: ArticleAuthor[] })[];
  _count?: { articles: number };
}

function VolumeCard({ volume }: { volume: VolumeWithArticles }) {
  return (
    <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 overflow-hidden">
      <div className="p-6 border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex px-3 py-1 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full">
                Volume {volume.number}
              </span>
              <span className="text-slate-500 dark:text-slate-400 text-sm">({volume.year})</span>
            </div>
            {volume.title && (
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white">{volume.title}</h2>
            )}
            {volume.description && (
              <p className="text-slate-600 dark:text-slate-400 mt-1">{volume.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {volume._count?.articles || 0} article{(volume._count?.articles || 0) !== 1 ? 's' : ''}
            </span>
            {volume.publishedAt && (
              <span className="inline-flex px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
                Published {new Date(volume.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      <Link
        href={`/journal/volume/${volume.number}`}
        className="flex items-center justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/50"
      >
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {volume.articles.length} article{volume.articles.length !== 1 ? 's' : ''} in this volume
          </p>
          {volume.doi && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">DOI: {volume.doi}</p>
          )}
        </div>
        <span className="text-sm font-medium text-gold-700 dark:text-gold-400">
          View volume →
        </span>
      </Link>
    </div>
  );
}
