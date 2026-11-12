-- AlterTable
ALTER TABLE "Manuscript" ADD COLUMN "fileHash" TEXT;

-- CreateIndex
CREATE INDEX "Manuscript_fileHash_idx" ON "Manuscript"("fileHash");
