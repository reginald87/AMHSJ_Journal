export interface ExtractedAuthor {
  firstName: string;
  lastName: string;
  middleName?: string;
  email?: string;
  affiliation?: string;
}

export interface ExtractedMetadata {
  title: string;
  abstract: string;
  keywords: string;
  authors: ExtractedAuthor[];
  articleType: string;
  section: string;
}

const AFFILIATION_RE = /\b(universit|department|dept|hospital|institut|college|school|laborator|lab|clinic|centre|center|faculty|academ|foundation|research)\b/i;

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;
const NAME_RE = /([A-Z][a-zA-Z]+(?:\s+[A-Z]\.?)?\s+[A-Z][a-zA-Z]+)/g;

function normalize(l: string): string {
  return l.toLowerCase().replace(/[^a-z]/g, '');
}

function headingIndex(lines: string[], words: string[]): number {
  return lines.findIndex((l) => {
    const n = normalize(l);
    return words.some((w) => n === w || n.startsWith(w) || n.includes(` ${w}`));
  });
}

function splitLines(text: string): string[] {
  return (text || '')
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

function cleanAbstract(raw: string): string {
  let value = raw.replace(/\s+/g, ' ').trim();
  value = value.replace(/^(background|methods|results|conclusions|aims|objective|purpose)\s*[:\-]\s*/i, '');
  return value;
}

function detectArticleType(title: string, abstract: string, keywords: string, bodyText: string): string {
  const haystack = `${title} ${abstract} ${keywords} ${bodyText.slice(0, 2000)}`.toLowerCase();

  const typePatterns: [RegExp, string][] = [
    [/\bsystematic\s+(review|literature\s+review|review\s+of)\b/i, 'SYSTEMATIC_REVIEW'],
    [/\bmeta[\s-]?analysis\b/i, 'META_ANALYSIS'],
    [/\bcase\s+report\b/i, 'CASE_REPORT'],
    [/\bcase\s+series\b/i, 'CASE_SERIES'],
    [/\b(randomized|randomised)\s+controlled\s+trial\b/i, 'CLINICAL_TRIAL'],
    [/\bclinical\s+trial\b/i, 'CLINICAL_TRIAL'],
    [/\bleditorial\b/i, 'EDITORIAL'],
    [/\bletter\s+to\s+the\s+editor\b/i, 'LETTER_TO_EDITOR'],
    [/\bshort\s+communication\b/i, 'SHORT_COMMUNICATION'],
    [/\bcommentary\b|\bcomment\s+on\b/i, 'COMMENTARY'],
    [/\bperspective\b|\bviewpoint\b/i, 'PERSPECTIVE'],
    [/\breview\b(?!.*\bof\b.*\bliterature\b)/i, 'REVIEW'],
  ];

  for (const [pattern, type] of typePatterns) {
    if (pattern.test(haystack)) return type;
  }

  return 'ORIGINAL_RESEARCH';
}

interface SectionDef {
  type: string;
  headingWords: string[];
  contentKeywords: string[];
}

const SECTIONS: SectionDef[] = [
  { type: 'CARDIOLOGY', headingWords: ['cardiology', 'cardiovascular', 'cardiac'], contentKeywords: ['cardiac', 'cardiovascular', 'heart failure', 'myocardial', 'arrhythmia', 'coronary', 'hypertension', 'echocardiogra', 'angioplasty', 'stent'] },
  { type: 'NEUROLOGY', headingWords: ['neurology', 'neurological', 'neuroscience'], contentKeywords: ['neurolog', 'brain', 'stroke', 'epilepsy', 'neurodegenerat', 'alzheimer', 'parkinson', 'multiple sclerosis', 'meningitis', 'encephalitis'] },
  { type: 'ONCOLOGY', headingWords: ['oncology', 'cancer', 'tumor', 'tumour'], contentKeywords: ['malignan', 'carcinoma', 'sarcoma', 'lymphoma', 'leukemia', 'chemotherapy', 'radiotherapy', 'metasta', 'neoplasm', 'tumor', 'tumour'] },
  { type: 'PEDIATRICS', headingWords: ['pediatric', 'paediatric', 'neonatal', 'child health'], contentKeywords: ['pediatric', 'paediatric', 'neonatal', 'infant', 'childhood', 'adolescent', 'newborn', 'NICU'] },
  { type: 'SURGERY', headingWords: ['surgery', 'surgical'], contentKeywords: ['surgical', 'operation', 'laparoscop', 'arthroscop', 'postoperative', 'preoperative', 'anesthes', 'anaesthes', 'resection', 'incision'] },
  { type: 'RADIOLOGY', headingWords: ['radiology', 'imaging', 'diagnostic imaging'], contentKeywords: ['radiology', 'mri', 'ct scan', 'ultrasound', 'x-ray', 'mammogra', 'fluoroscop', 'interventional radiol', 'nuclear medicine'] },
  { type: 'PATHOLOGY', headingWords: ['pathology', 'pathological'], contentKeywords: ['patholog', 'biopsy', 'histolog', 'cytolog', 'immunohistochem', 'histopatholog', 'gross examination'] },
  { type: 'PHARMACOLOGY', headingWords: ['pharmacology', 'pharmacological', 'pharmacotherapy'], contentKeywords: ['pharmacolog', 'drug', 'dose', 'bioavailability', 'pharmacokinetic', 'pharmacodynamic', 'therapeutic', 'adverse effect', 'side effect'] },
  { type: 'PUBLIC_HEALTH', headingWords: ['public health', 'epidemiology', 'community health'], contentKeywords: ['epidemiolog', 'prevalence', 'incidence', 'population health', 'community health', 'disease surveillance', 'public health', 'health promotion'] },
  { type: 'MEDICAL_EDUCATION', headingWords: ['medical education', 'health professions education'], contentKeywords: ['medical education', 'curriculum', 'clinical simulation', 'competency-based', 'medical training', 'residency', 'medical student'] },
  { type: 'HEALTH_POLICY', headingWords: ['health policy', 'healthcare policy'], contentKeywords: ['health policy', 'healthcare system', 'health reform', 'health insurance', 'universal health', 'health economics', 'health regulation'] },
];

function detectSection(title: string, abstract: string, keywords: string, bodyText: string): string {
  const fullText = `${title}\n${keywords}\n${abstract}\n${bodyText.slice(0, 3000)}`.toLowerCase();

  const headingLine = title.toLowerCase();

  for (const section of SECTIONS) {
    if (section.headingWords.some((w) => headingLine.includes(w))) return section.type;
  }

  const scored = SECTIONS.map((section) => {
    let score = 0;
    for (const kw of section.contentKeywords) {
      const re = new RegExp(`\\b${kw}`, 'gi');
      const matches = fullText.match(re);
      if (matches) score += matches.length;
    }
    return { type: section.type, score };
  }).filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length > 0 && scored[0].score >= 3) return scored[0].type;

  return 'INTERNAL_MEDICINE';
}

