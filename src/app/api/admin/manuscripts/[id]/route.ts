import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createLogger } from '@/lib/logger';

const logger = createLogger('AdminManuscript');

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      include: {
        correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
        authors: { select: { firstName: true, lastName: true, email: true } },
        assignedEditor: { select: { id: true, firstName: true, lastName: true } },
        files: { select: { id: true, fileName: true, fileUrl: true, fileSize: true, mimeType: true, fileType: true, isPrimary: true, version: true } },
        reviews: { include: { reviewer: { select: { firstName: true, lastName: true } } } },
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    return NextResponse.json(manuscript);
  } catch (error) {
    logger.error('Error fetching manuscript', error);
    return NextResponse.json({ error: 'Failed to fetch manuscript' }, { status: 500 });
  }
}

export async function PATCH(
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
    const { status, assignedEditorId, title, abstract, keywords, coverLetter } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedEditorId !== undefined) {
      updateData.assignedEditorId = assignedEditorId || null;
    }
    if (title !== undefined) updateData.title = title;
    if (abstract !== undefined) updateData.abstract = abstract;
    if (keywords !== undefined) updateData.keywords = typeof keywords === 'string' ? keywords : JSON.stringify(keywords);
    if (coverLetter !== undefined) updateData.coverLetter = coverLetter;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const manuscript = await prisma.manuscript.update({
      where: { id },
      data: updateData,
      select: { id: true, title: true, status: true, assignedEditorId: true, abstract: true, keywords: true, coverLetter: true },
    });

    return NextResponse.json(manuscript);
  } catch (error) {
    logger.error('Error updating manuscript', error);
    return NextResponse.json({ error: 'Failed to update manuscript' }, { status: 500 });
  }
}
