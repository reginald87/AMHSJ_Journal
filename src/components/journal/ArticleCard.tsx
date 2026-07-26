import Link from 'next/link';

import { Badge } from '@/components/ui/Badge';
import { cn, formatDate } from '@/lib/utils';

interface ArticleAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

interface ArticleVolume {
  number: number;
  year: number;
}

interface ArticleCardProps {
  article: {
    id: string;
    slug: string;
    title: string;
    articleType?: string | null;
    shortTitle?: string | null;
    publishedAt?: Date | null;
    authors: ArticleAuthor[];
    volume: ArticleVolume;
  };
  className?: string;
}

const ARTICLE_TYPE_LABELS: Record<string, string> = {
  ORIGINAL_RESEARCH: 'Original Research',
  REVIEW: 'Review Article',
  SYSTEMATIC_REVIEW: 'Systematic Review',
  META_ANALYSIS: 'Meta-Analysis',
  CASE_REPORT: 'Case Report',
  CASE_SERIES: 'Case Series',
  CLINICAL_TRIAL: 'Clinical Trial',
  SHORT_COMMUNICATION: 'Short Communication',
  LETTER_TO_EDITOR: 'Letter to Editor',
  EDITORIAL: 'Editorial',
  COMMENTARY: 'Commentary',
  PERSPECTIVE: 'Perspective',
};

function formatArticleType(articleType?: string | null): string {
  if (!articleType) return 'Article';
  if (ARTICLE_TYPE_LABELS[articleType]) return ARTICLE_TYPE_LABELS[articleType];
  return articleType
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatAuthors(authors: ArticleAuthor[]): string {
  if (authors.length === 0) return 'Unknown authors';
  const names = authors.map((author) => `${author.firstName} ${author.lastName}`.trim());
  if (names.length <= 3) return names.join(', ');
  return `${names.slice(0, 3).join(', ')}, et al.`;
}

function getBadgeVariant(articleType?: string | null): 'gold' | 'navy' | 'outline' {
  if (!articleType) return 'outline';
  if (articleType === 'EDITORIAL' || articleType === 'COMMENTARY') return 'gold';
  if (articleType === 'ORIGINAL_RESEARCH' || articleType === 'REVIEW') return 'navy';
  return 'outline';
}

export function ArticleCard({ article, className }: ArticleCardProps) {
  const { slug, title, articleType, authors, volume, publishedAt } = article;
  const displayDate = publishedAt ?? null;
  const dateString = displayDate
    ? formatDate(displayDate, { month: 'long', year: 'numeric' })
    : `${volume.year}`;

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-navy-200 hover:shadow-md dark:border-navy-700 dark:bg-navy-900 dark:hover:border-gold-500',
        className
      )}
    >
      <div className="mb-3 flex items-center gap-2">
        <Badge variant={getBadgeVariant(articleType)} size="sm">
          {formatArticleType(articleType)}
        </Badge>
      </div>

      <h3 className="mb-2 line-clamp-2 text-base font-semibold leading-snug text-navy-900 group-hover:text-navy-700 dark:text-slate-100 dark:group-hover:text-gold-400 sm:text-lg">
        <Link
          href={`/article/${slug}`}
          className="focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-navy-900"
        >
          <span className="absolute inset-0" aria-hidden="true" />
          {title}
        </Link>
      </h3>

      <p className="mb-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
        {formatAuthors(authors)}
      </p>

      <div className="mt-auto pt-3 text-xs text-slate-500 dark:text-slate-400">
        <span className="font-medium text-navy-700 dark:text-navy-200">
          Volume {volume.number}
        </span>
        <span className="mx-1.5 text-slate-300 dark:text-navy-600">•</span>
        <span>{dateString}</span>
      </div>
    </article>
  );
}

export default ArticleCard;
