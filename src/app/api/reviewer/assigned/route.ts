import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('ReviewerAssigned');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const [invitations, reviews] = await Promise.all([
      prisma.reviewInvitation.findMany({
        where: {
          reviewerId: userId,
          status: { in: ['PENDING', 'ACCEPTED'] },
        },
        include: {
          manuscript: {
            select: {
              id: true,
              title: true,
              articleType: true,
              status: true,
              submittedAt: true,
              correspondingAuthor: { select: { firstName: true, lastName: true } },
              files: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true, fileType: true, isPrimary: true } },
            },
          },
          invitedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.findMany({
        where: {
          reviewerId: userId,
        },
        include: {
          manuscript: {
            select: {
              id: true,
              title: true,
              articleType: true,
              status: true,
              submittedAt: true,
              correspondingAuthor: { select: { firstName: true, lastName: true } },
              files: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true, fileType: true, isPrimary: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ invitations, reviews });
  } catch (error) {
    logger.error('Error fetching assigned manuscripts', error);
    return NextResponse.json({ error: 'Failed to fetch assigned manuscripts' }, { status: 500 });
  }
}
