import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ReviewerHistory');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: {
        reviewerId: session.user.id,
        status: 'COMPLETED',
      },
      include: {
        manuscript: {
          select: {
            id: true,
            title: true,
            articleType: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    logger.error('Error fetching review history', error);
    return NextResponse.json({ error: 'Failed to fetch review history' }, { status: 500 });
  }
}
