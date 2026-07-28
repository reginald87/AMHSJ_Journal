import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sendEmail, getDecisionEmailTemplate } from '@/lib/email';
import { createLogger } from '@/lib/logger';

const logger = createLogger('EditorialManuscript');

const ALLOWED_ROLES = ['EDITOR', 'EDITOR_IN_CHIEF', 'DEPUTY_EDITOR_IN_CHIEF', 'ASSOCIATE_EDITOR', 'ADMIN'];

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !ALLOWED_ROLES.includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status, assignedEditorId, notesToAuthor } = body;

    const manuscript = await prisma.manuscript.findUnique({
      where: { id },
      include: {
        correspondingAuthor: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    if (!manuscript) {
      return NextResponse.json({ error: 'Manuscript not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (assignedEditorId !== undefined) {
      updateData.assignedEditorId = assignedEditorId || null;
    }

    const statusChanged = status && status !== manuscript.status;

    const updatedManuscript = await prisma.$transaction(async (tx) => {
      const updated = await tx.manuscript.update({
        where: { id },
        data: updateData,
        select: { id: true, title: true, status: true, assignedEditorId: true },
      });

      if (statusChanged) {
        if (manuscript.status === 'PUBLISHED' && status !== 'PUBLISHED') {
          await tx.article.updateMany({
            where: { manuscriptId: id },
            data: { isPublished: false, publishedAt: null },
          });
        }

        const decisionMap: Record<string, string> = {
          ACCEPTED: 'ACCEPT',
          REJECTED: 'REJECT',
          UNDER_REVISION: 'MAJOR_REVISION',
        };

        const decisionValue = decisionMap[status] || 'MINOR_REVISION';

        await tx.editorialDecision.create({
          data: {
            manuscriptId: id,
            editorId: session.user.id,
            decision: decisionValue as 'ACCEPT' | 'MINOR_REVISION' | 'MAJOR_REVISION' | 'REJECT',
            notesToAuthor: notesToAuthor || null,
          },
        });
      }

      return updated;
    });

    if (statusChanged) {
      const decisionMap: Record<string, string> = {
        ACCEPTED: 'ACCEPT',
        REJECTED: 'REJECT',
        UNDER_REVISION: 'MAJOR_REVISION',
      };
      const decisionValue = decisionMap[status] || 'MINOR_REVISION';

      try {
        const emailTemplate = getDecisionEmailTemplate(
          decisionValue,
          manuscript.id,
          manuscript.title,
          manuscript.correspondingAuthor.firstName,
          notesToAuthor
        );
        await sendEmail({
          to: manuscript.correspondingAuthor.email,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
        });
      } catch (emailError) {
        logger.error('Failed to send decision email', emailError);
      }

      try {
        await prisma.notification.create({
          data: {
            userId: manuscript.correspondingAuthorId,
            type: 'MANUSCRIPT_DECISION',
            title: 'Manuscript Decision',
            message: `A decision has been made on your manuscript "${manuscript.title}". Status: ${status}.`,
            data: JSON.stringify({ manuscriptId: id, decision: status }),
          },
        });
      } catch (notifError) {
        logger.error('Failed to create notification', notifError);
      }
    }

    return NextResponse.json(updatedManuscript);
  } catch (error) {
    logger.error('Error updating manuscript', error);
    return NextResponse.json({ error: 'Failed to update manuscript' }, { status: 500 });
  }
}
