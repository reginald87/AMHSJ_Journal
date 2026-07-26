import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialBoardMember');

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
    const {
      firstName,
      lastName,
      middleName,
      email,
      affiliation,
      department,
      orcid,
      bio,
      role,
      isActive,
    } = body;

    const existing = await prisma.editorialRole.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Editorial role not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: existing.userId },
      data: {
        firstName,
        lastName,
        middleName: middleName || null,
        email,
        affiliation,
        department: department || null,
        orcid: orcid || null,
        bio: bio || null,
      },
    });

    const editorialRole = await prisma.editorialRole.update({
      where: { id },
      data: {
        role,
        isActive,
      },
      include: { user: true },
    });

    return NextResponse.json(editorialRole);
  } catch (error) {
    logger.error('Error updating editorial board member', error);
    return NextResponse.json({ error: 'Failed to update editorial board member' }, { status: 500 });
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
    await prisma.editorialRole.delete({ where: { id } });

    return NextResponse.json({ message: 'Editorial board member removed successfully' });
  } catch (error) {
    logger.error('Error deleting editorial board member', error);
    return NextResponse.json({ error: 'Failed to remove editorial board member' }, { status: 500 });
  }
}