function extractTitle(candidates: string[]): string {
  const titleLines = candidates.filter((l) => {
    if (l.includes('@')) return false;
    if (AFFILIATION_RE.test(l)) return false;
    if (l.length > 250) return false;
    return true;
  });
  let chosen = titleLines.slice(0, 3).join(' ').trim();
  if (chosen.length > 200) chosen = chosen.slice(0, 200);
  return chosen;
}

function parseName(raw: string): { firstName: string; lastName: string } | null {
  const parts = raw.trim().split(/\s+/);
  if (parts.length < 2) return null;
  const lastName = parts.pop() as string;
  const firstName = parts.join(' ');
  if (firstName.length < 1 || lastName.length < 2) return null;
  return { firstName, lastName };
}

function dedupeAuthors(authors: ExtractedAuthor[]): ExtractedAuthor[] {
  const seen = new Set<string>();
  const out: ExtractedAuthor[] = [];
  for (const a of authors) {
    const key = `${a.firstName} ${a.lastName}`.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(a);
  }
  return out;
}

function extractAuthors(beforeAbstract: string[], fullText: string): ExtractedAuthor[] {
  const authors: ExtractedAuthor[] = [];

  const emails = fullText.match(EMAIL_RE) || [];
  if (emails.length) {
    for (const email of emails.slice(0, 20)) {
      const idx = fullText.indexOf(email);
      const snippet = fullText.slice(Math.max(0, idx - 140), idx);
      const names = snippet.match(NAME_RE);
      if (names && names.length) {
        const parsed = parseName(names[names.length - 1]);
        if (parsed && !authors.some((a) => a.email === email)) {
          authors.push({ ...parsed, email });
        }
      }
    }
  }

  if (authors.length === 0) {
    for (const line of beforeAbstract) {
      if (/[@\d]/.test(line)) continue;
      if (AFFILIATION_RE.test(line)) continue;
      const names = line.match(NAME_RE);
      if (!names) continue;
      for (const nm of names) {
        const parsed = parseName(nm);
        if (parsed) authors.push(parsed);
      }
    }
  }

  return dedupeAuthors(authors);
}

