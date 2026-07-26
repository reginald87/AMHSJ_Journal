import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialReviewers');

const ALLOWED_ROLES = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const editorialBoard = await prisma.editorialRole.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            middleName: true,
            email: true,
            affiliation: true,
            department: true,
            orcid: true,
          },
        },
      },
      orderBy: [
        { role: 'asc' },
        { user: { lastName: 'asc' } },
      ],
    });

    return NextResponse.json(editorialBoard);
  } catch (error) {
    logger.error('Error fetching reviewers', error);
    return NextResponse.json({ error: 'Failed to fetch reviewers' }, { status: 500 });
  }
}
