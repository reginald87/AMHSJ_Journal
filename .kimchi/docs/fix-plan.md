# AMHSJ Bug-Fix Plan

## Project Context
AMHSJ (Advances in Medicine and Health Sciences Journal) is a Next.js 16 + React 19 + TypeScript + Prisma (SQLite) academic-journal platform. The codebase has working landing/auth/submission/archive UI, but several critical bugs prevent type-checking, building, and runtime access to article pages.

## Goals
Fix the critical bugs so that:
1. `npx tsc --noEmit` passes with zero errors.
2. `npm run lint` passes with zero errors.
3. `npm run build` succeeds.
4. The `/article/[slug]` route no longer 500s due to a missing `slug` database field.
5. Registration sends a real verification email using the configured email transport.
6. `next.config.ts` stops hiding TypeScript errors.

## Out of Scope
- Implementing missing Milestone 2–5 features (editorial dashboards, peer-review workflow, PDF.js viewer, S3 uploads, ORCID OAuth, etc.).
- Converting all `<img>` tags to Next.js `<Image />`.
- Removing every unused-variable warning unless it is already an ESLint error.

---

## Chunk 1: Fix UI component syntax errors
**Files:**
- `src/components/ui/Select.tsx`
- `src/components/ui/RichTextEditor.tsx`
- `src/components/ui/ImageUpload.tsx`

**Current state:** `tsc` reports JSX syntax / parsing errors in these three files (`Select` missing closing brace, `RichTextEditor` missing `TooltipProvider` close and orphaned JSX, `ImageUpload` missing closing `}` for the upload spinner overlay).

**Work:**
1. Repair the JSX structure so each component compiles.
2. Ensure all imports used in the file are present.
3. Preserve existing behavior and styling.

**Acceptance criteria:**
- `npx tsc --noEmit` no longer reports errors from these three files.
- Components still render and function as before (select dropdown, rich-text editor toolbar, image upload preview/spinner).

**Complexity:** simple

---

## Chunk 2: Fix AdminDashboardClient.tsx syntax errors
**File:** `src/app/(dashboard)/admin/AdminDashboardClient.tsx`

**Current state:** This 1200+ line admin dashboard component has cascading JSX syntax errors (unclosed `CardContent`, missing `)` on click handlers, misplaced closing braces). `tsc` reports dozens of errors starting around lines 707, 811, 855, 925, 994, 1036, 1081, 1165, 1230.

**Work:**
1. Read the full file and identify the structural mismatches (unclosed tags, missing `)` on inline handlers like `onClick={() => handleManuscriptAction(m.id, 'view')`, extra/misplaced closing braces).
2. Repair the JSX/TypeScript syntax without changing component logic.
3. Keep all existing hooks, state, handlers, and UI intact.

**Acceptance criteria:**
- `npx tsc --noEmit` no longer reports errors from this file.
- `npm run lint` no longer reports a parsing error from this file.

**Complexity:** simple (mechanical repair of a large file; no algorithmic work)

---

## Chunk 3: Add Article.slug to Prisma schema and update article pages
**Files:**
- `prisma/schema.prisma`
- `prisma/seed.ts`
- `src/app/article/[slug]/page.tsx`
- `src/app/journal/volume/[volume]/issue/[issue]/page.tsx` (if it links to `/article/[slug]`)

**Current state:** The `Article` model has no `slug` field, but `/article/[slug]/page.tsx` queries `prisma.article.findUnique({ where: { slug } })`, which will throw a Prisma runtime error.

**Work:**
1. Add `slug String @unique` to the `Article` model in `prisma/schema.prisma`.
2. Update `prisma/seed.ts` so every seeded article includes a deterministic slug derived from its title (e.g. kebab-case of title plus a short hash/disambiguator if needed).
3. Regenerate the Prisma client (`npx prisma generate`).
4. Reset/migrate the dev database so the new column exists and seeded articles have slugs (`npx prisma migrate dev --name add_article_slug && npx prisma db seed`).
5. Ensure `src/app/article/[slug]/page.tsx` handles a missing article with `notFound()` and does not rely on fields that do not exist.

**Acceptance criteria:**
- `npx prisma validate` passes.
- `npx prisma migrate dev` applies cleanly.
- `npx prisma db seed` creates articles with non-null unique slugs.
- `/article/[slug]` resolves an article by slug and returns 404 when no article matches.

**Complexity:** simple

---

## Chunk 4: Fix register route verification-token and email sending
**File:** `src/app/api/auth/register/route.ts`

**Current state:**
- Imports `{ v4 as uuidv4 } from 'uuid'`, but `uuid` is not declared in `package.json`.
- Defines its own stub `sendVerificationEmail` that only logs to the console instead of sending email.
- The project already has `src/lib/email.ts` with `sendEmail` and `getVerificationEmailTemplate` helpers.

**Work:**
1. Replace the `uuid` import with Node.js built-in `crypto.randomUUID()`.
2. Import `sendEmail` and `getVerificationEmailTemplate` from `@/lib/email`.
3. Replace the local stub with a call that builds the verification URL (`${process.env.NEXTAUTH_URL}/verify-email/${token}`) and sends the email.
4. Keep error handling and existing response structure unchanged.

**Acceptance criteria:**
- `npx tsc --noEmit` and `npm run lint` pass for this file.
- Registration no longer depends on the missing `uuid` package.
- A successful registration attempt invokes `sendEmail` with the verification template.

**Complexity:** simple

---

## Chunk 5: Clean up remaining lint/type errors and remove build-error suppression
**Files:**
- `next.config.ts`
- `src/app/about/page.tsx`
- `src/app/editorial-board/page.tsx`
- `src/app/api/admin/manuscripts/route.ts`
- `src/app/api/admin/users/route.ts`
- `prisma/seed.ts`

**Current state:**
- `next.config.ts` sets `typescript.ignoreBuildErrors: true`, hiding all TypeScript errors.
- `src/app/about/page.tsx` references `HeartPulse` without importing it.
- `src/app/editorial-board/page.tsx` and the two admin API routes use explicit `any`.
- `prisma/seed.ts` has explicit `any` and unused variables.

**Work:**
1. Remove `typescript.ignoreBuildErrors: true` from `next.config.ts`.
2. Import `HeartPulse` from `lucide-react` in `src/app/about/page.tsx`.
3. Replace explicit `any` types with proper Prisma/TypeScript types or narrow unknown values.
4. Remove or use the unused variables in `prisma/seed.ts`.
5. Re-run `npx tsc --noEmit` and `npm run lint` and fix any remaining errors in the project.

**Acceptance criteria:**
- `npx tsc --noEmit` returns zero errors.
- `npm run lint` returns zero errors.
- `npm run build` completes successfully.

**Complexity:** simple

---

## Verification
After all chunks are complete:
1. `npx tsc --noEmit`
2. `npm run lint`
3. `npm run build`

All three commands must pass.

---

## Execution Order
- Chunks 1, 2, 3, and 4 are independent and can run in parallel (max 3 concurrent agents).
- Chunk 5 depends on chunks 1–4 and must run last.
- Run final verification after chunk 5.
