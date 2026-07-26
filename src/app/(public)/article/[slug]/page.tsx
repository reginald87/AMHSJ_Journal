import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ArticleDetailClient } from './ArticleDetailClient';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      authors: { orderBy: { position: 'asc' } },
      volume: true,
    },
  });

  if (!article) return { title: 'Article Not Found' };

  return {
    title: article.title,
    description: article.abstract.substring(0, 160),
    openGraph: {
      title: article.title,
      description: article.abstract.substring(0, 160),
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      authors: article.authors.map((a) => `${a.firstName} ${a.lastName}`),
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.abstract.substring(0, 160),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      authors: { orderBy: { position: 'asc' } },
      volume: true,
      references: { orderBy: { position: 'asc' } },
      supplementaryMaterials: true,
      metrics: true,
    },
  });

  if (!article) notFound();

  const articleData = {
    id: article.id,
    slug: article.slug,
    title: article.title,
    shortTitle: article.shortTitle,
    abstract: article.abstract,
    keywords: article.keywords || '',
    doi: article.doi || '',
    articleType: article.articleType || 'RESEARCH_ARTICLE',
    section: article.section,
    language: article.language || 'en',
    license: article.license || 'CC BY 4.0',
    copyrightYear: article.copyrightYear,
    copyrightHolder: article.copyrightHolder,
    publishedAt: article.publishedAt?.toISOString() || null,
    isPublished: article.isPublished,
    isOpenAccess: article.isOpenAccess,
    pageStart: article.pageStart,
    pageEnd: article.pageEnd,
    articleNumber: article.articleNumber,
    authors: article.authors.map((a) => ({
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      middleName: a.middleName,
      email: a.email,
      affiliation: a.affiliation || '',
      orcid: a.orcid,
      position: a.position,
      isCorresponding: a.isCorresponding,
    })),
    volume: {
      id: article.volume.id,
      number: article.volume.number,
      year: article.volume.year,
      publishedAt: article.volume.publishedAt?.toISOString() || null,
    },
    metrics: {
      views: article.metrics?.views ?? 0,
      downloads: article.metrics?.downloads ?? 0,
      citations: article.metrics?.citations ?? 0,
      altmetricScore: article.metrics?.mentions ?? 0,
    },
    references: article.references.map((r) => ({
      id: r.id,
      authors: r.authors,
      title: r.title,
      journal: r.journal,
      year: r.year,
      volume: r.volume,
      issue: r.issue,
      pages: r.pages,
      doi: r.doi,
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <li>
              <a href="/articles" className="hover:text-gold-600 dark:hover:text-gold-400">Articles</a>
            </li>
            <li>/</li>
            <li>
              <a href={`/journal/volume/${article.volume.number}`} className="hover:text-gold-600 dark:hover:text-gold-400">
                Volume {article.volume.number}
              </a>
            </li>
            <li>/</li>
            <li className="text-navy-900 dark:text-white font-medium truncate max-w-[200px]">{article.title}</li>
          </ol>
        </nav>

        <ArticleDetailClient article={articleData} />
      </article>
    </div>
  );
}
