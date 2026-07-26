# AMHSJ Journal Identity & Public Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the runtime errors, add an Articles menu and `/articles` page, add a Latest Articles section to the home page, and align styling across all public pages.

**Architecture:** Keep the existing Next.js App Router + Prisma + Tailwind setup. Add a shared `ArticleCard` component for article grids, reuse it on `/articles` and the home page. Fix the Prisma adapter configuration and the `HeartPulse` import. Update the Navbar and Footer once. Apply theme consistency to existing public pages without changing their content or data flow.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS v4, Prisma 7, `@prisma/adapter-better-sqlite3`, `better-sqlite3`, `lucide-react`.

**Design spec:** `.kimchi/docs/superpowers/specs/2026-07-11-journal-identity-design.md`

---

## Task 1: Fix Runtime Errors

**Files:**
- Modify: `src/lib/prisma.ts`
- Modify: `src/app/about/page.tsx`
- Test: `npm run dev` navigation to `/editorial-board` and `/about`

### Step 1: Fix Prisma adapter configuration

Open `src/lib/prisma.ts`. Ensure the file contains exactly the following and no extra constructor options (`datasourceUrl`, `datasources`, etc.):

```ts
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
```

Run `npm run lint` and verify no errors.

If `npm run dev` still throws when visiting `/editorial-board`, switch to a `Database` instance from `better-sqlite3`:

```ts
import Database from 'better-sqlite3';
const sqlite = new Database(process.env.DATABASE_URL?.replace('file:', '') || './dev.db');
const adapter = new PrismaBetterSqlite3(sqlite);
```

Then re-test `/editorial-board`.

### Step 2: Fix About page missing `HeartPulse` import

Open `src/app/about/page.tsx`. Find the existing `lucide-react` import near the top and add `HeartPulse`:

```ts
import { BookOpen, Award, Globe, Users, Calendar, Search, Shield, FileText, GraduationCap, HeartPulse } from 'lucide-react';
```

### Step 3: Verify

Run:

```bash
npm run lint
```

Expected: no errors.

Start dev server and visit:
- `http://localhost:3000/editorial-board`
- `http://localhost:3000/about`

Expected: both pages render without runtime errors.

### Step 4: Commit

```bash
git add src/lib/prisma.ts src/app/about/page.tsx
git commit -m "fix: prisma adapter config and about page HeartPulse import"
```

---

## Task 2: Create Shared ArticleCard Component

**Files:**
- Create: `src/components/journal/ArticleCard.tsx`
- Test: render in isolation if possible; otherwise verify with Task 3

### Step 1: Write the component

Create `src/components/journal/ArticleCard.tsx`:

```tsx
'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { formatDate } from '@/lib/utils';

interface ArticleAuthor {
  id: string;
  firstName: string;
  lastName: string;
}

interface ArticleIssue {
  number: number;
  volume: {
    number: number;
    year: number;
  };
  publishedAt?: Date | null;
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
    issue: ArticleIssue;
  };
}

function formatArticleType(type?: string | null): string {
  if (!type) return 'Article';
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatAuthors(authors: ArticleAuthor[]): string {
  if (!authors || authors.length === 0) return '';
  const names = authors.slice(0, 3).map((a) => `${a.firstName} ${a.lastName}`);
  if (authors.length > 3) names.push('et al.');
  return names.join(', ');
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800 p-6 hover:border-gold-300 hover:shadow-md transition-all h-full flex flex-col">
      <div className="flex items-center gap-2 mb-3">
        {article.articleType && (
          <Badge variant="navy" size="sm">
            {formatArticleType(article.articleType)}
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold text-navy-900 dark:text-white leading-snug mb-3 line-clamp-2 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
        <Link href={`/article/${article.slug}`} className="focus:outline-none focus:underline">
          {article.title}
        </Link>
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
        {formatAuthors(article.authors)}
      </p>

      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>
          Volume {article.issue.volume.number}, Issue {article.issue.number}
        </span>
        {article.publishedAt && <span>{formatDate(article.publishedAt)}</span>}
      </div>
    </article>
  );
}
```

