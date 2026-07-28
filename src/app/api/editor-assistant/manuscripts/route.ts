import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorAssistantManuscripts');

const ALLOWED_ROLES = ['EDITOR_ASSISTANT', 'ADMIN', 'EDITOR_IN_CHIEF'];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, parseInt(searchParams.get('limit') || '20'));

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    } else {
      where.status = { in: ['ACCEPTED', 'PUBLISHED'] };
    }
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { correspondingAuthor: { firstName: { contains: search } } },
        { correspondingAuthor: { lastName: { contains: search } } },
      ];
    }

    const [manuscripts, total] = await Promise.all([
      prisma.manuscript.findMany({
        where,
        include: {
          correspondingAuthor: { select: { firstName: true, lastName: true, email: true } },
          journal: { select: { name: true, shortName: true } },
          files: { where: { isPrimary: true }, take: 1 },
        },
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.manuscript.count({ where }),
    ]);

    return NextResponse.json({
      manuscripts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    logger.error('Error fetching manuscripts', error);
    return NextResponse.json({ error: 'Failed to fetch manuscripts' }, { status: 500 });
  }
}
