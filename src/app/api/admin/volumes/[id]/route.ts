import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminVolume');

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { number, year, title, description, coverImage, isPublished } = body;

    if (number !== undefined) {
      const existing = await prisma.volume.findFirst({
        where: { number: parseInt(number), id: { not: id } },
      });
      if (existing) {
        return NextResponse.json({ error: 'Volume number already exists' }, { status: 400 });
      }
    }

    const volume = await prisma.volume.update({
      where: { id },
      data: {
        number: number ? parseInt(number) : undefined,
        year: year ? parseInt(year) : undefined,
        title,
        description,
        coverImage,
        isPublished: isPublished ?? undefined,
      },
    });

    return NextResponse.json(volume);
  } catch (error) {
    logger.error('Error updating volume', error);
    return NextResponse.json({ error: 'Failed to update volume' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.volume.delete({ where: { id } });

    return NextResponse.json({ message: 'Volume deleted successfully' });
  } catch (error) {
    logger.error('Error deleting volume', error);
    return NextResponse.json({ error: 'Failed to delete volume' }, { status: 500 });
  }
}