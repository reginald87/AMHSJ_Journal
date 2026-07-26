export interface ArticleCitationData {
  title: string;
  authors: { firstName: string; lastName: string; middleName?: string | null }[];
  publishedAt: Date | string | null;
  volume: number;
  issue?: number;
  pageStart?: number | null;
  pageEnd?: number | null;
  doi: string;
  journalName?: string;
}

function formatAuthorAPA(a: { firstName: string; lastName: string; middleName?: string | null }): string {
  return `${a.lastName}, ${a.firstName[0]}.${a.middleName ? ' ' + a.middleName[0] + '.' : ''}`;
}

function formatAuthorMLA(a: { firstName: string; lastName: string }): string {
  return `${a.lastName}, ${a.firstName}`;
}

function formatAuthorIEEE(a: { firstName: string; lastName: string; middleName?: string | null }): string {
  return `${a.firstName[0]}. ${a.middleName ? a.middleName[0] + '. ' : ''}${a.lastName}`;
}

function formatAuthorHarvard(a: { firstName: string; lastName: string }): string {
  return `${a.lastName}, ${a.firstName}`;
}

function getYear(data: ArticleCitationData): string {
  if (!data.publishedAt) return 'n.d.';
  return new Date(data.publishedAt).getFullYear().toString();
}

function getPages(data: ArticleCitationData): string {
  if (data.pageStart && data.pageEnd) return `${data.pageStart}–${data.pageEnd}`;
  if (data.pageStart) return `${data.pageStart}`;
  return '';
}

export function formatAPA(data: ArticleCitationData): string {
  const authors = data.authors.map(formatAuthorAPA);
  const year = getYear(data);
  const pages = getPages(data);
  const journal = data.journalName || 'Advances in Medicine and Health Sciences Journal';
  let citation = `${authors.join(', ')} (${year}). ${data.title}. ${journal}, ${data.volume}${data.issue ? `(${data.issue})` : ''}`;
  if (pages) citation += `, ${pages}`;
  citation += `. https://doi.org/${data.doi}`;
  return citation;
}

export function formatMLA(data: ArticleCitationData): string {
  const authors = data.authors.map(formatAuthorMLA);
  const year = getYear(data);
  const pages = getPages(data);
  const journal = data.journalName || 'Advances in Medicine and Health Sciences Journal';
  let authorStr: string;
  if (authors.length === 1) authorStr = authors[0];
  else if (authors.length === 2) authorStr = `${authors[0]}, and ${authors[1]}`;
  else authorStr = `${authors[0]}, et al.`;
  let citation = `${authorStr}. "${data.title}." ${journal}, vol. ${data.volume}${data.issue ? `, no. ${data.issue}` : ''}, ${year}`;
  if (pages) citation += `, pp. ${pages}`;
  citation += `. https://doi.org/${data.doi}.`;
  return citation;
}

export function formatIEEE(data: ArticleCitationData): string {
  const authors = data.authors.map(formatAuthorIEEE);
  const year = getYear(data);
  const pages = getPages(data);
  const journal = data.journalName || 'Advances in Medicine and Health Sciences Journal';
  let authorStr: string;
  if (authors.length <= 3) authorStr = authors.join(', ');
  else authorStr = `${authors.slice(0, 3).join(', ')}, et al.`;
  let citation = `${authorStr}, "${data.title}," ${journal}, vol. ${data.volume}${data.issue ? `, no. ${data.issue}` : ''}`;
  if (pages) citation += `, pp. ${pages}`;
  citation += `, ${year}, doi: ${data.doi}.`;
  return citation;
}

export function formatHarvard(data: ArticleCitationData): string {
  const authors = data.authors.map(formatAuthorHarvard);
  const year = getYear(data);
  const pages = getPages(data);
  const journal = data.journalName || 'Advances in Medicine and Health Sciences Journal';
  let authorStr: string;
  if (authors.length <= 2) authorStr = authors.join(' and ');
  else authorStr = `${authors.slice(0, -1).join(', ')} and ${authors[authors.length - 1]}`;
  let citation = `${authorStr} (${year}) '${data.title}', ${journal}, ${data.volume}${data.issue ? `(${data.issue})` : ''}`;
  if (pages) citation += `, pp. ${pages}`;
  citation += `. doi: ${data.doi}.`;
  return citation;
}

export function formatRIS(data: ArticleCitationData): string {
  const year = getYear(data);
  const journal = data.journalName || 'Advances in Medicine and Health Sciences Journal';
  let ris = `TY  - JOUR\n`;
  ris += `TI  - ${data.title}\n`;
  for (const a of data.authors) {
    ris += `AU  - ${a.lastName}, ${a.firstName}\n`;
  }
  ris += `JO  - ${journal}\n`;
  ris += `VL  - ${data.volume}\n`;
  if (data.issue) ris += `IS  - ${data.issue}\n`;
  if (data.pageStart) ris += `SP  - ${data.pageStart}\n`;
  if (data.pageEnd) ris += `EP  - ${data.pageEnd}\n`;
  ris += `PY  - ${year}\n`;
  ris += `DO  - ${data.doi}\n`;
  ris += `ER  -\n`;
  return ris;
}

export function formatBibTeX(data: ArticleCitationData): string {
  const year = getYear(data);
  const firstAuthor = data.authors[0];
  const key = `${firstAuthor?.lastName || 'unknown'}${year}`;
  const authors = data.authors.map(a => `${a.firstName} ${a.lastName}`).join(' and ');
  const journal = data.journalName || 'Advances in Medicine and Health Sciences Journal';
  const pages = data.pageStart && data.pageEnd ? `${data.pageStart}--${data.pageEnd}` : '';
  let bib = `@article{${key},\n`;
  bib += `  title     = {${data.title}},\n`;
  bib += `  author    = {${authors}},\n`;
  bib += `  journal   = {${journal}},\n`;
  bib += `  volume    = {${data.volume}},\n`;
  if (data.issue) bib += `  number    = {${data.issue}},\n`;
  if (pages) bib += `  pages     = {${pages}},\n`;
  bib += `  year      = {${year}},\n`;
  bib += `  doi       = {${data.doi}}\n`;
  bib += `}`;
  return bib;
}

export type CitationStyle = 'apa' | 'mla' | 'ieee' | 'harvard';

export function formatCitation(style: CitationStyle, data: ArticleCitationData): string {
  switch (style) {
    case 'apa': return formatAPA(data);
    case 'mla': return formatMLA(data);
    case 'ieee': return formatIEEE(data);
    case 'harvard': return formatHarvard(data);
  }
}

export const CITATION_LABELS: Record<CitationStyle, string> = {
  apa: 'APA',
  mla: 'MLA',
  ieee: 'IEEE',
  harvard: 'Harvard',
};