export function extractMetadata(text: string): ExtractedMetadata {
  const lines = splitLines(text);

  const abstractIdx = headingIndex(lines, ['abstract']);
  const keywordsIdx = headingIndex(lines, ['keywords']);
  const bodyIdx = headingIndex(lines, ['introduction', 'background', 'methods', 'objective', 'materials']);

  const abstractEnd = keywordsIdx >= 0 ? keywordsIdx : bodyIdx >= 0 ? bodyIdx : lines.length;

  let abstract = '';
  if (abstractIdx >= 0) {
    abstract = cleanAbstract(lines.slice(abstractIdx + 1, abstractEnd).join(' '));
  }
  if (abstract.length > 4000) abstract = abstract.slice(0, 4000);

  let keywords = '';
  if (keywordsIdx >= 0) {
    let kwText = lines[keywordsIdx].replace(/^keywords\s*[:\-]?\s*/i, '');
    if (kwText.length < 5 && keywordsIdx + 1 < lines.length) {
      kwText = lines[keywordsIdx + 1];
    }
    keywords = kwText
      .split(/[;\n]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .join('; ');
  }
  if (keywords.length > 500) keywords = keywords.slice(0, 500);

  const titleEnd = abstractIdx >= 0 ? abstractIdx : Math.min(6, lines.length);
  const title = extractTitle(lines.slice(0, titleEnd));

  const authors = extractAuthors(lines.slice(0, titleEnd), text);

  const bodyText = bodyIdx >= 0 ? lines.slice(bodyIdx).join(' ') : '';

  return {
    title: title.slice(0, 200),
    abstract,
    keywords,
    authors: authors.slice(0, 20),
    articleType: detectArticleType(title, abstract, keywords, bodyText),
    section: detectSection(title, abstract, keywords, bodyText),
  };
}

export async function extractManuscriptText(buffer: Buffer, mime: string, filename: string): Promise<string> {
  const name = (filename || '').toLowerCase();

  if (mime === 'application/pdf' || name.endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse');
    const pdf = new PDFParse({ data: buffer });
    const result = await pdf.getText();
    await pdf.destroy();
    return result.text || '';
  }

  if (name.endsWith('.docx') || mime.includes('officedocument.wordprocessingml')) {
    const mammothMod = await import('mammoth');
    const mammoth = (mammothMod.default || mammothMod) as {
      extractRawText: (opts: { buffer: Buffer }) => Promise<{ value?: string }>;
    };
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  }

  if (name.endsWith('.doc') || mime === 'application/msword') {
    const WordExtractorMod = await import('word-extractor');
    const WordExtractor = (WordExtractorMod.default || WordExtractorMod) as new () => {
      extract: (buf: Buffer) => Promise<{ getBody: () => string }>;
    };
    const extractor = new WordExtractor();
    const doc = await extractor.extract(buffer);
    return doc.getBody() || '';
  }

  return '';
}
