# AMHSJ — Annals of Medical & Health Sciences Journal

Academic journal management system built with Next.js 16, Prisma (SQLite), and NextAuth.js.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite via Prisma
- **Auth**: NextAuth.js (Credentials)
- **Email**: Nodemailer (SMTP)
- **UI**: Tailwind CSS 4, custom components
- **File storage**: Local filesystem (`uploads/`)

## Local Development

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your values

# Push schema to SQLite
npx prisma db push

# Seed data (optional)
npx tsx prisma/seed.ts

# Create admin account
npx tsx prisma/create-admin.ts

# Start development server
npm run dev
```

## Deployment (cPanel — Node.js Selector)

### 1. Clone repository

In cPanel **Terminal** or via **Git Version Control**:

```bash
cd ~/repositories  # or wherever you keep apps
git clone https://github.com/reginald87/AMHSJ_Journal.git
cd AMHSJ_Journal
```

### 2. Set up Node.js app

In cPanel **Node.js Selector**:

| Setting | Value |
|---|---|
| Application mode | `Production` |
| Application root | path to `AMHSJ_Journal` |
| Application URL | your domain |
| Application startup file | `server.js` (see below) |
| Pass startup arguments | leave blank |

### 3. Environment variables

In the Node.js app settings, add:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | `file:./prod.db` |
| `NEXTAUTH_SECRET` | a random 64-character string |
| `NEXTAUTH_URL` | `https://yourdomain.com` |
| `ADMIN_EMAIL` | your email |
| `ADMIN_PASSWORD` | a strong password |
| `EMAIL_SERVER_HOST` | your SMTP host |
| `EMAIL_SERVER_PORT` | `587` |
| `EMAIL_SERVER_USER` | SMTP username |
| `EMAIL_SERVER_PASSWORD` | SMTP password |
| `EMAIL_FROM` | `noreply@yourdomain.com` |

### 4. Install & build

In Terminal or via the Node.js app's **Run npm** button:

```bash
npm install
npx prisma db push
npm run build
```

### 5. Create admin account

```bash
npx tsx prisma/create-admin.ts
```

### 6. Set file permissions

Ensure the following directories are writable by the web server:

```bash
chmod 755 uploads
# The SQLite DB file will be created inside the project root
```

### 7. Create startup file

If your cPanel requires a `.js` startup file, create `server.js` in the project root:

```js
const { spawn } = require('child_process');
const next = spawn('npx', ['next', 'start', '-p', process.env.PORT || 3000], {
  stdio: 'inherit',
  shell: true,
});
process.on('SIGTERM', () => next.kill());
```

Then set **Application startup file** to `server.js`.

### 8. Restart app

Use the **Restart** button in the Node.js Selector.

## Folder structure

```
├── prisma/            # Schema, migrations, seeds
├── public/            # Static assets
├── uploads/           # User-uploaded files (manuscripts, images)
├── src/
│   ├── app/           # Next.js App Router pages & API routes
│   ├── components/    # Shared UI components
│   └── lib/           # Utilities, auth, email, logger
└── package.json
```
