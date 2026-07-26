import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminVolumes');

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const volumes = await prisma.volume.findMany({
      orderBy: { number: 'desc' },
      include: {
        _count: { select: { articles: true } },
      },
    });

    return NextResponse.json(volumes);
  } catch (error) {
    logger.error('Error fetching volumes', error);
    return NextResponse.json({ error: 'Failed to fetch volumes' }, { status: 500 });
  }
}
