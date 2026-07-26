/*
  Warnings:

  - You are about to drop the `Issue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `issueId` on the `Article` table. All the data in the column will be lost.
  - Added the required column `slug` to the `Article` table without a default value. This is not possible if the table is not empty.
  - Added the required column `volumeId` to the `Article` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Issue_volumeId_number_key";

-- DropIndex
DROP INDEX "Issue_volumeId_idx";

-- DropIndex
DROP INDEX "Issue_doi_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN "image" TEXT;

-- AlterTable
ALTER TABLE "Volume" ADD COLUMN "doi" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Issue";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT NOT NULL DEFAULT '',
    "sections" TEXT DEFAULT '{}',
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "volumeId" TEXT NOT NULL,
    "manuscriptId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '',
    "doi" TEXT NOT NULL,
    "doiRegistered" BOOLEAN NOT NULL DEFAULT false,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "articleNumber" TEXT,
    "articleType" TEXT NOT NULL,
    "section" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "license" TEXT NOT NULL DEFAULT 'CC BY 4.0',
    "copyrightYear" INTEGER,
    "copyrightHolder" TEXT,
    "publishedPdfUrl" TEXT,
    "publishedAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isOpenAccess" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "altmetricScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Article" ("abstract", "altmetricScore", "articleNumber", "articleType", "citations", "copyrightHolder", "copyrightYear", "createdAt", "doi", "doiRegistered", "downloads", "id", "isOpenAccess", "isPublished", "keywords", "language", "license", "manuscriptId", "pageEnd", "pageStart", "publishedAt", "section", "shortTitle", "title", "updatedAt", "views") SELECT "abstract", "altmetricScore", "articleNumber", "articleType", "citations", "copyrightHolder", "copyrightYear", "createdAt", "doi", "doiRegistered", "downloads", "id", "isOpenAccess", "isPublished", "keywords", "language", "license", "manuscriptId", "pageEnd", "pageStart", "publishedAt", "section", "shortTitle", "title", "updatedAt", "views" FROM "Article";
DROP TABLE "Article";
ALTER TABLE "new_Article" RENAME TO "Article";
CREATE UNIQUE INDEX "Article_manuscriptId_key" ON "Article"("manuscriptId");
CREATE UNIQUE INDEX "Article_slug_key" ON "Article"("slug");
CREATE UNIQUE INDEX "Article_doi_key" ON "Article"("doi");
CREATE TABLE "new_Journal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "shortName" TEXT NOT NULL,
    "issnPrint" TEXT,
    "issnOnline" TEXT,
    "doiPrefix" TEXT,
    "description" TEXT,
    "scope" TEXT,
    "aims" TEXT,
    "scopeAreas" TEXT NOT NULL DEFAULT '[]',
    "website" TEXT,
    "email" TEXT NOT NULL,
    "logo" TEXT,
    "coverImage" TEXT,
    "heroBadge" TEXT NOT NULL DEFAULT 'Now Accepting Submissions',
    "heroTitle" TEXT NOT NULL DEFAULT '',
    "heroSubtitle" TEXT NOT NULL DEFAULT '',
    "heroISSN" TEXT NOT NULL DEFAULT '',
    "heroImpactFactor" TEXT NOT NULL DEFAULT '',
    "homepageStats" TEXT NOT NULL DEFAULT '[]',
    "homepageFeatures" TEXT NOT NULL DEFAULT '[]',
    "homepageIndexers" TEXT NOT NULL DEFAULT '[]',
    "homepageCtaHeading" TEXT NOT NULL DEFAULT 'Submit Your Manuscript Today',
    "homepageCtaText" TEXT NOT NULL DEFAULT '',
    "heroCarousel" TEXT NOT NULL DEFAULT '[]',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Journal" ("aims", "coverImage", "createdAt", "description", "doiPrefix", "email", "id", "isActive", "issnOnline", "issnPrint", "logo", "name", "scope", "scopeAreas", "shortName", "updatedAt", "website") SELECT "aims", "coverImage", "createdAt", "description", "doiPrefix", "email", "id", "isActive", "issnOnline", "issnPrint", "logo", "name", "scope", "scopeAreas", "shortName", "updatedAt", "website" FROM "Journal";
DROP TABLE "Journal";
ALTER TABLE "new_Journal" RENAME TO "Journal";
CREATE UNIQUE INDEX "Journal_shortName_key" ON "Journal"("shortName");
CREATE UNIQUE INDEX "Journal_issnPrint_key" ON "Journal"("issnPrint");
CREATE UNIQUE INDEX "Journal_issnOnline_key" ON "Journal"("issnOnline");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");