### Step 2: Verify Tailwind line-clamp

If `line-clamp-2` is not enabled by default in the Tailwind v4 config, add a utility or use `line-clamp` plugin. Check `src/app/globals.css` and `tailwind.config` if present. For now, assume `line-clamp-2` works; if lint/build fails, replace with `overflow-hidden text-ellipsis` style.

### Step 3: Commit

```bash
git add src/components/journal/ArticleCard.tsx
git commit -m "feat: add shared ArticleCard component"
```

---

## Task 3: Create `/articles` Listing Page

**Files:**
- Create: `src/app/articles/page.tsx`
- Modify: `src/app/articles/page.tsx`
- Test: visit `http://localhost:3000/articles`

### Step 1: Write server component

Create `src/app/articles/page.tsx`:

```tsx
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { ArticleCard } from '@/components/journal/ArticleCard';
import { Search, Filter } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Browse all published articles from Advances in Medicine and Health Sciences Journal.',
};

export const dynamic = 'force-dynamic';

async function getArticles() {
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      authors: {
        select: { id: true, firstName: true, lastName: true },
        orderBy: { position: 'asc' },
      },
      issue: {
        include: {
          volume: { select: { number: true, year: true } },
        },
      },
      metrics: true,
    },
  });

  const currentIssue = await prisma.issue.findFirst({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    select: { id: true },
  });

  return { articles, currentIssueId: currentIssue?.id || null };
}

export default async function ArticlesPage() {
  const { articles, currentIssueId } = await getArticles();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-navy-950">
      <section className="gradient-navy relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-navy-900/50 to-navy-800/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="max-w-3xl animate-fade-in">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-gold-500/20 text-gold-400 rounded-full text-sm font-medium mb-6">
              Peer-Reviewed Research
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
              Articles
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed">
              Browse all published articles from Advances in Medicine and Health Sciences Journal.
            </p>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 dark:from-navy-950 to-transparent" />
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-slate-500" />
              <select className="px-3 py-2 bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-800 rounded-lg text-sm text-slate-700 dark:text-slate-300">
                <option value="latest">Latest</option>
                <option value="most-viewed">Most Viewed</option>
                <option value="most-downloaded">Most Downloaded</option>
              </select>
            </div>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-navy-900 rounded-xl border border-slate-200 dark:border-navy-800">
              <h2 className="text-xl font-semibold text-navy-900 dark:text-white mb-2">
                No articles published yet
              </h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Check back soon, or submit your manuscript to be the first.
              </p>
              <a
                href="/submit"
                className="inline-flex px-6 py-3 bg-gold-400 text-navy-950 font-semibold rounded-lg hover:bg-gold-300 transition-colors"
              >
                Submit Manuscript
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
```

### Step 2: Verify

Run `npm run lint`.

Visit `http://localhost:3000/articles`.

Expected: page renders, shows published articles or empty state.

### Step 3: Commit

```bash
git add src/app/articles/page.tsx src/components/journal/ArticleCard.tsx
git commit -m "feat: add articles listing page"
```

---

## Task 4: Update Navbar for Articles Dropdown

**Files:**
- Modify: `src/components/Navbar.tsx`
- Test: visually inspect desktop and mobile menus

### Step 1: Update navItems and add articles dropdown

In `src/components/Navbar.tsx`:

1. Add state for articles dropdown:

```ts
const [articlesMenuOpen, setArticlesMenuOpen] = useState(false);
```

2. Replace the `navItems` definition with:

```ts
const navItems = [
  { href: '/', label: 'Home' },
  { href: '/editorial-board', label: 'Editorial Board' },
  { href: '/submit', label: 'Submit Manuscript' },
  { href: '/about', label: 'About' },
];

const articlesItems = [
  { href: '/articles', label: 'All Articles' },
  { href: '/articles?filter=current', label: 'Current Issue' },
  { href: '/articles?sort=latest', label: 'Latest Articles' },
];
```

