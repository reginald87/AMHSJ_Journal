# AMHSJ Journal Identity & Public Pages Design

## Goal

Make the AMHSJ public site feel like a single, cohesive international medical journal by fixing current runtime errors, introducing an Articles menu, adding a Latest Articles section to the home page, and aligning the visual design across all public pages.

## Scope

This design covers public pages, shared layout components, and a lightweight admin CMS for managing `/about`, `/guidelines`, and `/contact` content. Authentication and manuscript workflow dashboards are unchanged.

## Context

- Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4.
- Prisma 7 with `@prisma/adapter-better-sqlite3` and `better-sqlite3`.
- Existing pages: `/`, `/journal`, `/article/[slug]`, `/editorial-board`, `/about`.
- New page: `/articles` (article listing).
- Existing components: `Navbar`, `Footer`, UI primitives in `src/components/ui/`.

## Design

### 1. Bug Fixes

#### 1.1 Prisma Adapter Constructor Error

**Problem:** `src/lib/prisma.ts` throws `Unknown property datasourceUrl provided to PrismaClient constructor` when `prisma` is imported in server components such as `/editorial-board/page.tsx`. In Prisma 7, connection URLs move out of the client constructor and are supplied through the driver adapter. Any leftover `datasourceUrl`/`datasources` option is rejected.

**Fix:**
- Ensure `src/lib/prisma.ts` only passes `{ adapter }` to `new PrismaClient`.
- Keep the `PrismaBetterSqlite3` adapter configured with the SQLite URL.
- Verify that no other file is passing `datasourceUrl` or `datasources` to `PrismaClient`.
- If the generated client import path differs from `@prisma/client` (e.g., a custom `output` in `schema.prisma`), update the import to match the generated location.

Example target state for `src/lib/prisma.ts`:

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

If the adapter still rejects the URL at runtime, switch to passing a `Database` instance from `better-sqlite3` directly.

#### 1.2 About Page Missing `HeartPulse` Import

**Problem:** `src/app/about/page.tsx` references `<HeartPulse />` at line 197 but `HeartPulse` is not imported from `lucide-react`.

**Fix:** Add `HeartPulse` to the existing `lucide-react` import.

### 2. Articles Listing Page

Create a new public route at `/articles` that lists published articles directly. The existing `/journal` route remains a volume/issue archive.

**Route:** `src/app/articles/page.tsx`

**Data fetch:**
- Query `prisma.article.findMany` where `status: 'PUBLISHED'` and `publishedAt` is not null.
- Order by `publishedAt desc` by default.
- Include `authors`, `issue` (with `volume`), `metrics`.

**UI:**
- Hero with title “Articles” and short description.
- Search input (client-side filter on title/keywords for now).
- Sort control: Latest / Most Viewed / Most Downloaded.
- Filter pills: All / Current Issue (most recently published issue).
- Article cards identical in structure to the home-page Latest Articles cards.
- Pagination or “Load more” if more than 12 articles; for the initial build, show all with a simple grid.
- Empty state matching the home page empty state.

### 3. Navigation — Articles Menu

Replace the top-level “Journal Archive” link in `src/components/Navbar.tsx` with an “Articles” dropdown.

**Desktop behavior:**
- Hover reveals dropdown.
- Items:
  - All Articles → `/articles`
  - Current Issue → `/articles?filter=current`
  - Latest Articles → `/articles?sort=latest`

**Mobile behavior:**
- Tapping “Articles” expands an accordion list with the same items.

**Implementation notes:**
- Reuse existing dropdown markup and animation classes.
- Keep the existing Editorial Board dropdown unchanged.
- Update `navItems` array; remove separate `Journal Archive` entry.

### 4. Home Page — Latest Articles Section

Insert a new section on `/` between “Why Publish with AMHSJ?” and the “Submit Your Manuscript” CTA.

**Server data fetch:**
- Query `prisma.article.findMany` where `status: 'PUBLISHED'` and `publishedAt` is not null.
- Order by `publishedAt desc`.
- Limit to 6 articles.
- Include: `authors`, `issue` (with `volume`).

**Card content:**
- Article type badge (e.g., `ORIGINAL_RESEARCH` → “Original Research”).
- Title, max 2 lines.
- Authors: first 3 names + “et al.” if more.
- Metadata: `Volume X, Issue Y • Month Year`.
- Link: `/article/[slug]`.

**Empty state:**
- Heading: “No articles published yet”
- Body: “Check back soon, or submit your manuscript to be the first.”
- CTA button: “Submit Manuscript” → `/submit`

