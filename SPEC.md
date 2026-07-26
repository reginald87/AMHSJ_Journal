# Advances in Medicine and Health Sciences Journal (AMHSJ)
## Complete Platform Specification

---

## 1. Project Overview

**Product Name:** Advances in Medicine and Health Sciences Journal (AMHSJ)  
**Type:** International Peer-Reviewed Academic Journal Platform  
**Target Users:** Authors, Reviewers, Editors, Editorial Board, Administrators, Readers  
**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Prisma ORM, SQLite (dev) / PostgreSQL (prod), NextAuth v4, Tailwind CSS v4, Nodemailer  

---

## 2. Brand Identity & Design System

### 2.1 Color Palette (Deep Blue SaaS Theme)

```css
/* Primary - Deep Navy */
--navy-50:  #f0f4f8;
--navy-100: #d9e2ec;
--navy-200: #bcccdc;
--navy-300: #9fb3c8;
--navy-400: #829ab1;
--navy-500: #627d98;
--navy-600: #486581;
--navy-700: #334e68;
--navy-800: #243b53;
--navy-900: #102a43;        /* Primary brand color */
--navy-950: #0c1e2e;        /* Darkest - headers, footers */

/* Accent - Academic Gold */
--gold-50:  #fffbeb;
--gold-100: #fef3c7;
--gold-200: #fde68a;
--gold-300: #fcd34d;
--gold-400: #fbbf24;        /* Primary accent */
--gold-500: #f59e0b;
--gold-600: #d97706;
--gold-700: #b45309;
--gold-800: #92400e;
--gold-900: #78350f;

/* Semantic Colors */
--success-500: #10b981;
--warning-500: #f59e0b;
--danger-500:  #ef4444;
--info-500:    #3b82f6;

/* Neutral */
--slate-50:  #f8fafc;
--slate-100: #f1f5f9;
--slate-200: #e2e8f0;
--slate-300: #cbd5e1;
--slate-400: #94a3b8;
--slate-500: #64748b;
--slate-600: #475569;
--slate-700: #334155;
--slate-800: #1e293b;
--slate-900: #0f172a;
--slate-950: #020617;
```

### 2.2 Typography

- **Font Family:** Inter (system fallback)
- **Headings:** Inter 600-700, tight tracking
- **Body:** Inter 400, relaxed leading
- **Code:** JetBrains Mono

### 2.3 Spacing & Layout

- **Base Unit:** 4px (0.25rem)
- **Container Max Width:** 1280px (max-w-7xl)
- **Header Height:** 64px (h-16)
- **Sidebar Width:** 280px (w-72) collapsed: 72px (w-18)

### 2.4 Component Library (shadcn-inspired)

- Button (primary, secondary, outline, ghost, destructive, gold-accent)
- Card (elevated, outlined, interactive)
- Input, Textarea, Select, Checkbox, Radio, Switch
- Badge (status variants: submitted, under-review, accepted, rejected, published)
- Table (sortable, paginated, selectable rows)
- Modal/Dialog, Drawer, Popover, Tooltip
- Tabs, Accordion, Breadcrumb, Pagination
- DataTable (server-side sorting, filtering, pagination)
- FileUpload (drag-drop, progress, validation)
- RichTextEditor (TipTap) for manuscript content
- Avatar, DropdownMenu, NavigationMenu
- Chart components (Recharts) for analytics

---

## 3. Information Architecture

### 3.1 Public Routes (Unauthenticated)

```
/                           → Landing Page
/journal                    → Journal Archive (Volumes list)
/journal/volume/[volume]    → Volume Detail (Issues list)
/journal/volume/[volume]/issue/[issue] → Issue Detail (Articles list)
/article/[slug]             → Article Detail Page
/editorial-board            → Editorial Board
/about                      → About Journal (Aims, Scope, History, Indexing)
/guidelines                 → Author Guidelines
/ethics                     → Publication Ethics
/reviewers                  → Reviewer Guidelines
/announcements              → Announcements
/contact                    → Contact Form
/login                      → Sign In
/register                   → Register (Author/Reviewer)
/verify-email/[token]       → Email Verification
/forgot-password            → Password Reset Request
/reset-password/[token]     → Password Reset Form
```

### 3.2 Protected Routes - Author Dashboard

