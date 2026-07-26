import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AuthorManuscripts');

const ALLOWED_ROLES = ['AUTHOR', 'EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where = { correspondingAuthorId: session.user.id };

    const [manuscripts, total] = await Promise.all([
      prisma.manuscript.findMany({
        where,
        include: {
          journal: { select: { name: true, shortName: true } },
          correspondingAuthor: { select: { firstName: true, lastName: true, email: true } },
          authors: { select: { firstName: true, lastName: true, email: true } },
          assignedEditor: { select: { firstName: true, lastName: true } },
          reviews: { select: { id: true, status: true, decision: true } },
        },
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.manuscript.count({ where }),
    ]);

    return NextResponse.json({
      manuscripts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('Error fetching manuscripts', error);
    return NextResponse.json({ error: 'Failed to fetch manuscripts' }, { status: 500 });
  }
}
