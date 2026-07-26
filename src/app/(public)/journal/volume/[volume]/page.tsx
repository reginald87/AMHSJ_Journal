import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Article, ArticleAuthor } from '@prisma/client';

export const dynamic = 'force-dynamic';

interface VolumePageProps {
  params: Promise<{ volume: string }>;
}

export async function generateMetadata({ params }: VolumePageProps): Promise<Metadata> {
  const { volume } = await params;
  const vol = await prisma.volume.findFirst({
    where: { number: parseInt(volume) },
    include: { journal: true },
  });
  if (!vol) return { title: 'Volume Not Found' };
  return { title: `Volume ${vol.number} (${vol.year}) | ${vol.journal.name}` };
}

export default async function VolumePage({ params }: VolumePageProps) {
  const { volume } = await params;
  const vol = await prisma.volume.findFirst({
    where: { number: parseInt(volume) },
    include: {
      journal: true,
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
  });

  if (!vol) notFound();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <li><a href="/journal" className="hover:text-gold-600 dark:hover:text-gold-400">Archive</a></li>
            <li className="text-slate-400">/</li>
            <li className="text-navy-900 dark:text-white font-medium">Volume {vol.number}</li>
          </ol>
        </nav>

        <div className="mb-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex px-3 py-1 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full mb-2">
                Volume {vol.number}
              </span>
              <h1 className="text-3xl font-bold text-navy-900 dark:text-white">
                {vol.title || `Volume ${vol.number} (${vol.year})`}
              </h1>
            </div>
            {vol.publishedAt && (
              <div className="text-right">
                <p className="text-slate-600 dark:text-slate-400">Published</p>
                <p className="font-medium text-navy-900 dark:text-white">
                  {new Date(vol.publishedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
            )}
          </div>

          {vol.description && (
            <p className="text-slate-600 dark:text-slate-400 max-w-3xl">{vol.description}</p>
          )}
        </div>

        <div className="space-y-6">
          {vol.articles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
              <svg className="w-16 h-16 mx-auto text-slate-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 00-2-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">No articles in this volume yet</h2>
              <p className="text-slate-600 dark:text-slate-400">Articles will appear here once published.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 overflow-hidden">
              <div className="p-6 border-b border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950">
                <h2 className="text-lg font-semibold text-navy-900 dark:text-white">
                  Articles in Volume {vol.number}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {vol.articles.length} article{vol.articles.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="divide-y divide-slate-200 dark:divide-navy-800">
                {vol.articles.map((article) => (
                  <ArticleRow key={article.id} article={article} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ArticleRow({ article }: { article: Article & { authors: ArticleAuthor[] } }) {
  const href = `/article/${article.slug}`;
  const authorNames = article.authors.map((a) => `${a.firstName} ${a.lastName}`).join(', ');

  return (
    <Link
      href={href}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-6 transition-colors hover:bg-slate-50 dark:hover:bg-navy-800/50"
    >
      <div className="flex-1 min-w-0 mb-2 sm:mb-0">
        <h3 className="font-semibold text-navy-900 dark:text-white hover:text-gold-600 dark:hover:text-gold-400 transition-colors truncate">
          {article.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 truncate">
          {authorNames}
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {article.pageStart && article.pageEnd && `pp. ${article.pageStart}–${article.pageEnd}`}
          {article.publishedAt && ` • Published ${new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
        </p>
      </div>
      <span className="text-sm font-medium text-gold-700 dark:text-gold-400 shrink-0 ml-4">
        View →
      </span>
    </Link>
  );
}