```
/dashboard                  → Author Dashboard Overview
/dashboard/manuscripts      → My Manuscripts (table with status)
/dashboard/manuscripts/new  → New Submission Wizard (multi-step)
/dashboard/manuscripts/[id] → Manuscript Detail & Tracking
/dashboard/manuscripts/[id]/edit → Revise Manuscript
/dashboard/profile          → Profile Settings
/dashboard/notifications    → Notifications Center
```

### 3.3 Protected Routes - Reviewer Dashboard

```
/dashboard/review           → Reviewer Dashboard
/dashboard/review/assigned  → Assigned Reviews
/dashboard/review/history   → Review History
/dashboard/review/[id]      → Review Form
```

### 3.4 Protected Routes - Editor Dashboard

```
/dashboard/editorial        → Editorial Dashboard (overview stats)
/dashboard/editorial/manuscripts → All Manuscripts (advanced filters)
/dashboard/editorial/manuscripts/[id] → Manuscript Editorial View
/dashboard/editorial/reviewers → Reviewer Management
/dashboard/editorial/reviewers/invite → Invite Reviewer
/dashboard/editorial/decisions → Decision Queue
/dashboard/editorial/volumes → Volume & Issue Management
/dashboard/editorial/volumes/new → Create Volume
/dashboard/editorial/volumes/[id]/issues/new → Create Issue
/dashboard/editorial/board  → Editorial Board Management
/dashboard/editorial/settings → Journal Settings
```

### 3.5 Protected Routes - Admin Dashboard

```
/admin                      → Admin Overview
/admin/users                → User Management (roles, status)
/admin/users/[id]           → User Detail & Impersonate
/admin/journals             → Journal Settings
/admin/volumes              → Volume/Issue Management
/admin/analytics            → Platform Analytics
/admin/settings             → System Settings
/admin/audit-logs           → Audit Logs
```

---

## 4. User Roles & Permissions

| Feature | Author | Reviewer | Assoc. Editor | Deputy Editor | Editor-in-Chief | Admin |
|---------|--------|----------|---------------|---------------|-----------------|-------|
| Submit Manuscript | ✅ | | | | | |
| View Own Manuscripts | ✅ | | ✅ | ✅ | ✅ | ✅ |
| View All Manuscripts | | | ✅ | ✅ | ✅ | ✅ |
| Assign Reviewers | | | ✅ | ✅ | ✅ | ✅ |
| Write Reviews | | ✅ | ✅ | ✅ | ✅ | |
| Make Decisions | | | ✅* | ✅ | ✅ | ✅ |
| Manage Volumes/Issues | | | | ✅ | ✅ | ✅ |
| Manage Editorial Board | | | | | ✅ | ✅ |
| Journal Settings | | | | | ✅ | ✅ |
| User Management | | | | | | ✅ |
| System Analytics | | | | | ✅ | ✅ |

*Associate Editors can make decisions on assigned manuscripts only

---

## 5. Core Features by Milestone

### Milestone 1: Theme, Branding & Landing Page

**Components:**
- Deep blue SaaS theme with gold accent
- Responsive Navbar with role-based menus
- Footer with journal links, social, legal
- Landing page sections:
  - Hero: Journal title, tagline, impact factor, CTAs (Submit, Browse, Register)
  - Key Metrics: Articles, Editors, Countries, Impact Factor
  - Current Issue Cover + TOC preview
  - Aims & Scope cards
  - Editorial Board highlights
  - Indexing badges (Scopus, PubMed, DOAJ, etc.)
  - Latest Articles carousel
  - Call to Action bar
- Cookie consent banner
- Accessibility: WCAG 2.1 AA

### Milestone 2: Journal Archive & Article Browsing

**Journal Archive (`/journal`):**
- Volume grid (cards with year, volume, issue count, cover)
- Filter by year, search volumes
- Pagination

**Volume Detail (`/journal/volume/[volume]`):**
- Volume cover, description, year
- Issue list with status badges (Published, In Progress, Forthcoming)
- "View All Articles" link

**Issue Detail (`/journal/volume/[volume]/issue/[issue]`):**
- Issue cover, title, publication date, DOI
- Table of Contents grouped by section (Original Research, Review, Case Report, etc.)
- Article cards: title, authors, DOI, PDF link, abstract preview
- "Export Citations" (RIS, BibTeX)

