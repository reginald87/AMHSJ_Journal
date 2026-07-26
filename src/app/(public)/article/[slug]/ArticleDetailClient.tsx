'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import {
  formatCitation,
  formatRIS,
  formatBibTeX,
  CITATION_LABELS,
  type CitationStyle,
  type ArticleCitationData,
} from '@/lib/citations';
import {
  Download,
  Eye,
  ExternalLink,
  Link2,
  Mail,
  Quote,
  FileText,
  Copy,
  Check,
  ChevronDown,
  Globe,
} from 'lucide-react';

interface ArticleDetailClientProps {
  article: {
    id: string;
    slug: string;
    title: string;
    shortTitle?: string | null;
    abstract: string;
    keywords: string;
    doi: string;
    articleType: string;
    section?: string | null;
    language: string;
    license: string;
    copyrightYear?: number | null;
    copyrightHolder?: string | null;
    publishedAt?: string | null;
    isPublished: boolean;
    isOpenAccess: boolean;
    pageStart?: number | null;
    pageEnd?: number | null;
    articleNumber?: string | null;
    authors: {
      id: string;
      firstName: string;
      lastName: string;
      middleName?: string | null;
      email?: string | null;
      affiliation: string;
      orcid?: string | null;
      position: number;
      isCorresponding: boolean;
    }[];
    volume: {
      id: string;
      number: number;
      year: number;
      publishedAt?: string | null;
    };
    metrics: {
      views: number;
      downloads: number;
      citations: number;
      altmetricScore: number;
    };
    references: {
      id: string;
      authors: string;
      title: string;
      journal?: string | null;
      year?: number | null;
      volume?: string | null;
      issue?: string | null;
      pages?: string | null;
      doi?: string | null;
    }[];
  };
}