**Responsive grid:**
- Mobile: 1 column
- Tablet (`md`): 2 columns
- Desktop (`lg`): 3 columns

### 5. Cross-Page Visual Consistency

Align the following public pages with the navy/gold theme already established on the home page.

#### 5.1 `/about`
- Fix `HeartPulse` import.
- Ensure all section badges use the same gold badge style as the home page hero.
- Verify dark-mode classes are complete and consistent.
- Keep existing content.

#### 5.2 `/editorial-board`
- Keep DB-driven editorial board content.
- Add a graceful loading skeleton and an empty state if no board members exist.
- Ensure the page still renders after the Prisma fix.

#### 5.3 `/journal`
- Fix the malformed status-badge class string on issue rows (currently contains literal template braces).
- Align volume/issue card styling with the card component used on the home page.
- Add a subtle “Current Issue” highlight banner on the most recently published issue.

#### 5.4 `/article/[slug]`
- Standardize dark-mode colors.
- Tighten typography hierarchy so it matches the rest of the public site.
- No functional changes.

#### 5.5 Footer
- Add journal ISSN snippet and impact factor if not already present.
- Ensure links match the new Articles menu labels.

### 6. CMS Pages (About / Guidelines / Contact)

Add database-backed CMS pages so admins can manage `/about`, `/guidelines`, and `/contact` content from the dashboard.

#### 6.1 Database Model

Add a `Page` model to `prisma/schema.prisma`:

```prisma
model Page {
  id          String   @id @default(cuid())
  slug        String   @unique // about | guidelines | contact
  title       String
  description String?
  content     String   // rich text / HTML content
  metaTitle   String?
  metaDescription String?
  isPublished Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  subject   String
  message   String
  status    String   @default("NEW") // NEW | IN_PROGRESS | RESOLVED
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

Run `prisma migrate dev` to create the migration.

#### 6.2 Admin Dashboard — Page Management

Create pages under the existing admin dashboard at `/admin/pages`:
- List pages with slug, title, published status.
- Edit page: title, description, content (textarea for now), meta title, meta description, published toggle.
- Seed default content for `about`, `guidelines`, and `contact` if rows do not exist.

#### 6.3 Public Pages — DB-Driven

Update `/about/page.tsx` to fetch `prisma.page.findUnique({ where: { slug: 'about' } })` and render `page.content` as HTML in a styled container. Keep the existing visual shell; replace only the body content with the CMS content.

Create `/guidelines/page.tsx` using the same pattern, slug `guidelines`.

Create `/contact/page.tsx`:
- Fetch `page` with slug `contact` for the header/content.
- Render a contact form (name, email, subject, message).
- On submit, POST to `/api/contact`.
- API route stores submission in `ContactSubmission` and optionally emails admin if SMTP is configured.

#### 6.4 Seeding / Fallbacks

If a CMS page is missing, the public route should still render a sensible fallback so the site never 404s:
- `/about`: fallback to the current hard-coded content.
- `/guidelines`: fallback to generic author guidelines content.
- `/contact`: fallback to a basic contact form with journal email.

## Non-Goals

- Working citation export implementation (buttons may remain UI-only).
- Backend search; article filtering on `/articles` is client-side only for this iteration.
- Rich-text editor for CMS content in this iteration (plain text / HTML textarea is fine).

## Acceptance Criteria

- [ ] `npm run dev` starts without the Prisma constructor error on `/editorial-board`.
- [ ] `/about` loads without the `HeartPulse is not defined` error.
- [ ] Navbar shows “Articles” dropdown with All Articles, Current Issue, Latest Articles on desktop and mobile.
- [ ] Home page displays up to 6 latest published articles with title, authors, issue metadata, and read link.
- [ ] Home page shows a friendly empty state when no articles are published.
- [ ] `/articles`, `/journal`, `/article/[slug]`, `/about`, and `/editorial-board` share consistent navy/gold styling, spacing, and dark-mode behavior.
- [ ] `/articles` page renders a filterable, sortable list of published articles.
- [ ] `/about`, `/guidelines`, and `/contact` render content from the `Page` model.
- [ ] Admin dashboard at `/admin/pages` allows editing CMS pages.
- [ ] Contact form submissions are stored in `ContactSubmission`.
- [ ] `npm run lint` passes with no new errors.

## Out of Scope

- Authentication flow changes.
- Manuscript submission workflow changes.
- Rich-text editor for CMS content (plain text/HTML textarea only).
- Email sending for contact submissions if SMTP is not configured.