**Article Detail (`/article/[slug]`):**
- Full metadata: title, authors with affiliations/ORCID, corresponding author
- DOI, received/accepted/published dates, citation format
- Abstract with structured sections
- Keywords (clickable tags)
- Full-text HTML with semantic structure
- PDF viewer (PDF.js) with download
- Supplementary materials
- References with Crossref links
- Citation export (RIS, BibTeX, EndNote)
- Share buttons (Twitter, LinkedIn, Email, Copy Link)
- Metrics: Views, Downloads, Citations, Altmetric
- Related Articles sidebar

### Milestone 3: Author Portal & Manuscript Submission

**Registration & Verification:**
- Multi-step registration: Account → Profile → Role Selection
- Email verification with secure token (24hr expiry)
- Password strength meter, show/hide toggle
- ORCID OAuth integration (optional)

**Submission Wizard (Multi-step):**
1. **Manuscript Details:** Title, short title, article type, section, keywords, abstract
2. **Authors:** Corresponding author (pre-filled), co-authors (add/remove, reorder), ORCID, affiliations, contributions
3. **Files:** Drag-drop upload (manuscript PDF, source files, figures, supplementary), validation (size, type)
4. **Declarations:** Cover letter, competing interests, funding, ethics approval, data availability, author contributions
5. **Review & Submit:** Summary, confirm declarations, submit

**Manuscript Dashboard:**
- Table: Manuscript ID, Title, Status (badge), Submitted, Last Action, Days in Status
- Actions: View, Withdraw, Revise (if applicable), Download files
- Status timeline visualization
- Notifications for status changes

### Milestone 4: Editorial & Admin Dashboard (SaaS-style)

**Layout:**
- Collapsible sidebar navigation (role-based)
- Top bar: search, notifications, user menu, theme toggle
- Main content area with breadcrumbs
- Responsive: drawer on mobile, sidebar on desktop

**Editorial Dashboard (`/dashboard/editorial`):**
- Stats cards: Submitted, Under Review, Decisions Pending, Accepted, Published
- Charts: Submission trend, Review time, Acceptance rate
- Quick actions: New manuscripts, Overdue reviews, Pending decisions
- Recent activity feed

**Manuscript Management:**
- Advanced DataTable: filter by status, article type, date range, editor, reviewer
- Bulk actions: Assign editor, Invite reviewers, Send reminders
- Row click → Editorial View (split pane: manuscript details | actions)

**Editorial View (`/dashboard/editorial/manuscripts/[id]`):**
- Left panel: Manuscript info, authors, files, status timeline
- Right panel: 
  - Assign/Change Editor
  - Invite Reviewers (search, filter by expertise, workload)
  - View Reviews (blinded/unblinded based on policy)
  - Editorial Notes (private)
  - Make Decision: Accept / Minor Revision / Major Revision / Reject
  - Decision letter editor (template-based)

**Reviewer Management:**
- Reviewer database with expertise tags, review history, performance metrics
- Invite workflow: Select → Customize email → Send → Track response
- Automated reminders (7 days, 1 day before due)
- Reviewer recognition: certificates, Publons integration

**Volume & Issue Management:**
- Create Volume: number, year, title, description, cover
- Create Issue: number, title, description, cover, target date, DOI prefix
- Assign articles to issues (drag-drop)
- Publish workflow: Preview → Schedule → Publish → DOI registration

### Milestone 5: Peer Review Workflow

**Reviewer Invitation:**
- Editor invites → Email with unique token link
- Reviewer accepts/declines → Auto-assign or re-invite
- Due date calculation (configurable, default 21 days)

**Review Form:**
- Structured scores: Originality, Methodology, Significance, Clarity (1-5)
- Confidential comments to editor
- Comments to author (required)
- Recommendation: Accept / Minor Revision / Major Revision / Reject
- Save draft, submit

**Editorial Decision:**
- View all reviews side-by-side
- Add editorial assessment
- Select decision
- Generate decision letter (template with review summaries)
- Notify authors with reviews (blinded per policy)

**Revision Cycle:**
- Author submits revision → New version created
- Editor sends to same/new reviewers
- Track changes: response to reviewers document

---

## 6. Database Schema (Prisma)

