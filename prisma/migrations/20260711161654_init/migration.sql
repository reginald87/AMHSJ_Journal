-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "affiliation" TEXT,
    "department" TEXT,
    "orcid" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'AUTHOR',
    "status" TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "emailVerified" DATETIME,
    "emailVerifiedAt" DATETIME,
    "lastLoginAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Journal" (
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
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "JournalSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalId" TEXT NOT NULL,
    "submissionOpen" BOOLEAN NOT NULL DEFAULT true,
    "allowMultipleSubmission" BOOLEAN NOT NULL DEFAULT false,
    "requireCoverLetter" BOOLEAN NOT NULL DEFAULT true,
    "requireEthicsApproval" BOOLEAN NOT NULL DEFAULT true,
    "requireFundingStmt" BOOLEAN NOT NULL DEFAULT true,
    "requireDataAvailability" BOOLEAN NOT NULL DEFAULT true,
    "maxAuthors" INTEGER NOT NULL DEFAULT 10,
    "maxFileSizeMB" INTEGER NOT NULL DEFAULT 50,
    "allowedFileTypes" TEXT NOT NULL DEFAULT '',
    "reviewType" TEXT NOT NULL DEFAULT 'DOUBLE_BLIND',
    "reviewDeadlineDays" INTEGER NOT NULL DEFAULT 21,
    "maxReviewers" INTEGER NOT NULL DEFAULT 3,
    "minReviewers" INTEGER NOT NULL DEFAULT 2,
    "autoAssignReviewers" BOOLEAN NOT NULL DEFAULT false,
    "enableORCID" BOOLEAN NOT NULL DEFAULT true,
    "enableORCIDAutoFill" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "JournalSetting_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Volume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "publishedAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Volume_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Issue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "volumeId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "publishedAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "doi" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Issue_volumeId_fkey" FOREIGN KEY ("volumeId") REFERENCES "Volume" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "issueId" TEXT NOT NULL,
    "manuscriptId" TEXT,
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
    "publishedAt" DATETIME,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isOpenAccess" BOOLEAN NOT NULL DEFAULT true,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "altmetricScore" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Article_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "Issue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Article_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "email" TEXT,
    "affiliation" TEXT NOT NULL,
    "orcid" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleAuthor_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ArticleAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleReference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "authors" TEXT NOT NULL,
    "journal" TEXT,
    "year" INTEGER,
    "volume" TEXT,
    "issue" TEXT,
    "pages" TEXT,
    "doi" TEXT,
    "pmid" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ArticleReference_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplementaryMaterial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplementaryMaterial_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Citation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "citedArticle" TEXT NOT NULL,
    "citedDoi" TEXT,
    "citedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Citation_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ArticleMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "articleId" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "citations" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "mentions" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ArticleMetric_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Manuscript" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortTitle" TEXT,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "articleType" TEXT NOT NULL,
    "section" TEXT,
    "coverLetter" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedEditorId" TEXT,
    "correspondingAuthorId" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 1,
    "doi" TEXT,
    "submittedVersion" TEXT,
    "acceptedVersion" TEXT,
    "publishedVersion" TEXT,
    "withdrawalReason" TEXT,
    "withdrawnAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Manuscript_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Manuscript_assignedEditorId_fkey" FOREIGN KEY ("assignedEditorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Manuscript_correspondingAuthorId_fkey" FOREIGN KEY ("correspondingAuthorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManuscriptAuthor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "userId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "middleName" TEXT,
    "email" TEXT NOT NULL,
    "affiliation" TEXT NOT NULL,
    "orcid" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isCorresponding" BOOLEAN NOT NULL DEFAULT false,
    "contribution" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManuscriptAuthor_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ManuscriptAuthor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManuscriptFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ManuscriptFile_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ManuscriptVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "abstract" TEXT NOT NULL,
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "fileUrl" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "submittedById" TEXT NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "changeNotes" TEXT,
    CONSTRAINT "ManuscriptVersion_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ManuscriptVersion_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "invitationId" TEXT,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "decision" TEXT,
    "originality" INTEGER,
    "methodology" INTEGER,
    "significance" INTEGER,
    "clarity" INTEGER,
    "commentsToEditor" TEXT,
    "commentsToAuthor" TEXT,
    "confidentialNotes" TEXT,
    "submittedAt" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_invitationId_fkey" FOREIGN KEY ("invitationId") REFERENCES "ReviewInvitation" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReviewInvitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "response" TEXT,
    "respondedAt" DATETIME,
    "dueDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReviewInvitation_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ReviewInvitation_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReviewInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditorialNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "isPrivate" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EditorialNote_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EditorialNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditorialDecision" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "manuscriptId" TEXT NOT NULL,
    "editorId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "notes" TEXT,
    "notesToAuthor" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EditorialDecision_manuscriptId_fkey" FOREIGN KEY ("manuscriptId") REFERENCES "Manuscript" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EditorialDecision_editorId_fkey" FOREIGN KEY ("editorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditorialRole" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EditorialRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EditorialRole_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "journalId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'ANNOUNCEMENT',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Announcement_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "Journal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_orcid_key" ON "User"("orcid");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_token_key" ON "EmailVerification"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_userId_idx" ON "EmailVerification"("userId");

-- CreateIndex
CREATE INDEX "EmailVerification_token_idx" ON "EmailVerification"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_idx" ON "PasswordReset"("userId");

-- CreateIndex
CREATE INDEX "PasswordReset_token_idx" ON "PasswordReset"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_token_idx" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_shortName_key" ON "Journal"("shortName");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_issnPrint_key" ON "Journal"("issnPrint");

-- CreateIndex
CREATE UNIQUE INDEX "Journal_issnOnline_key" ON "Journal"("issnOnline");

-- CreateIndex
CREATE UNIQUE INDEX "JournalSetting_journalId_key" ON "JournalSetting"("journalId");

-- CreateIndex
CREATE INDEX "Volume_journalId_idx" ON "Volume"("journalId");

-- CreateIndex
CREATE UNIQUE INDEX "Volume_journalId_number_key" ON "Volume"("journalId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_doi_key" ON "Issue"("doi");

-- CreateIndex
CREATE INDEX "Issue_volumeId_idx" ON "Issue"("volumeId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_volumeId_number_key" ON "Issue"("volumeId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Article_manuscriptId_key" ON "Article"("manuscriptId");

-- CreateIndex
CREATE UNIQUE INDEX "Article_doi_key" ON "Article"("doi");

-- CreateIndex
CREATE INDEX "ArticleAuthor_articleId_idx" ON "ArticleAuthor"("articleId");

-- CreateIndex
CREATE INDEX "ArticleAuthor_userId_idx" ON "ArticleAuthor"("userId");

-- CreateIndex
CREATE INDEX "ArticleReference_articleId_idx" ON "ArticleReference"("articleId");

-- CreateIndex
CREATE INDEX "SupplementaryMaterial_articleId_idx" ON "SupplementaryMaterial"("articleId");

-- CreateIndex
CREATE INDEX "Citation_articleId_idx" ON "Citation"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "ArticleMetric_articleId_key" ON "ArticleMetric"("articleId");

-- CreateIndex
CREATE UNIQUE INDEX "Manuscript_doi_key" ON "Manuscript"("doi");

-- CreateIndex
CREATE INDEX "Manuscript_journalId_idx" ON "Manuscript"("journalId");

-- CreateIndex
CREATE INDEX "Manuscript_correspondingAuthorId_idx" ON "Manuscript"("correspondingAuthorId");

-- CreateIndex
CREATE INDEX "Manuscript_assignedEditorId_idx" ON "Manuscript"("assignedEditorId");

-- CreateIndex
CREATE INDEX "Manuscript_status_idx" ON "Manuscript"("status");

-- CreateIndex
CREATE INDEX "ManuscriptAuthor_manuscriptId_idx" ON "ManuscriptAuthor"("manuscriptId");

-- CreateIndex
CREATE INDEX "ManuscriptAuthor_userId_idx" ON "ManuscriptAuthor"("userId");

-- CreateIndex
CREATE INDEX "ManuscriptFile_manuscriptId_idx" ON "ManuscriptFile"("manuscriptId");

-- CreateIndex
CREATE INDEX "ManuscriptVersion_manuscriptId_idx" ON "ManuscriptVersion"("manuscriptId");

-- CreateIndex
CREATE INDEX "Review_manuscriptId_idx" ON "Review"("manuscriptId");

-- CreateIndex
CREATE INDEX "Review_reviewerId_idx" ON "Review"("reviewerId");

-- CreateIndex
CREATE INDEX "Review_invitationId_idx" ON "Review"("invitationId");

-- CreateIndex
CREATE INDEX "ReviewInvitation_manuscriptId_idx" ON "ReviewInvitation"("manuscriptId");

-- CreateIndex
CREATE INDEX "ReviewInvitation_reviewerId_idx" ON "ReviewInvitation"("reviewerId");

-- CreateIndex
CREATE INDEX "ReviewInvitation_status_idx" ON "ReviewInvitation"("status");

-- CreateIndex
CREATE INDEX "EditorialNote_manuscriptId_idx" ON "EditorialNote"("manuscriptId");

-- CreateIndex
CREATE INDEX "EditorialDecision_manuscriptId_idx" ON "EditorialDecision"("manuscriptId");

-- CreateIndex
CREATE INDEX "EditorialRole_journalId_idx" ON "EditorialRole"("journalId");

-- CreateIndex
CREATE INDEX "EditorialRole_userId_idx" ON "EditorialRole"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EditorialRole_userId_journalId_role_key" ON "EditorialRole"("userId", "journalId", "role");

-- CreateIndex
CREATE INDEX "Announcement_journalId_idx" ON "Announcement"("journalId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
