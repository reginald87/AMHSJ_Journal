import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ArticlesBrowser, type ArticleListItem, type VolumeTree, type AuthorFilter } from '@/components/journal/ArticlesBrowser';

export const metadata: Metadata = {
  title: 'Articles',
  description:
    'Browse all published articles from Advances in Medicine and Health Sciences Journal across every volume.',
};

export const dynamic = 'force-dynamic';

async function getArticles(): Promise<ArticleListItem[]> {
  const articles = await prisma.article.findMany({
    where: {
      isPublished: true,
      publishedAt: { not: null },
      OR: [
        { manuscriptId: null },
        { manuscript: { status: 'PUBLISHED' } },
      ],
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      authors: {
        select: { id: true, firstName: true, lastName: true },
        orderBy: { position: 'asc' },
      },
      volume: { select: { number: true, year: true } },
      metrics: true,
    },
  });

  return articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: article.title,
    articleType: article.articleType,
    shortTitle: article.shortTitle,
    keywords: article.keywords,
    publishedAt: article.publishedAt ? article.publishedAt.toISOString() : null,
    authors: article.authors.map((author) => ({
      id: author.id,
      firstName: author.firstName,
      lastName: author.lastName,
    })),
    volumeId: article.volumeId,
    volume: {
      number: article.volume.number,
      year: article.volume.year,
    },
    metrics: article.metrics
      ? {
          views: article.metrics.views,
          downloads: article.metrics.downloads,
        }
      : null,
  }));
}

async function getVolumeTree(): Promise<VolumeTree[]> {
  const volumes = await prisma.volume.findMany({
    orderBy: { number: 'desc' },
    include: {
      _count: { select: { articles: { where: { isPublished: true } } } },
    },
  });

  return volumes.map((vol) => ({
    id: vol.id,
    number: vol.number,
    year: vol.year,
    title: vol.title,
    articleCount: vol._count.articles,
  }));
}

async function getUniqueAuthors(): Promise<AuthorFilter[]> {
  const authorRows = await prisma.articleAuthor.findMany({
    where: { article: { isPublished: true } },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { lastName: 'asc' },
    distinct: ['firstName', 'lastName'],
  });

  return authorRows.map((a) => ({
    id: a.id,
    firstName: a.firstName,
    lastName: a.lastName,
  }));
}

async function getArticleTypes(): Promise<string[]> {
  const rows = await prisma.article.groupBy({
    by: ['articleType'],
    where: { isPublished: true },
    _count: { articleType: true },
    orderBy: { _count: { articleType: 'desc' } },
  });
  return rows.map((r) => r.articleType).filter(Boolean) as string[];
}

export default async function ArticlesPage() {
  const [articles, volumeTree, uniqueAuthors, articleTypes] = await Promise.all([
    getArticles(),
    getVolumeTree(),
    getUniqueAuthors(),
    getArticleTypes(),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/50" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              Published Research
            </span>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
              Articles
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 leading-relaxed">
              Explore peer-reviewed research from every volume of the
              Advances in Medicine and Health Sciences Journal. Filter by volume,
              author, or article type.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {articles.length === 0 ? (
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
                  d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 00-2-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                />
              </svg>
              <h2 className="mb-2 text-xl font-semibold text-navy-900 dark:text-white">
                No articles published yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                Check back soon, or submit your manuscript to be the first.
              </p>
            </div>
          ) : (
            <ArticlesBrowser
              articles={articles}
              volumeTree={volumeTree}
              uniqueAuthors={uniqueAuthors}
              articleTypes={articleTypes}
            />
          )}
        </div>
      </section>
    </div>
  );
}