3. Remove the old `Journal Archive` entry from `navItems`.

4. Insert the Articles dropdown in the desktop menu between Home and Editorial Board:

```tsx
<div
  className="relative"
  onMouseEnter={() => setArticlesMenuOpen(true)}
  onMouseLeave={() => setArticlesMenuOpen(false)}
>
  <button className="flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-navy-900 transition-colors">
    Articles
    <ChevronDown className="w-4 h-4" />
  </button>
  {articlesMenuOpen && (
    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-slide-down">
      {articlesItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="block px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-navy-900"
        >
          {item.label}
        </Link>
      ))}
    </div>
  )}
</div>
```

5. Add the Articles accordion in the mobile menu, mirroring the Editorial Board accordion.

### Step 2: Verify

Run `npm run lint`.

Check desktop hover and mobile hamburger menu.

### Step 3: Commit

```bash
git add src/components/Navbar.tsx
git commit -m "feat: add Articles dropdown to navbar"
```

---

## Task 5: Add Latest Articles Section to Home Page

**Files:**
- Modify: `src/app/page.tsx`
- Test: visit `http://localhost:3000/`

### Step 1: Add data fetch

At the top of `src/app/page.tsx`, after imports, add an async helper:

```tsx
async function getLatestArticles() {
  const articles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { not: null },
    },
    orderBy: { publishedAt: 'desc' },
    take: 6,
    include: {
      authors: {
        select: { id: true, firstName: true, lastName: true },
        orderBy: { position: 'asc' },
      },
      issue: {
        include: {
          volume: { select: { number: true, year: true } },
        },
      },
    },
  });
  return articles;
}
```

Convert `HomePage` to an async server component:

```tsx
export default async function HomePage() {
  const latestArticles = await getLatestArticles();
  // ... existing JSX
}
```

### Step 2: Insert Latest Articles section

Insert this section between the “Why Publish with AMHSJ?” section and the “Submit Your Manuscript” gradient CTA section:

```tsx
<section className="py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="text-center mb-12">
      <Badge variant="navy" className="mb-4">Latest Research</Badge>
      <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
        Latest Articles
      </h2>
      <p className="text-slate-600 max-w-2xl mx-auto">
        Recently published peer-reviewed research from AMHSJ.
      </p>
    </div>

    {latestArticles.length === 0 ? (
      <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
        <h3 className="text-xl font-semibold text-navy-900 mb-2">
          No articles published yet
        </h3>
        <p className="text-slate-600 mb-6">
          Check back soon, or submit your manuscript to be the first.
        </p>
        <Link href="/submit">
          <Button variant="gold">Submit Manuscript</Button>
        </Link>
      </div>
    ) : (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {latestArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
        <div className="text-center">
          <Link href="/articles">
            <Button variant="outline" size="lg">
              View All Articles
            </Button>
          </Link>
        </div>
      </>
    )}
  </div>
</section>
```

### Step 3: Add import

Ensure `src/app/page.tsx` imports:

```tsx
import { prisma } from '@/lib/prisma';
import { ArticleCard } from '@/components/journal/ArticleCard';
```

### Step 4: Verify

Run `npm run lint`.

Visit `http://localhost:3000/`.

Expected: Latest Articles section appears with cards or empty state.

### Step 5: Commit

```bash
git add src/app/page.tsx
git commit -m "feat: add latest articles section to home page"
```

---

## Task 6: Cross-Page Visual Consistency

**Files:**
- Modify: `src/app/about/page.tsx`
- Modify: `src/app/editorial-board/page.tsx`
- Modify: `src/app/journal/page.tsx`
- Modify: `src/app/article/[slug]/page.tsx`
- Modify: `src/components/Footer.tsx`
- Test: visit each page and compare styling

### Step 1: `/about`

- Already fixed `HeartPulse` import in Task 1.
- Replace inline badge markup with the shared `Badge` component where it improves consistency (optional; keep if it would require large refactoring).
- Verify dark-mode classes are present on every section container.

### Step 2: `/editorial-board`

