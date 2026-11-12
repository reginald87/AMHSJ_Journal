import { prisma } from '@/lib/prisma';

const INACTIVE_STATUSES = ['WITHDRAWN', 'REJECTED'] as const;

export type DuplicateReason = 'file' | 'title';

export interface DuplicateManuscriptMatch {
  id: string;
  title: string;
  status: string;
  reason: DuplicateReason;
}

export function normalizeManuscriptTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

export async function findDuplicateManuscript({
  title,
  fileHash,
  authorId,
  authorEmails = [],
}: {
  title: string;
  fileHash?: string | null;
  authorId?: string;
  authorEmails?: string[];
}): Promise<DuplicateManuscriptMatch | null> {
  const normalizedTitle = normalizeManuscriptTitle(title);
  const emails = Array.from(
    new Set(authorEmails.filter(Boolean).map((email) => email.toLowerCase().trim()))
  );

  if (!fileHash && !authorId && emails.length === 0) return null;

  const candidates = await prisma.manuscript.findMany({
    where: {
      status: { notIn: [...INACTIVE_STATUSES] },
      OR: [
        ...(fileHash ? [{ fileHash }] : []),
        ...(authorId ? [{ correspondingAuthorId: authorId }] : []),
        ...(emails.length ? [{ authors: { some: { email: { in: emails } } } }] : []),
      ],
    },
    select: {
      id: true,
      title: true,
      status: true,
      fileHash: true,
      correspondingAuthorId: true,
      authors: { select: { email: true } },
    },
  });

  for (const candidate of candidates) {
    if (fileHash && candidate.fileHash === fileHash) {
      return { id: candidate.id, title: candidate.title, status: candidate.status, reason: 'file' };
    }

    if (normalizeManuscriptTitle(candidate.title) !== normalizedTitle) continue;

    const sameAuthor =
      (authorId !== undefined && candidate.correspondingAuthorId === authorId) ||
      candidate.authors.some((author) => emails.includes(author.email.toLowerCase().trim()));

    if (sameAuthor) {
      return { id: candidate.id, title: candidate.title, status: candidate.status, reason: 'title' };
    }
  }

  return null;
}