*See `prisma/schema.prisma` - already comprehensive. Key models:*

- **User** (roles: AUTHOR, REVIEWER, EDITOR, ADMIN, EDITOR_IN_CHIEF, DEPUTY_EDITOR, ASSOCIATE_EDITOR)
- **Journal** (settings, volumes, editorial board)
- **Volume** → **Issue** → **Article**
- **Manuscript** (submission workflow, versions, files, authors)
- **Review** (rounds, scores, decisions, blinded comments)
- **ReviewInvitation** (token-based, status tracking)
- **EditorialDecision** (decision, letters)
- **EditorialNote** (private notes)
- **Notification** (real-time + email)
- **EmailVerification**, **PasswordReset**, **Session**

---

## 7. Email System (Nodemailer)

**Templates (React Email / MJML):**
- Email verification
- Welcome (role-specific)
- Manuscript submitted confirmation
- Reviewer invitation (accept/decline links)
- Review reminder (7 days, 1 day)
- Review submitted confirmation
- Editorial decision (with letter)
- Revision requested
- Manuscript accepted
- Proof ready
- Published notification
- Password reset
- Notification digest

**Configuration:** SMTP via environment variables

---

## 8. Authentication & Security

- **NextAuth v4** with credentials + email verification
- **Password:** bcryptjs (12 rounds)
- **Session:** JWT in httpOnly cookie + database sessions
- **Email Verification:** Required for AUTHOR, REVIEWER roles; token expires 24h
- **Password Reset:** Token expires 1h
- **Rate Limiting:** API routes (login, register, submit)
- **CSRF:** NextAuth built-in
- **Role-based Access Control:** Middleware + server checks

---

## 9. File Uploads

- **Provider:** Local (dev) / S3-compatible (prod)
- **Types:** PDF, DOCX, TEX, JPG, PNG, TIFF, ZIP
- **Max Size:** 50MB (configurable)
- **Validation:** MIME type, extension, virus scan (prod)
- **Storage Structure:** `/uploads/{journalId}/manuscripts/{manuscriptId}/v{version}/`

---

## 10. Search & Discovery

- **Full-text Search:** Meilisearch (prod) / SQLite FTS (dev)
- **Filters:** Article type, year, volume, issue, author, keyword
- **Sort:** Relevance, Date (newest/oldest), Most Viewed, Most Cited
- **Facets:** Article type, Year, Section, Authors

---

## 11. Analytics & Metrics

- **Article Metrics:** Views, Downloads, Citations (Crossref), Altmetric
- **Journal Metrics:** Submissions, Acceptance rate, Time to first decision, Time to publication
- **Reviewer Metrics:** Reviews completed, Average time, Quality score
- **Dashboard:** Recharts visualizations

---

## 12. Accessibility & Internationalization

- **WCAG 2.1 AA** compliant
- **RTL support** for Arabic/Hebrew (future)
- **i18n:** English (default), Spanish, Chinese (future)
- **Semantic HTML**, ARIA labels, focus management
- **Keyboard navigation** throughout

---

## 13. Performance Targets

- **LCP:** < 2.5s
- **FID:** < 100ms
- **CLS:** < 0.1
- **Bundle Size:** < 200KB initial JS
- **ISR:** 60s for journal pages, 300s for articles

---

## 14. Deployment & DevOps

- **Platform:** Vercel (Next.js) + Railway/Neon (PostgreSQL) + Redis (Upstash)
- **CI/CD:** GitHub Actions (lint, typecheck, test, build)
- **Monitoring:** Sentry, Vercel Analytics
- **Backups:** Daily DB snapshots

---

## 15. File Structure (App Router)