- Add a loading skeleton inside `loading.tsx` or wrap the data fetch with React Suspense.
- Add an empty state when no board members are returned.
- Verify page renders after Prisma fix.

### Step 3: `/journal`

- Fix the malformed status badge in `IssueRow`. Replace the broken class string:

```tsx
<span
  className={cn(
    'inline-flex px-2 py-1 text-xs font-medium rounded-full',
    issue.isPublished
      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  )}
>
  {issue.isPublished ? 'Published' : 'Forthcoming'}
</span>
```

- Ensure the issue row uses the shared `Link` component from Next.js instead of `<a>` for internal navigation.
- Add a “Current Issue” highlight banner on the first published issue in the latest volume.

### Step 4: `/article/[slug]`

- Audit dark-mode classes; replace any hardcoded light-only colors with theme-aware classes.
- Ensure headings, badges, and sidebar cards match the card/badge components used elsewhere.

### Step 5: Footer

- Add ISSN and impact factor text if not present.
- Update footer links to include `/articles` and remove or redirect `/journal` label if it was labeled “Journal Archive”.

### Step 6: Verify

Run `npm run lint`.

Visit each public page and confirm consistent navy/gold theme, spacing, and dark mode.

### Step 7: Commit

```bash
git add src/app/about/page.tsx src/app/editorial-board/page.tsx src/app/journal/page.tsx src/app/article/\[slug\]/page.tsx src/components/Footer.tsx
git commit -m "style: align public page themes and footer"
```

---

## Task 7: Final Verification

**Files:** all modified files

### Step 1: Run lint

```bash
npm run lint
```

Expected: no errors.

### Step 2: Run typecheck

```bash
npx tsc --noEmit
```

Expected: no type errors.

### Step 3: Run dev server smoke tests

```bash
npm run dev
```

In parallel, verify in browser:
- `/` loads, Latest Articles section visible.
- `/articles` loads, article grid or empty state visible.
- Navbar Articles dropdown works on desktop and mobile.
- `/about` loads without `HeartPulse` error.
- `/editorial-board` loads without Prisma error.
- `/journal` loads, issue badges render correctly.
- `/article/[slug]` loads for any published article.

### Step 4: Commit any final fixes

If any fixes were needed, commit them with descriptive messages.

---