export function ArticleDetailClient({ article }: ArticleDetailClientProps) {
  const [activeCitationStyle, setActiveCitationStyle] = useState<CitationStyle>('apa');
  const [copiedStyle, setCopiedStyle] = useState<string | null>(null);
  const [showCitationDropdown, setShowCitationDropdown] = useState(false);

  const keywords = article.keywords
    .split(/[,;]/)
    .map((k) => k.trim())
    .filter(Boolean);

  const citationData: ArticleCitationData = {
    title: article.title,
    authors: article.authors,
    publishedAt: article.publishedAt ?? null,
    volume: article.volume.number,
    issue: article.volume.number,
    pageStart: article.pageStart,
    pageEnd: article.pageEnd,
    doi: article.doi,
  };

  const citationText = formatCitation(activeCitationStyle, citationData);
  const risText = formatRIS(citationData);
  const bibtexText = formatBibTeX(citationData);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStyle(label);
      setTimeout(() => setCopiedStyle(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedStyle(label);
      setTimeout(() => setCopiedStyle(null), 2000);
    }
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXTAUTH_URL || 'https://amhsj.org');
  const articleUrl = `${baseUrl}/article/${article.slug}`;

  return (
    <div className="space-y-8">
      <header>
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex px-3 py-1 bg-navy-100 dark:bg-navy-800 text-navy-700 dark:text-navy-300 text-sm font-medium rounded-full">
            {article.articleType?.replace(/_/g, ' ') || 'Article'}
          </span>
          {article.section && (
            <span className="inline-flex px-3 py-1 border border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-400 text-sm rounded-full">
              {article.section}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-sm font-medium rounded-full">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            Open Access
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 dark:text-white mb-4 leading-tight">
          {article.title}
        </h1>

        {article.shortTitle && (
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-4 italic">
            <strong className="not-italic">Short title:</strong> {article.shortTitle}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
          {article.doi && (
            <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="hover:text-gold-600 dark:hover:text-gold-400 flex items-center gap-1">
              <ExternalLink className="w-3.5 h-3.5" /> DOI: {article.doi}
            </a>
          )}
          {article.pageStart && article.pageEnd && (
            <span>pp. {article.pageStart}–{article.pageEnd}</span>
          )}
          {article.articleNumber && (
            <span>Article {article.articleNumber}</span>
          )}
          {article.publishedAt && (
            <span>Published {formatDate(article.publishedAt)}</span>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <section>
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-3">Abstract</h2>
            <div className="bg-slate-50 dark:bg-navy-900 p-6 rounded-lg border border-slate-200 dark:border-navy-800">
              {article.abstract.split('\n\n').map((para, i) => (
                <p key={i} className="mb-4 last:mb-0 text-slate-700 dark:text-slate-300 leading-relaxed">{para}</p>
              ))}
            </div>
          </section>

          {keywords.length > 0 && (
            <section>
              <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-3">Keywords</h2>
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, i) => (
                  <span key={i} className="inline-flex items-center px-3 py-1 bg-slate-100 dark:bg-navy-800 text-slate-700 dark:text-slate-300 text-sm rounded-full border border-slate-200 dark:border-navy-700">
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="pt-6 border-t border-slate-200 dark:border-navy-800">
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Authors</h2>
            <div className="space-y-4">
              {article.authors.map((author) => (
                <div key={author.id} className="flex items-start gap-4 p-4 bg-white dark:bg-navy-900 rounded-lg border border-slate-200 dark:border-navy-800">
                  <div className="w-12 h-12 bg-navy-100 dark:bg-navy-800 rounded-full flex items-center justify-center text-navy-700 dark:text-navy-300 font-bold text-lg shrink-0">
                    {author.firstName[0]}{author.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 dark:text-white">
                      {author.firstName} {author.middleName ? author.middleName + ' ' : ''}{author.lastName}
                      {author.isCorresponding && (
                        <span className="ml-2 text-xs bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-400 px-2 py-0.5 rounded-full font-medium">
                          Corresponding Author
                        </span>
                      )}
                    </p>
                    {author.affiliation && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{author.affiliation}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {author.orcid && (
                        <a href={`https://orcid.org/${author.orcid}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-green-600 dark:hover:text-green-400">
                          <span className="font-bold text-green-600">ORCID</span> {author.orcid}
                        </a>
                      )}
                      {author.email && (
                        <a href={`mailto:${author.email}`} className="flex items-center gap-1 hover:text-gold-600 dark:hover:text-gold-400">
                          <Mail className="w-3.5 h-3.5" /> {author.email}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {article.references.length > 0 && (
            <section className="pt-6 border-t border-slate-200 dark:border-navy-800">
              <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">References</h2>
              <ol className="space-y-3">
                {article.references.map((ref, i) => (
                  <li key={ref.id} className="text-sm text-slate-700 dark:text-slate-300 pl-6 relative">
                    <span className="absolute left-0 text-slate-400 dark:text-slate-500 font-medium">{i + 1}.</span>
                    {ref.authors}. {ref.title}.{' '}
                    {ref.journal && <em>{ref.journal}</em>}
                    {ref.year && `. ${ref.year}`}
                    {ref.volume && `;${ref.volume}`}
                    {ref.issue && `(${ref.issue})`}
                    {ref.pages && `: ${ref.pages}`}
                    {ref.doi && `. doi: ${ref.doi}`}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="pt-6 border-t border-slate-200 dark:border-navy-800">
            <h2 className="text-xl font-bold text-navy-900 dark:text-white mb-4">Citation</h2>

            <div className="flex flex-wrap items-center gap-2 mb-3">
              {(Object.keys(CITATION_LABELS) as CitationStyle[]).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => setActiveCitationStyle(style)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    activeCitationStyle === style
                      ? 'bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950'
                      : 'bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700'
                  }`}
                >
                  {CITATION_LABELS[style]}
                </button>
              ))}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCitationDropdown(!showCitationDropdown)}
                  className="px-3 py-1.5 text-sm font-medium rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700 flex items-center gap-1"
                >
                  More <ChevronDown className="w-3 h-3" />
                </button>
                {showCitationDropdown && (
                  <div className="absolute z-10 top-full mt-1 right-0 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700 rounded-lg shadow-lg py-1 min-w-[120px]">
                    <button
                      type="button"
                      onClick={() => { copyToClipboard(risText, 'RIS'); setShowCitationDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center gap-2"
                    >
                      {copiedStyle === 'RIS' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy RIS
                    </button>
                    <button
                      type="button"
                      onClick={() => { copyToClipboard(bibtexText, 'BibTeX'); setShowCitationDropdown(false); }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-navy-800 flex items-center gap-2"
                    >
                      {copiedStyle === 'BibTeX' ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                      Copy BibTeX
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-navy-900 p-4 rounded-lg border border-slate-200 dark:border-navy-800 font-mono text-sm overflow-x-auto">
              <pre className="whitespace-pre-wrap text-slate-700 dark:text-slate-300">{citationText}</pre>
            </div>

            <button
              type="button"
              onClick={() => copyToClipboard(citationText, activeCitationStyle)}
              className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 text-white dark:bg-gold-500 dark:text-navy-950 text-sm font-medium rounded-lg hover:bg-navy-800 dark:hover:bg-gold-400 transition-colors"
            >
              {copiedStyle === activeCitationStyle ? (
                <><Check className="w-4 h-4" /> Copied!</>
              ) : (
                <><Copy className="w-4 h-4" /> Copy {CITATION_LABELS[activeCitationStyle]} Citation</>
              )}
            </button>
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-24 space-y-6">
            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">Article Metrics</h3>
              <div className="grid grid-cols-2 gap-3">
                <MetricCard label="Views" value={article.metrics.views} icon={<Eye className="w-4 h-4" />} />
                <MetricCard label="Downloads" value={article.metrics.downloads} icon={<Download className="w-4 h-4" />} />
                <MetricCard label="Citations" value={article.metrics.citations} icon={<Quote className="w-4 h-4" />} />
                <MetricCard label="Altmetric" value={article.metrics.altmetricScore} icon={<FileText className="w-4 h-4" />} />
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">Share Article</h3>
              <div className="space-y-2">
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm rounded-lg transition-colors">
                  <Globe className="w-4 h-4" /> Share on X
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(articleUrl)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 bg-sky-800 hover:bg-sky-900 text-white text-sm rounded-lg transition-colors">
                  <Globe className="w-4 h-4" /> Share on LinkedIn
                </a>
                <a href={`mailto:?subject=${encodeURIComponent(article.title)}&body=${encodeURIComponent(`Read this article: ${articleUrl}`)}`} className="flex items-center gap-3 px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors">
                  <Mail className="w-4 h-4" /> Share via Email
                </a>
                <button
                  type="button"
                  onClick={() => copyToClipboard(articleUrl, 'link')}
                  className="w-full flex items-center gap-3 px-3 py-2 bg-navy-900 hover:bg-navy-800 dark:bg-navy-800 dark:hover:bg-navy-700 text-white text-sm rounded-lg transition-colors"
                >
                  {copiedStyle === 'link' ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                  {copiedStyle === 'link' ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">Article Tools</h3>
              <div className="space-y-2">
                <a href={`/api/articles/${article.slug}/download`} className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-navy-800 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700 text-sm text-navy-900 dark:text-white transition-colors">
                  <Download className="w-4 h-4" /> Download PDF
                </a>
                {article.doi && (
                  <a href={`https://doi.org/${article.doi}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2 bg-slate-50 dark:bg-navy-800 rounded-lg hover:bg-slate-100 dark:hover:bg-navy-700 text-sm text-navy-900 dark:text-white transition-colors">
                    <ExternalLink className="w-4 h-4" /> View at DOI
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6">
              <h3 className="font-semibold text-navy-900 dark:text-white mb-4">Volume Information</h3>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Volume</dt>
                  <dd className="font-medium text-navy-900 dark:text-white">{article.volume.number}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500 dark:text-slate-400">Year</dt>
                  <dd className="font-medium text-navy-900 dark:text-white">{article.volume.year}</dd>
                </div>
                {article.volume.publishedAt && (
                  <div className="flex justify-between">
                    <dt className="text-slate-500 dark:text-slate-400">Published</dt>
                    <dd className="font-medium text-navy-900 dark:text-white">{formatDate(article.volume.publishedAt)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="text-center p-3 bg-slate-50 dark:bg-navy-800 rounded-lg">
      <div className="text-slate-400 dark:text-slate-500 mb-1 flex justify-center">{icon}</div>
      <div className="text-xl font-bold text-navy-900 dark:text-white">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