```
src/
├── app/
│   ├── (public)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Landing
│   │   ├── journal/
│   │   │   ├── page.tsx                # Archive
│   │   │   └── volume/[volume]/
│   │   │       ├── page.tsx            # Volume detail
│   │   │       └── issue/[issue]/
│   │   │           └── page.tsx        # Issue detail
│   │   ├── article/[slug]/page.tsx     # Article detail
│   │   ├── editorial-board/page.tsx
│   │   ├── about/page.tsx
│   │   ├── guidelines/page.tsx
│   │   ├── ethics/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── verify-email/[token]/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/[token]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx                  # Dashboard layout with sidebar
│   │   ├── dashboard/
│   │   │   ├── page.tsx                # Author dashboard
│   │   │   ├── manuscripts/
│   │   │   │   ├── page.tsx            # List
│   │   │   │   ├── new/page.tsx        # Submission wizard
│   │   │   │   └── [id]/page.tsx       # Detail
│   │   │   ├── profile/page.tsx
│   │   │   └── notifications/page.tsx
│   │   ├── review/
│   │   │   ├── page.tsx                # Reviewer dashboard
│   │   │   ├── assigned/page.tsx
│   │   │   ├── history/page.tsx
│   │   │   └── [id]/page.tsx           # Review form
│   │   └── editorial/
│   │       ├── page.tsx                # Editorial dashboard
│   │       ├── manuscripts/
│   │       │   ├── page.tsx            # All manuscripts table
│   │       │   └── [id]/page.tsx       # Editorial view
│   │       ├── reviewers/
│   │       │   ├── page.tsx
│   │       │   └── invite/page.tsx
│   │       ├── decisions/page.tsx
│   │       ├── volumes/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/
│   │       │       └── issues/new/page.tsx
│   │       ├── board/page.tsx
│   │       └── settings/page.tsx
│   └── admin/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── users/
│       ├── journals/
│       ├── volumes/
│       ├── analytics/
│       └── settings/
├── components/
│   ├── ui/                             # Base components
│   ├── forms/                          # Form components
│   ├── dashboard/                      # Dashboard-specific
│   ├── editorial/                      # Editorial workflow
│   ├── journal/                        # Journal archive
│   ├── article/                        # Article components
│   ├── submission/                     # Submission wizard
│   └── layout/                         # Navbar, Sidebar, Footer
├── lib/
│   ├── auth.ts                         # NextAuth config
│   ├── prisma.ts
│   ├── email.ts                        # Email templates
│   ├── utils.ts
│   ├── auth-utils.ts
│   ├── validations/                    # Zod schemas
│   └── constants/
├── hooks/
├── types/
└── styles/
```

---

## 16. Acceptance Criteria

### Milestone 1 Complete When:
- [ ] Deep blue theme applied globally
- [ ] Landing page loads < 2s with all sections
- [ ] Navbar responsive, role-aware menus work
- [ ] Footer with all links functional
- [ ] Theme toggle (light/dark) persists
- [ ] Accessibility audit passes

### Milestone 2 Complete When:
- [ ] `/journal` shows volumes with covers
- [ ] Volume → Issue → Article navigation works
- [ ] Article page displays full metadata, PDF viewer
- [ ] Search/filter on archive works
- [ ] Citation export generates valid RIS/BibTeX

### Milestone 3 Complete When:
- [ ] Author registers, verifies email, logs in
- [ ] Submission wizard completes all 5 steps
- [ ] File upload validates and stores files
- [ ] Manuscript appears in dashboard with correct status
- [ ] Status timeline updates in real-time

### Milestone 4 Complete When:
- [ ] Editorial dashboard shows stats + charts
- [ ] Manuscript table filters, sorts, paginates
- [ ] Editor can assign reviewers, view reviews
- [ ] Editor can make decisions with letter templates
- [ ] Volumes/issues created, articles assigned, published

### Milestone 5 Complete When:
- [ ] Reviewer receives email with accept/decline links
- [ ] Review form submits scores + comments
- [ ] Editor sees reviews, makes decision
- [ ] Author notified with decision letter
- [ ] Revision workflow creates new version

---

## 17. Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite dev
# DATABASE_URL="postgresql://user:pass@host:5432/amhsj"  # Prod

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email (SMTP)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="noreply@amhsj.org"
SMTP_PASS="app-password"
EMAIL_FROM="AMHSJ <noreply@amhsj.org>"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=52428800

# Optional: ORCID
ORCID_CLIENT_ID=""
ORCID_CLIENT_SECRET=""
ORCID_REDIRECT_URI=""

# Optional: S3
S3_ENDPOINT=""
S3_ACCESS_KEY=""
S3_SECRET_KEY=""
S3_BUCKET=""
S3_REGION=""

# Optional: Meilisearch
MEILISEARCH_HOST=""
MEILISEARCH_API_KEY=""
```

---

*End of Specification*