## Task 8: Add Prisma Page and ContactSubmission Models

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/xxxx_add_cms_pages/migration.sql` (via `prisma migrate dev`)
- Test: `npx prisma generate` succeeds

### Step 1: Add models

Append to `prisma/schema.prisma`:

```prisma
model Page {
  id              String  @id @default(cuid())
  slug            String  @unique
  title           String
  description     String?
  content         String
  metaTitle       String?
  metaDescription String?
  isPublished     Boolean @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String
  status    String   @default("NEW")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### Step 2: Run migration

```bash
npx prisma migrate dev --name add_cms_pages
npx prisma generate
```

### Step 3: Seed default pages

Create `prisma/seed.ts` or extend an existing seed script to insert default rows for `about`, `guidelines`, and `contact` if they do not exist. The `about` fallback content can be a summary of the current hard-coded page; `guidelines` and `contact` can be generic placeholder content.

### Step 4: Commit

```bash
git add prisma/schema.prisma prisma/migrations prisma/seed.ts
git commit -m "feat: add Page and ContactSubmission models"
```

---

## Task 9: Admin Dashboard Page CRUD

**Files:**
- Create: `src/app/admin/pages/page.tsx`
- Create: `src/app/admin/pages/[slug]/page.tsx`
- Create: `src/app/api/admin/pages/[slug]/route.ts`
- Create or modify: `src/app/admin/layout.tsx` if needed
- Test: visit `/admin/pages`

### Step 1: Create API routes

`src/app/api/admin/pages/[slug]/route.ts`:
- `GET`: return page by slug
- `PUT`: update page fields
- `POST`: create page if missing (optional; seeding is the primary path)

### Step 2: Create admin list page

`src/app/admin/pages/page.tsx`:
- Server-fetch all pages.
- Table with slug, title, published status, last updated.
- Link to edit page `/admin/pages/[slug]`.

### Step 3: Create admin edit page

`src/app/admin/pages/[slug]/page.tsx`:
- Client form with fields: title, description, content, metaTitle, metaDescription, isPublished.
- Save via API route.
- Show success/error toast.

### Step 4: Verify

Run `npm run lint` and visit `/admin/pages`.

### Step 5: Commit

```bash
git add src/app/admin/pages src/app/api/admin/pages
git commit -m "feat: admin dashboard CMS page management"
```

---

## Task 10: Create /guidelines Page (DB-Driven)

**Files:**
- Create: `src/app/guidelines/page.tsx`
- Test: visit `/guidelines`

### Step 1: Write page

Create a server component that fetches `prisma.page.findUnique({ where: { slug: 'guidelines' } })`. Render the page title and content. If no page exists, render fallback author-guidelines content.

Use the same navy/gold hero and container styling as `/about`.

### Step 2: Verify

Run `npm run lint` and visit `/guidelines`.

### Step 3: Commit

```bash
git add src/app/guidelines/page.tsx
git commit -m "feat: add db-driven guidelines page"
```

---

## Task 11: Update /about to Be DB-Driven

**Files:**
- Modify: `src/app/about/page.tsx`
- Test: visit `/about`

### Step 1: Fetch CMS content

At the top of the server component, fetch `prisma.page.findUnique({ where: { slug: 'about' } })`.

### Step 2: Render CMS content

Keep the existing hero shell, stats, and CTAs. Replace the long static body sections (Mission, Aims & Scope, Editorial Policies, Indexing, History) with a single CMS content block rendered as HTML inside a styled container.

If no CMS page exists, keep rendering the current full static content as a fallback.

### Step 3: Verify

Run `npm run lint` and visit `/about`.

### Step 4: Commit

```bash
git add src/app/about/page.tsx
git commit -m "feat: make about page db-driven with fallback"
```

---

## Task 12: Create /contact Page with Submission Form

**Files:**
- Create: `src/app/contact/page.tsx`
- Create: `src/app/api/contact/route.ts`
- Test: visit `/contact` and submit form

### Step 1: Create API route

`src/app/api/contact/route.ts`:
- `POST`: validate fields (name, email, subject, message), store in `ContactSubmission`, return 201.
- If SMTP env vars are present, also send email to admin.

### Step 2: Create contact page

`src/app/contact/page.tsx`:
- Fetch CMS page `slug: 'contact'` for header/content.
- Render navy/gold hero with page title/description.
- Render contact form (name, email, subject, message) with validation.
- On submit, POST to `/api/contact`, show success/error feedback.
- If no CMS page, render fallback contact content.

### Step 3: Verify

Run `npm run lint` and visit `/contact`.

### Step 4: Commit

```bash
git add src/app/contact/page.tsx src/app/api/contact/route.ts
git commit -m "feat: add db-driven contact page with submission form"
```

---

## Task 13: Final Verification

**Files:** all modified files

### Step 1: Lint and typecheck

```bash
npm run lint
npx tsc --noEmit
```

### Step 2: Smoke tests

Visit in dev server:
- `/` home page loads with Latest Articles section.
- `/articles` loads with article grid or empty state.
- Navbar Articles dropdown works; no duplicate Editorial Board item.
- `/about`, `/guidelines`, `/contact` load and render CMS content or fallback.
- `/admin/pages` loads and allows editing pages.
- Contact form submission stores data.

### Step 3: Commit any final fixes

---

## Self-Review Checklist

- [ ] Every task maps to a requirement in the design spec.
- [ ] No placeholder text (TBD, TODO, implement later) remains.
- [ ] File paths match the actual project structure.
- [ ] The `ArticleCard` component is reused on both `/articles` and the home page.
- [ ] The Prisma fix does not reintroduce `datasourceUrl`.
- [ ] All acceptance criteria from the design spec are covered by a task.
