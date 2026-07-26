import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AuthorManuscript');

const ALLOWED_ROLES = ['AUTHOR', 'EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      include: {
        journal: { select: { name: true, shortName: true } },
        correspondingAuthor: { select: { firstName: true, lastName: true, email: true } },
        authors: { select: { firstName: true, lastName: true, email: true } },
        assignedEditor: { select: { firstName: true, lastName: true } },
        reviews: { select: { id: true, status: true, decision: true } },
        files: true,
        versions: true,
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const isAdminOrEditor = ['ADMIN', 'EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR'].includes(session.user.role);
    const isCorrespondingAuthor = manuscript.correspondingAuthorId === session.user.id;

    if (!isCorrespondingAuthor && !isAdminOrEditor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return NextResponse.json(manuscript);
  } catch (error) {
    logger.error('Error fetching manuscript', error);
    return NextResponse.json({ error: 'Failed to fetch manuscript' }, { status: 500 });
  }
}
